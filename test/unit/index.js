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

module.exports = function (knexPath, version) {

  describe('Unit tests', function() {
    describe('when general errors functionality not attached', function() {
      beforeEach(function() {
        knex = require(knexPath)

        knex.Client.prototype.initializePool = function() { this.pool = { on: function() {} } }
        Knex = knex({
          client: 'mysql',
          connection: {
            host     : '127.0.0.1',
            user     : 'your_database_user',
            password : 'your_database_password',
            database : 'myapp_test'
          }
        })
        Knex.client.emit = spies.emit = sinon.spy()
        Knex.client._query = spies._query = sinon.stub()
        Knex.client.pool.acquire = spies.acquire = sinon.stub()
      })

      afterEach(function() {
        Knex = knex = null
      })

      describe('query() method internal _query() call', function() {
        beforeEach(function() {
          connection = {__knexUid: 'randomUid'}
          obj = { randomKey: 'randomValue' }
        })

        it('should return query response', sinon.test(function(done) {
          spies._query.withArgs(connection, obj).returns(Knex.Promise.resolve(connection))

          Knex.client.query(connection, obj).then(function(conn) {
            conn.should.be.eql(connection)
            spies.emit.should.be.calledWith('query', sinon.match(obj))
            spies._query.should.be.calledWith(connection, obj)
            done()
          })
        }))

        it('should throw native Error', sinon.test(function (done) {
          obj['sql'] = 'select * from random'

          spies._query.withArgs(connection, obj).returns(Knex.Promise.try(function () {
            throw new Error('As expected')
          }))

          Knex.client.query(connection, obj).then(function() {
              throw new Error('Should fail')
            }, function(err) {
              err.should.be.instanceOf(Error)
              err.should.not.be.instanceOf(knexGenericErrors.Errors.QueryError)
              err.message.should.be.equal(obj.sql + ' - ' + 'As expected')
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

        it('should return connection', sinon.test(function(done) {
          spies.acquire.withArgs(sinon.match.func).yields(null, connection)

          var objOrPromise = Knex.client.acquireConnection();
          (function () {
            return objOrPromise.completed || objOrPromise 
          })().then(function(conn) {
            conn.should.be.eql(connection)
            spies.acquire.should.be.calledWith(sinon.match.func)
            done()
          })
        }))

        it('should throw native Error', sinon.test(function (done) {
          spies.acquire.withArgs(sinon.match.func).yields(new Error('As expected'), null)

          var objOrPromise = Knex.client.acquireConnection();
          (function () {
            return objOrPromise.completed || objOrPromise 
          })().then(function() {
            throw new Error('Should fail')
          }, function(err) {
            err.should.be.instanceOf(Error)
            err.should.not.be.instanceOf(knexGenericErrors.Errors.ConnectionError)
            err.message.should.be.equal('As expected')
            spies.acquire.should.be.calledWith(sinon.match.func)
            done()
          })
        }))
      })
    })

    describe('when general errors functionality attached', function () {
      describe('General for all dialects', function () {
        beforeEach(function() {
          knex = require(knexPath)

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

        describe('query() method internal _query() call', function() {
          beforeEach(function() {
            connection = {__knexUid: 'randomUid'}
            obj = { randomKey: 'randomValue' }
          })

          it('should return query response', sinon.test(function(done) {
            spies._query.withArgs(connection, obj).returns(Knex.Promise.resolve(connection))

            Knex.client.query(connection, obj).then(function(conn) {
              conn.should.be.eql(connection)
              spies.emit.should.be.calledWith('query', sinon.match(obj))
              spies._query.should.be.calledWith(connection, obj)
              done()
            })
          }))

          it('should throw QueryError', sinon.test(function (done) {
            obj['sql'] = 'select * from random'

            spies._query.withArgs(connection, obj).returns(Knex.Promise.try(function () {
              throw new Error('As expected')
            }))

            Knex.client.query(connection, obj).then(function() {
                throw new Error('Should fail')
              }, function(err) {
                err.should.be.instanceOf(knex.Errors.QueryError)
                err.message.should.be.equal(obj.sql + ' - ' + 'As expected')
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

          it('should return connection', sinon.test(function(done) {
            spies.acquire.withArgs(sinon.match.func).yields(null, connection)

            var objOrPromise = Knex.client.acquireConnection();
            (function () {
              return objOrPromise.completed || objOrPromise 
            })().then(function(conn) {
              conn.should.be.eql(connection)
              spies.acquire.should.be.calledWith(sinon.match.func)
              done()
            })
          }))

          it('should throw native Error', sinon.test(function (done) {
            spies.acquire.withArgs(sinon.match.func).yields(new Error('As expected'), null)

            var objOrPromise = Knex.client.acquireConnection();
            (function () {
              return objOrPromise.completed || objOrPromise 
            })().then(function() {
                throw new Error('Should fail')
              }, function(err) {
                err.should.be.instanceOf(Error)
                err.should.not.be.instanceOf(knex.Errors.ConnectionError)
                err.message.should.be.equal('As expected')
                spies.acquire.should.be.calledWith(sinon.match.func)
                done()
              })
          }))
        })
      })

      require('./mysql')(knexPath, version)
    })
  })

}
