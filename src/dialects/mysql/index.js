var errorPredicates = require('./errors')
var errors = require('../../errors')

import { isFunction } from 'lodash'

module.exports = function(origClient) {
  return {
    _convertError: function convertError(err, callback) {
      if (errorPredicates.ConnectionError(err)) {
        err = new errors.ConnectionError('Could not connect to the database', err)
      } else if (errorPredicates.MysqlProtocolError(err) || errorPredicates.NetworkError(err)) {
        err = new errors.ConnectionError('Database connection dropped', err)
      }

      if (isFunction(callback)) {
        return callback(err)
      }
      return err
    }
  }
}