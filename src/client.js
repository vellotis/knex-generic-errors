var errors = require('./errors')

import { pick } from 'lodash'

module.exports = function(origClient) {
  var orig
  var overrides = {
    query: function(connection, obj) {
      var client = this
      return orig.query.apply(this, arguments)
        .catch((err) => {
          if (client._convertError) {
            err = client._convertError(err)
          }
          err = new errors.QueryError(err.message, err, {sql: obj.sql, bindings: obj.bindings})
          throw err
        })
    },

    acquireConnection: function() {
      var client = this
      return orig.acquireConnection.apply(this, arguments)
        .catch((err) => {
          if (this._convertError) {
            err = client._convertError(err)
          }
          throw err
        })
    }
  }

  orig = pick(origClient, Object.keys(overrides))

  return overrides;
}