var decache = require('decache')
var fs = require('fs')
var path = require('path')

var judgePath = path.join(__dirname, '../node_modules/.judge')
var judges = fs.readdirSync(judgePath)


judges.forEach(function (judge) {
  var knexPath = path.join(judgePath, judge, 'node_modules/knex')
  var version = require(path.join(knexPath, 'package.json')).version

	afterEach(function(){
	  decache(knexPath)
	})

  describe('Knex v' + version, function () {
  	describe('Knex Generic Errors', function() {
		  require('./unit')(knexPath)
		})
  })

})

