import * as errorPredicates from './errors'
import {ConnectionError} from '../../errors'

import { isFunction } from 'lodash'

export default function() {
  return {
    _convertError: function convertError(err, callback) {
      if (errorPredicates.ConnectionError(err)) {
        err = new ConnectionError('Could not connect to the database', err)
      } else if (errorPredicates.MysqlProtocolError(err) || errorPredicates.NetworkError(err)) {
        err = new ConnectionError('Database connection dropped', err)
      }

      if (isFunction(callback)) {
        return callback(err)
      }
      return err
    }
  }
}