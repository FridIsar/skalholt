# Skalhólt web-portal backend

## To run the backend:
```
createdb skalholt
# Update .env, see .env.environment
npm run setup # This updates the database with the information present in /data
npm run dev   # This spins up the dev environment
npm run test  # This runs integration tests ( as well as setup and teardown )
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

* Database state can be reset using `npm run setup`
* Testcases can be run on the current state of the project using `npm run testcases`
* Post test cleanups and removing of temporary files can be done using `npm run teardown`
* All of the above can be run in combination with `npm run test`, this will restore the database to its original state, run testcases and then teardown when tests finish.

* Note 1: The teardown script within `npm run test` is not properly executed if testcases fail due to a runtime exception, if this is the case the original state can be restored by running `npm run teardown` after the testcases fail.
* Note 2: Some testcases such as failed login make logfile entries, the decision was to not reset logfiles automatically on teardown as this can provide information for debugging.

## Logging:

`winston` is used for logging.

Logs are written out into `app.log` and, if the LOG_LEVEL is set to verbose or the project is in a dev environment, to `debug.log`