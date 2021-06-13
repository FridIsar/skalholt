# Skalhólt web-portal backend

## Format:

* `/sql`, scripts to construct or reset the database
* `/src/api`, API for the dig site
* `/src/auth`, API for user authentication
* `/src/tests`, integration tests
* `/src/utils`, helper functions
* `/src/validation`, validator functions
* `/src/app.js`, core express router
* `/src/db.js`, database functions

## To run the development project:

* Create a local postgre database with `createdb`
* Add the necessary environment variables in `.env` see: `.env.example`
* Run `npm run dev` while in the `skalholt/backend` directory