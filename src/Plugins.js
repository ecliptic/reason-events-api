const {dissocPath, reduce, keys} = require('ramda')

/**
 * Strip out null values from fields with defaults
 */
exports.stripNullsFromDefaultFields = (builder) => builder.hook('GraphQLObjectType:fields:field',
  (field, {pgSql: sql}, {scope: {isRootMutation, fieldName}}) => {
    const entityFields = ['id', 'createdAt', 'updatedAt']

    const fieldNameMap = {
      createUser: entityFields,
      createEvent: entityFields,
    }

    if (!isRootMutation) {
      return field
    }
    if (keys(fieldNameMap).includes(fieldName)) {
      const defaultResolver = obj => obj[fieldName]
      const {resolve: oldResolve = defaultResolver, ...rest} = field

      return {
        ...rest,
        resolve: function (root, input, context, ast) {
          const newInput = reduce(
            // Remove each field from the object
            (result, field) => dissocPath(['input', 'event', field], result),
            // Use the input as the initial accumulator
            input,
            // Remove the fields from the map above for the current field name
            fieldNameMap[fieldName]
          )

          const newAst = reduce(
            (result, field) => dissocPath(['variableValues', 'input', 'event', field], result),
            ast,
            fieldNameMap[fieldName]
          )

          return oldResolve(root, newInput, context, newAst)
        },
      }
    }
    return field
  }
)
