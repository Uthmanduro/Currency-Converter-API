const Country = require('../models/country');
const Metadata = require('../models/metadata');
const { refreshAll } = require('../services/refreshService');
const fs = require('fs');
const path = require('path');
const { APP_CONFIG } = require('../config/appConfig');

function validationErrorResponse(details) {
  return { error: 'Validation failed', details };
}

async function handleRefresh(req, res) {
  try {
    const out = await refreshAll();
    return res.status(200).json({
      message: 'Refresh successful',
      total_countries: out.total,
      last_refreshed_at: out.last_refreshed_at.toISOString(),
    });
  } catch (err) {
    if (err.code === 'EXTERNAL_FAIL') {
      const parsed = JSON.parse(err.message);
      return res.status(503).json(parsed);
    }
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function getCountries(req, res) {
  try {
    const where = {};
    const { region, currency, sort } = req.query;

    if (region) where.region = region;
    if (currency) where.currency_code = currency;

    const order = [];
    if (sort === 'gdp_desc') order.push(['estimated_gdp', 'DESC']);
    if (sort === 'gdp_asc') order.push(['estimated_gdp', 'ASC']);

    const countries = await Country.findAll({ where, order });
    return res.json(countries);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function getCountryByName(req, res) {
  try {
    const name = req.params.name;
    const country = await Country.findOne({
      where: Country.sequelize.where(
        Country.sequelize.fn('lower', Country.sequelize.col('name')),
        name.toLowerCase()
      ),
    });
    if (!country) return res.status(404).json({ error: 'Country not found' });
    return res.json(country);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function deleteCountry(req, res) {
  try {
    const name = req.params.name;
    const country = await Country.findOne({
      where: Country.sequelize.where(
        Country.sequelize.fn('lower', Country.sequelize.col('name')),
        name.toLowerCase()
      ),
    });
    if (!country) return res.status(404).json({ error: 'Country not found' });

    await country.destroy();
    return res.status(204).json({});
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function getStatus(req, res) {
  try {
    const total_countries = await Country.count();
    const lastMeta = await Metadata.findByPk('last_refreshed_at');
    return res.json({
      total_countries,
      last_refreshed_at: lastMeta ? lastMeta.value : null,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function getImage(req, res) {
  const p = APP_CONFIG.CACHE_IMAGE_PATH || 'cache/summary.png';
  if (!fs.existsSync(p)) {
    return res.status(404).json({ error: 'Summary image not found' });
  }
  return res.sendFile(path.resolve(p));
}

module.exports = {
  handleRefresh,
  getCountries,
  getCountryByName,
  deleteCountry,
  getStatus,
  getImage,
};
