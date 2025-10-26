const { config } = require('dotenv');

config();

const envVariables = {
  PORT: 'PORT',
  DATABASE_URL: 'DATABASE_URL',
  CACHE_IMAGE_PATH: 'CACHE_IMAGE_PATH',
};

const getEnv = (key) => {
  const envKey = envVariables[key];

  const foundEnv = process.env[envKey];

  const message = `${envKey} was not found`;

  if (!foundEnv) {
    console.log(message);
    throw Error(message);
  }

  return foundEnv;
};

const APP_CONFIG = {
  PORT: getEnv('PORT'),
  DATABASE_URL: getEnv('DATABASE_URL'),
  CACHE_IMAGE_PATH: getEnv('CACHE_IMAGE_PATH'),
};

module.exports = { APP_CONFIG };
