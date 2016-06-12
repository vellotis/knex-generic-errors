import {QueryError} from '../../errors'

import { pick } from 'lodash'

export default  function(origClient) {
  let orig
  const overrides = {
    query: function(connection, obj) {
      const client = this
      return orig.query.apply(this, arguments)
        .catch((err) => {
          if (client._convertError) {
            err = client._convertError(err)
          }
          err = new QueryError(err.message, err, {sql: obj.sql, bindings: obj.bindings})
          throw err
        })
    },

    acquireConnection: function() {
      const client = this

      const {completed, abort} = orig.acquireConnection.apply(this, arguments)

      return {
        completed: completed
          .catch((err) => {
            if (this._convertError) {
              err = client._convertError(err)
            }
            throw err
          }),
        abort
      }
    }
  }

  orig = pick(origClient, Object.keys(overrides))

  return overrides
}