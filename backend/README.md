# Skalhólt web-portal backend

## To run the development project:
```
createdb skalholt
# Update .env, see .env.environment
npm run setup # This updates the database with the information present in /data
npm run dev   # This spins up the dev environment
npm run test  # This runs integration tests
```

## Format:

* `/data`, csv and svg data used for the routes
* `/sql`, scripts to construct or reset the database
* `/src/api`, API for the dig site
* `/src/auth`, API for user authentication
* `/src/tests`, integration tests for the entire api
* `/src/utils`, helper functions
* `/src/validation`, validator functions
* `/src/app.js`, core express router
* `/src/db.js`, database functions

In addition to the above there is a temporary folder `/temp` which is used to store multer uploads before they are optimized

## Testing:

The format of the project allows to quickly regenerate the database with `npm run setup` for the purpose of testing.

It is possible to run tests while developing by using `npm run test -- --watch`

## Logging:

`winston` is used for logging.

Logs are written out into `app.log` and, if the LOG_LEVEL is set to verbose or the project is in a dev environment, to `debug.log`