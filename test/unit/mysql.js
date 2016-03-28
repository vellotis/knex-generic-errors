var knexGenericErrors = require('../..')
var sinon = require('sinon')
require('should')
require('should-sinon')


var spies = {
  emit: null,
  _query: null,
  acquire: null
}

var knex, Knex, connection, obj

describe('MySQL dialect', function() {
  beforeEach(function () {
    knex = require('knex')

    knex.Client.prototype.initializePool = function() { this.pool = { on: function() {} } }
    Knex = knexGenericErrors.attach(knex, function() {
      return knex({
        client: 'mysql',
        connection: {
          host     : '127.0.0.1',
          user     : 'your_database_user',
          password : 'your_database_password',
          database : 'myapp_test'
        }
      })
    })
    Knex.client.emit = spies.emit = sinon.spy()
    Knex.client._query = spies._query = sinon.stub()
    Knex.client.pool.acquire = spies.acquire = sinon.stub()
  })

  afterEach(function() {
    Knex = knex = null
  })

  // when general errors functionality attached
  describe('query() method internal _query() call', function() {
    beforeEach(function() {
      connection = {__knexUid: 'randomUid'}
      obj = { randomKey: 'randomValue' }
    })

    it('should throw QueryError with cause ConnectionError for ESOCKETTIMEDOUT', sinon.test(function (done) {
      obj['sql'] = 'select * from random'

      spies._query.withArgs(connection, obj).returns(Knex.Promise.try(function () {
        var err = new Error('As expected')
        err.code = 'ESOCKETTIMEDOUT'
        throw err
      }))

      Knex.client.query(connection, obj).then(function() {
          throw new Error('Should fail')
        }, function(err) {
          err.should.be.instanceOf(knex.Errors.QueryError)
          err.message.should.be.equal('Could not connect to the database')
          err.cause.should.be.instanceOf(knex.Errors.ConnectionError)
          err.cause.message.should.be.equal('Could not connect to the database')
          spies.emit.should.be.calledWith('query', sinon.match(obj))
          spies._query.should.be.calledWith(connection, obj)
          done()
        })
    }))

    it('should throw QueryError with cause ConnectionError for PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR', sinon.test(function (done) {
      obj['sql'] = 'select * from random'

      spies._query.withArgs(connection, obj).returns(Knex.Promise.try(function () {
        var err = new Error('As expected')
        err.code = 'PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR'
        throw err
      }))

      Knex.client.query(connection, obj).then(function() {
          throw new Error('Should fail')
        }, function(err) {
          err.should.be.instanceOf(knex.Errors.QueryError)
          err.message.should.be.equal('Database connection dropped')
          err.cause.should.be.instanceOf(knex.Errors.ConnectionError)
          err.cause.message.should.be.equal('Database connection dropped')
          spies.emit.should.be.calledWith('query', sinon.match(obj))
          spies._query.should.be.calledWith(connection, obj)
          done()
        })
    }))
  })

  describe('acquireConnection() method internal pool.acquire() call', function() {
    beforeEach(function() {
      connection = {__knexUid: 'randomUid'}
    })

    it('should throw ConnectionError for ESOCKETTIMEDOUT', sinon.test(function (done) {
      var err = new Error('As expected')
      err.code = 'ESOCKETTIMEDOUT'
      spies.acquire.withArgs(sinon.match.func).yields(err, null)

      Knex.client.acquireConnection().then(function() {
          throw new Error('Should fail')
        }, function(err) {
          err.should.be.instanceOf(knex.Errors.ConnectionError)
          err.message.should.be.equal('Could not connect to the database')
          spies.acquire.should.be.calledWith(sinon.match.func)
          done()
        })
    }))

    it('should throw ConnectionError for PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR', sinon.test(function (done) {
      var err = new Error('As expected')
      err.code = 'PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR'
      spies.acquire.withArgs(sinon.match.func).yields(err, null)

      Knex.client.acquireConnection().then(function() {
          throw new Error('Should fail')
        }, function(err) {
          err.should.be.instanceOf(knex.Errors.ConnectionError)
          err.message.should.be.equal('Database connection dropped')
          spies.acquire.should.be.calledWith(sinon.match.func)
          done()
        })
    }))
  })
})