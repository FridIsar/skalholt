# Skalhólt web-portal backend

## To run the backend:

The main things to keep in mind when deploying or developing the project are the following:

* A local `PostgreSQL` database is required - this can have any name
* Environment variables must be set through `.env` or the platform equivalent
  - An example of what variables are required can be seen in the `.env.example` file
  - The value of the DATABASE_URL obviously depends on what the name of the local database is
* Dependencies need to be installed with `npm install`
* The database needs to be set up using `npm run setup`

### Additional tools

* A verbose dev version can be started using `npm run dev`
* A standard version can be started using `npm run start`
* Test cases can be run using `npm run test`
  - Note: This requires dev dependencies and will not work on an explicit production setup
* Database and shared file reset is available through `npm run teardown`

Since the project is not built around an overarching framework no explicit build script is required.

### The admin account

The development build has a hard-coded admin user that is quite a severe security risk. This account should either not be inserted into the database or removed from the database before the back-end is officially deployed.

A more suitable replacement should be used instead.

### Limitation of scope

The current development build has some routes that are either unused or not entirely finished.

**Out of scope routes:**

* `DELETE: /years/:yearId`
* `DELETE: /years/:yearId/buildings/:buildingId`
* `POST: /users/register`

**Unfinished routes:**

* `POST: /years`
* `POST: /years/:yearId/buildings`

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