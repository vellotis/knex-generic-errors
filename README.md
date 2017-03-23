# [knex-generic-errors](https://github.com/vellotis/knex-generic-errors)  [![Build Status](https://travis-ci.org/vellotis/knex-generic-errors.svg?branch=master)](https://travis-ci.org/vellotis/knex-generic-errors)

A module for [knex.js](http://knexjs.org) that enables using more detailed "typed" errors instead of plain javascript [`Error`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error).

Supported knex versions:
- ^0.10
- ^0.11
- ^0.12

Supported dialects:
- [ ] MariaDB ([mariasql](https://www.npmjs.com/package/mariasql))
- [ ] MSSQL ([mssql](https://www.npmjs.com/package/mssql))
- MySQL
 - [x] [mysql](https://www.npmjs.com/package/mysql)
 - [x] [mysql2](https://www.npmjs.com/package/mysql2)
- Oracle
  - [ ] [oracle](https://www.npmjs.com/package/oracle)
  - [ ] [strong-oracle](https://www.npmjs.com/package/strong-oracle)
- [ ] PostgreSQL ([pg](https://www.npmjs.com/package/pg))
- [ ] SQLite ([sqlite3](https://www.npmjs.com/package/sqlite3))

## Installation

```sh
$ npm install knex-generic-errors --save-dev
```

## Usage

As Knex actually doesn't have an API for plugins this module has to be used as seen below.

```js
var Knex = require('knex');
var knexGenericErrors = require('knex-generic-errors');

// Wrap Knex initializer
var knex = knexGenericErrors.attach(Knex, function() {
  // Initialize Knex
  return Knex(/* connection configuration */);
});

// Use `knex`
knex.raw('SELECT * FROM')
.catch(Knex.Errors.QueryError, function(err){
	/* eg. log query error */
});

knexGenericErrors.Errors === Knex.Errors; // true
knex.Errors === Knex.Errors; // true
```

## API

### knex-generic-errors

<table>
  <thead>
    <tr>
      <th>Method/Property</th>
      <th>Arguments</th>
      <th>Returns</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><a name="attach(knex, knexInstanceResolver)"></a><b>attach(knex, knexInstanceResolver)</b></td>
      <td>
      	<dl>
          <dt>knex</dt>
          <dd>Knex initializer method</dd>

          <dt>knexInstanceResolver</dt>
          <dd>
            <span>A function that gets executed internally to receive initialized knex instance.</span>
            <dl>
              <dt>-</dt>
              <dd>-</dd>
            </dl>
          </dd>
        </dl>
      </td>
      <td>
      	<dl>
          <dt>knexInstance</dt>
          <dd>
            An initialized knex instance.
          </dd>
        </dl>
      </td>
      <td>Enables more detailed errors on Knex and knex instance</td>
    </tr>
    <tr>
      <td><a name="knex-generic-errors-Errors"></a><b>Errors</b></td>
      <td>-</td>
      <td>-</td>
      <td>Property that holds error types. Error types listed under <a href="#errors">Errors</a></td>
    </tr>
  </tbody>
</table>

### Errors

Following errors can be accessed through knex-generic-errors property <a href="#knex-generic-errors-Errors">Errors</a>
or after attaching to instance from `Knex.Errors` or knex instance `knex.Errors` property.

<table>
  <thead>
    <tr>
      <th>Error</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><a name="ConnectionError"></a><b>ConnectionError</b></td>
      <td>Is thrown if any connection error occurs between knex and database</td>
    </tr>
    <tr>
      <td><a name="QueryError"></a><b>QueryError</b></td>
      <td>Is thrown if invalid query was executed</td>
    </tr>
    <tr>
      <td><a name="DatabaseError"></a><b>DatabaseError</b></td>
      <td>Is thrown if database internal error occurs</td>
    </tr>
  </tbody>
</table>

## Running Tests
Tests can be runned without any database in place.

```sh
$ npm install
$ npm test
```

### Copyright and License

Copyright Kaarel Raspel, 2016

[MIT Licence](LICENSE)
