var clientOverrider = require('./client')
var errors = require('./errors')

import { assign } from 'lodash'

module.exports.Errors = errors
module.exports.attach = function(knex, handler) {
  knex.Errors = errors

  var Knex = handler()
  Knex.errors = errors

  var client = Knex.client
  var dialectName = client.dialect
  var dialectOverrider = require('./dialects/' + dialectName)
  
  assign(client, clientOverrider(client), dialectOverrider(client))

  return Knex
}
