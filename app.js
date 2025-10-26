const express = require('express');
const Country = require('./src/models/country');
const Metadata = require('./src/models/metadata');
const sequelize = require('./src/config/dbConfig');
const controllers = require('./src/controllers/countries');
const APP_CONFIG = require('./src/config/appConfig');

const app = express();
app.use(express.json());

// endpoints
app.post('/countries/refresh', controllers.handleRefresh);
app.get('/countries', controllers.getCountries);
app.get('/countries/image', controllers.getImage);
app.get('/countries/:name', controllers.getCountryByName);
app.delete('/countries/:name', controllers.deleteCountry);
app.get('/status', controllers.getStatus);

// error JSON defaults
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

async function init() {
  await sequelize.authenticate();
  // sync models
  await Country.sync();
  await Metadata.sync();
}

const PORT = APP_CONFIG.PORT || 3000;

init()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to start', err);
  });
