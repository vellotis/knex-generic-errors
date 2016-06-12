import * as errors from './errors'
import { assign } from 'lodash'
import semver from 'semver'
import fs from 'fs'
import path from 'path'

export { errors as Errors }
export function attach(knex, handler) {
  knex.Errors = errors

  const Knex = handler()
  Knex.errors = errors

  const { client } = Knex
  const dialectName = client.dialect

  const versions = fs.readdirSync(path.join(__dirname, './versions'))
  const [version] = versions.sort().reverse().filter(function(version) {
    return semver.satisfies(Knex.VERSION, `^${ version }`)
  })

  if (!version) {
    throw new Error(`knex@${ Knex.VERSION } is not supported`)
  }
  const clientOverrider = require(`./versions/${ version }/client`)

  try {
    const dialectOverrider = require(`./dialects//${ dialectName }`)
  	
  	assign(client, clientOverrider(client), dialectOverrider(client))
  } catch (err) {
  	console.warn("knex-generic-errors not implemented for dialect: " + dialectName)
  }

  return Knex
}
