# **Country Data Management API** 🌍

## Overview
A robust RESTful API built with Node.js, Express, and Sequelize, designed to fetch, store, and manage comprehensive country data. It integrates with external APIs to provide up-to-date information, persisting it efficiently in a MySQL database. Dive into a world of global data with this powerful API! 📊 It seamlessly gathers country information from external sources, stores it efficiently, and offers a suite of endpoints for robust data retrieval and management. Explore, filter, and analyze country-specific details, all while keeping your data fresh and accessible.

## Features
-   **Data Ingestion**: Automatically fetches and processes comprehensive country data (population, capital, region, flag, currency) from external APIs.
-   **Dynamic Exchange Rates**: Integrates with an external exchange rate API to provide current currency conversion rates against USD.
-   **Estimated GDP Calculation**: Dynamically calculates an estimated GDP for each country based on population and exchange rates.
-   **Data Persistence**: Stores all country and metadata within a MySQL database using Sequelize ORM, ensuring reliable data storage.
-   **On-Demand Data Refresh**: Provides a dedicated endpoint to manually trigger a full refresh of all country data from external sources, ensuring data freshness.
-   **Comprehensive Data Retrieval**: Offers flexible endpoints to query countries by name, region, currency, and allows sorting by estimated GDP.
-   **Dynamic Image Generation**: Generates a summary image (`summary.png`) showcasing total countries and the top 5 countries by estimated GDP, accessible via an API endpoint.
-   **Data Deletion**: Allows secure deletion of specific country records from the database by name.
-   **API Status Monitoring**: Provides an endpoint to check the current status of the API, including total countries stored and the timestamp of the last data refresh.

## Getting Started
To get this project up and running on your local machine, follow these steps.

### Installation
1.  **Clone the repository**:
    ```bash
    git clone https://github.com/Uthmanduro/Currency-Converter-API.git
    ```
2.  **Navigate into the project directory**:
    ```bash
    cd Currency-Converter-API
    ```
3.  **Install dependencies**:
    ```bash
    npm install
    ```
4.  **Database Setup**: Ensure you have a MySQL server running. Create a new database for the project (e.g., `country_db`). The application will synchronize models on startup.

### Environment Variables
Create a `.env` file in the root directory of the project and populate it with the following required variables:

-   `PORT`: The port on which the server will listen for incoming requests.
    -   Example: `PORT=3000`
-   `DATABASE_URL`: Your MySQL connection string, including user, password, host, port, and database name.
    -   Example: `DATABASE_URL=mysql://user:password@localhost:3306/your_database_name`
-   `CACHE_IMAGE_PATH`: The relative path where the dynamically generated summary image will be stored.
    -   Example: `CACHE_IMAGE_PATH=cache/summary.png`

## How to Use
After successfully installing dependencies and configuring environment variables, you can start the API server and interact with its endpoints.

