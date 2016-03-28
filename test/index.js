var decache = require('decache')

afterEach(function(){
  decache('knex')
})

describe('Knex Generic Errors', function() {
  require('./unit')
})