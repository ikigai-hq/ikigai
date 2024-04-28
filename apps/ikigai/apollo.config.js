module.exports = {
  client: {
    includes: ['pages/**/*.tsx', 'components/**/*.tsx', 'graphql/**/*.ts'],
    service: {
      name: 'graphql-dev',
      localSchemaFile: 'graphql/graphql-schema.json'
    }
  }
};