1.  **Start the server**:
    ```bash
    node app.js
    ```
    The server will initiate, typically on port 3000 (or the port you've configured in your `.env` file). You should see a confirmation message in your console, such as `Server listening on port 3000`.

2.  **Interact with the API**: You can use various tools like cURL, Postman, Insomnia, or directly your web browser (for GET requests) to send requests to the documented API endpoints. Ensure the server is running before attempting to send requests.

## API Documentation

### Base URL
`http://localhost:3000` (or your configured host and port)

### Endpoints

#### `POST /countries/refresh`
Triggers a full refresh of country data from external APIs, updating existing records, creating new ones, and regenerating the summary image. This process might take a few moments.

**Request**:
No request body required.

**Response**:
```json
{
  "message": "Refresh successful",
  "total_countries": 250,
  "last_refreshed_at": "2023-10-27T10:00:00.000Z"
}
```

**Errors**:
-   `503 Service Unavailable`: `{"error": "External data source unavailable", "details": "Could not fetch data from Countries API"}` (if one of the integrated external APIs is unreachable or unresponsive).
-   `500 Internal Server Error`: Generic server error that occurred during the refresh process.

#### `GET /countries`
Retrieves a list of all countries stored in the database. Supports filtering by region or currency, and sorting by estimated GDP.

**Request**:
Query Parameters (all are optional):
-   `region`: Filter countries by their geographical region (e.g., `Europe`, `Africa`).
-   `currency`: Filter countries by their primary currency code (e.g., `USD`, `EUR`).
-   `sort`: Specify the sorting order for the results.
    -   `gdp_desc`: Sort by `estimated_gdp` in descending order.
    -   `gdp_asc`: Sort by `estimated_gdp` in ascending order.
No request body required.

**Example Request**:
```bash
curl "http://localhost:3000/countries?region=Europe&sort=gdp_desc"
```

**Response**:
```json
[
  {
    "id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
    "name": "Germany",
    "capital": "Berlin",
    "region": "Europe",
    "population": 83000000,
    "currency_code": "EUR",
    "exchange_rate": 0.95,
    "estimated_gdp": 4000000000000,
    "flag_url": "https://flagcdn.com/de.svg",
    "last_refreshed_at": "2023-10-27T10:00:00.000Z"
  },
  {
    "id": "b1c2d3e4-f5a6-0987-6543-210fedcba987",
    "name": "France",
    "capital": "Paris",
    "region": "Europe",
    "population": 65000000,
    "currency_code": "EUR",
    "exchange_rate": 0.95,
    "estimated_gdp": 3000000000000,
    "flag_url": "https://flagcdn.com/fr.svg",
    "last_refreshed_at": "2023-10-27T10:00:00.000Z"
  }
]
```

**Errors**:
-   `500 Internal Server Error`: Generic server error during data retrieval or processing.

#### `GET /countries/image`
Retrieves the dynamically generated summary image, which displays the total number of countries and the top 5 countries by estimated GDP.

**Request**:
No request body required.

**Response**:
A PNG image file will be streamed directly as the response body.

**Example Request**:
```bash
curl -o summary.png "http://localhost:3000/countries/image"
```

**Errors**:
-   `404 Not Found`: `{"error": "Summary image not found"}` (if the image has not yet been generated via a refresh operation, or if the `CACHE_IMAGE_PATH` is incorrect).
-   `500 Internal Server Error`: Generic server error during image processing or retrieval.

#### `GET /countries/:name`
Retrieves detailed information for a single country by its name. The search is case-insensitive.

**Request**:
Path Parameter:
-   `name`: The full name of the country (e.g., `Germany`, `United States`).
No request body required.

**Example Request**:
```bash
curl "http://localhost:3000/countries/germany"
```

**Response**:
```json
{
  "id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
  "name": "Germany",
  "capital": "Berlin",
  "region": "Europe",
  "population": 83000000,
  "currency_code": "EUR",
  "exchange_rate": 0.95,
  "estimated_gdp": 4000000000000,
  "flag_url": "https://flagcdn.com/de.svg",
  "last_refreshed_at": "2023-10-27T10:00:00.000Z"
}
```

**Errors**:
-   `404 Not Found`: `{"error": "Country not found"}` (if no country matching the provided name is found in the database).
-   `500 Internal Server Error`: Generic server error during data retrieval.

#### `DELETE /countries/:name`
Deletes a single country record from the database based on its name. The deletion is case-insensitive.

**Request**:
Path Parameter:
-   `name`: The full name of the country to be deleted (e.g., `Germany`).
No request body required.

**Example Request**:
```bash
curl -X DELETE "http://localhost:3000/countries/germany"
```

**Response**:
`204 No Content` (A successful deletion operation returns an empty response body with a 204 status code, indicating that the request has been fulfilled and there is no content to send back).

**Errors**:
-   `404 Not Found`: `{"error": "Country not found"}` (if no country matching the provided name exists in the database).
-   `500 Internal Server Error`: Generic server error during the deletion process.

#### `GET /status`
Retrieves the current operational status of the API, providing key metrics such as the total count of countries stored and the timestamp of the last successful data refresh.

**Request**:
No request body required.

**Example Request**:
```bash
curl "http://localhost:3000/status"
```

**Response**:
```json
{
  "total_countries": 250,
  "last_refreshed_at": "2023-10-27T10:00:00.000Z"
}
```

**Errors**:
-   `500 Internal Server Error`: Generic server error during status retrieval.

## Technologies Used
This project leverages a modern Node.js ecosystem for its robust backend capabilities, ensuring efficiency, scalability, and maintainability.

| Technology    | Description                                                     | Link                                      |
| :------------ | :-------------------------------------------------------------- | :---------------------------------------- |
| **Node.js**   | A JavaScript runtime built on Chrome's V8 JavaScript engine.    | [nodejs.org](https://nodejs.org/)         |
| **Express.js**| A fast, unopinionated, minimalist web framework for Node.js.    | [expressjs.com](https://expressjs.com/)   |
| **Sequelize** | A promise-based Node.js ORM for MySQL, PostgreSQL, SQLite, and MSSQL. | [sequelize.org](https://sequelize.org/)   |
| **MySQL2**    | An asynchronous MySQL client for Node.js, utilized by Sequelize. | [github.com/sidorares/node-mysql2](https://github.com/sidorares/node-mysql2) |
| **Axios**     | A popular promise-based HTTP client for the browser and Node.js. | [axios-http.com](https://axios-http.com/) |
| **Dotenv**    | A zero-dependency module that loads environment variables from a `.env` file. | [www.npmjs.com/package/dotenv](https://www.npmjs.com/package/dotenv) |
| **Canvas**    | A Node.js graphics API that implements the W3C Canvas Standard. | [www.npmjs.com/package/canvas](https://www.npmjs.com/package/canvas) |

## Contributing
We warmly welcome contributions to enhance this project! If you'd like to contribute, please follow these guidelines to ensure a smooth collaboration:

*   🍴 **Fork the repository**: Start by forking the project to your own GitHub account.
*   🌿 **Create a new branch**: For each new feature or bug fix, create a dedicated branch.
    ```bash
    git checkout -b feature/your-feature-name
    ```
*   ✨ **Make your changes**: Implement your modifications, ensuring they adhere to the existing code style and pass all tests.
*   📝 **Commit your changes**: Write clear and concise commit messages.
    ```bash
    git commit -m 'feat: Add new feature for country GDP calculation'
    ```
*   🚀 **Push to your branch**: Upload your changes to your forked repository.
    ```bash
    git push origin feature/your-feature-name
    ```
*   📬 **Open a Pull Request**: Submit a pull request to the main repository, providing a detailed description of your changes and why they are necessary.

## License
This project is licensed under the ISC License. You can find the full license text [here](https://opensource.org/licenses/ISC).

## Author
**Uthman Durosinlohun**

*   LinkedIn: [Your_LinkedIn_Profile]
*   Twitter: [Your_Twitter_Handle]

---

## Project Status

[![Node.js Version](https://img.shields.io/badge/Node.js-18.x-brightgreen)](https://nodejs.org/)
[![Express.js Version](https://img.shields.io/badge/Express.js-5.x-blue)](https://expressjs.com/)
[![Sequelize Version](https://img.shields.io/badge/Sequelize-6.x-blue)](https://sequelize.org/)
[![Database-MySQL](https://img.shields.io/badge/Database-MySQL-orange)](https://www.mysql.com/)
[![License](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Project Version](https://img.shields.io/badge/Version-1.0.0-informational)](https://github.com/Uthmanduro/Currency-Converter-API/releases)

[![Readme was generated by Dokugen](https://img.shields.io/badge/Readme%20was%20generated%20by-Dokugen-brightgreen)](https://www.npmjs.com/package/dokugen)