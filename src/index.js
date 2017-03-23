import * as errors from './errors'
import { assign } from 'lodash'
import semver from 'semver'
import fs from 'fs'
import path from 'path'

export { errors as Errors }
export function attach(Knex, handler) {
  Knex.Errors = errors

  const knex = handler()
  knex.errors = errors

  const { client } = knex
  const dialectName = client.dialect

  const versions = fs.readdirSync(path.join(__dirname, './versions'))
  const [version] = versions.sort().reverse().filter(function(version) {
    return semver.satisfies(knex.VERSION, `^${ version }`)
  })

  if (!version) {
    throw new Error(`knex@${ knex.VERSION } is not supported`)
  }
  const clientOverrider = require(`./versions/${ version }/client`)

  try {
    const dialectOverrider = require(`./dialects//${ dialectName }`)
  	
  	assign(client, clientOverrider(client), dialectOverrider(client))
  } catch (err) {
  	console.warn("knex-generic-errors not implemented for dialect: " + dialectName)
  }

  return knex
}
