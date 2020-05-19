# General description

Listens on `GET /` route for health check/app status.

Listens on `POST /routes/best-alternative` for finding best routing alternative according to specification.

Default port is 3000.

Requires the `x-secret` header according to specification.

# Prerequisites

- Node.js

## Install

`npm install`

## Build

`npm run build`

## Run 

Run in dev mode (watching for changes and re-building on save) `npm run dev-start`

Run in production mode `npm start`.

## Test

`npm test`

## Configuration

To set the ENV variables, either set them in your environment, or copy `.env.example` file to `.env` - the application uses `dotenv` package and will load ENV variables from there.
