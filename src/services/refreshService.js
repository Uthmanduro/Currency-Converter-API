const axios = require('axios');
const Country = require('../models/country');
const Metadata = require('../models/metadata');
const sequelize = require('../config/dbConfig');
const { generateSummaryImage } = require('../utils/image');
const path = require('path');

const COUNTRIES_API =
  'https://restcountries.com/v2/all?fields=name,capital,region,population,flag,currencies';
const RATES_API = 'https://open.er-api.com/v6/latest/USD';
const CACHE_IMAGE_PATH = 'cache/summary.png';

function randMultiplier() {
  return Math.floor(Math.random() * (2000 - 1000 + 1)) + 1000;
}

async function fetchExternalData() {
  // parallel fetch
  const [countriesRes, ratesRes] = await Promise.all([
    axios.get(COUNTRIES_API, { timeout: 15000 }),
    axios.get(RATES_API, { timeout: 15000 }),
  ]);
  return { countries: countriesRes.data, rates: ratesRes.data };
}

async function refreshAll() {
  // 1. fetch
  let fetched;
  try {
    fetched = await fetchExternalData();
  } catch (err) {
    const which =
      err.config && err.config.url ? err.config.url : 'external API';
    const name = which.includes('restcountries')
      ? 'Countries API'
      : which.includes('open.er-api')
      ? 'Exchange rates API'
      : which;
    const message = {
      error: 'External data source unavailable',
      details: `Could not fetch data from ${name}`,
    };
    const errObj = new Error(JSON.stringify(message));
    errObj.code = 'EXTERNAL_FAIL';
    throw errObj;
  }

  const countriesRaw = fetched.countries;
  const ratesObj =
    fetched.rates && fetched.rates.rates ? fetched.rates.rates : {};

  // 2. build records in memory
  const now = new Date();
  const records = countriesRaw.map((c) => {
    const currencyArr = Array.isArray(c.currencies) ? c.currencies : [];
    const currency_code = currencyArr.length
      ? currencyArr[0].code || null
      : null;

    let exchange_rate = null;
    let estimated_gdp = null;
    if (!currency_code) {
      exchange_rate = null;
      estimated_gdp = 0; // per spec if currencies array empty -> estimated_gdp = 0
    } else {
      const rate = ratesObj[currency_code];
      if (typeof rate !== 'undefined') {
        exchange_rate = rate;
        const multiplier = randMultiplier();
        estimated_gdp =
          (Number(c.population || 0) * multiplier) / exchange_rate;
      } else {
        exchange_rate = null;
        estimated_gdp = null;
      }
    }

    return {
      name: c.name,
      capital: c.capital || null,
      region: c.region || null,
      population: c.population || 0,
      currency_code,
      exchange_rate,
      estimated_gdp,
      flag_url: c.flag || null,
      last_refreshed_at: now,
    };
  });

  // 3. Batch upsert (instead of looping)
  const transaction = await sequelize.transaction();
  try {
    // Fetch existing names (case-insensitive match)
    const existingCountries = await Country.findAll({
      attributes: ['id', 'name'],
      transaction,
    });

    const existingMap = new Map(
      existingCountries.map((c) => [c.name.toLowerCase(), c.id])
    );

    const toUpdate = [];
    const toInsert = [];

    for (const rec of records) {
      if (existingMap.has(rec.name.toLowerCase())) {
        rec.id = existingMap.get(rec.name.toLowerCase());
        toUpdate.push(rec);
      } else {
        toInsert.push(rec);
      }
    }

    // Bulk create new countries
    if (toInsert.length) {
      await Country.bulkCreate(toInsert, { transaction });
    }

    // Bulk update existing ones
    for (const rec of toUpdate) {
      await Country.update(rec, { where: { id: rec.id }, transaction });
    }

    // Update metadata once
    await Metadata.upsert(
      { key: 'last_refreshed_at', value: now.toISOString() },
      { transaction }
    );

    await transaction.commit();
  } catch (err) {
    await transaction.rollback();
    throw err;
  }

  // generate summary image (no db modification here)
  // compute total and top5
  const total = records.length;
  const top5 = records
    .filter((r) => r.estimated_gdp && typeof r.estimated_gdp === 'number')
    .sort((a, b) => b.estimated_gdp - a.estimated_gdp)
    .slice(0, 5)
    .map((r) => ({ name: r.name, estimated_gdp: r.estimated_gdp }));

  await generateSummaryImage({ total, top5, timestamp: now }, CACHE_IMAGE_PATH);

  return { total, last_refreshed_at: now };
}

module.exports = { refreshAll };
