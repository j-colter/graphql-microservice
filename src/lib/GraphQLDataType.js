import { GraphQLScalarType } from 'graphql';
import { Kind } from 'graphql/language';


function identity(value) {
  return value;
}

function parseLiteral(ast, variables) {
  switch (ast.kind) {
    case Kind.STRING:
    case Kind.BOOLEAN:
      return ast.value;
    case Kind.INT:
    case Kind.FLOAT:
      return parseFloat(ast.value);
    case Kind.OBJECT:
    {
      let value = Object.create(null);
      ast.fields.forEach((field) => {
        value[field.name.value] = parseLiteral(field.value, variables);
      });

      return value;
    }
    case Kind.LIST:
      return ast.values.map((n) => {
        return parseLiteral(n, variables);
      });
    case Kind.NULL:
      return null;
    case Kind.VARIABLE:
    {
      const name = ast.name.value;
      return variables ? variables[name] : undefined;
    }
    default:
      return undefined;
  }
}
function dataParseLiteral(ast, variables) {
  switch (ast.kind) {
    case Kind.STRING:
      return new Date(ast.value);
    default:
      return undefined;
  }
}

const GraphQLJSON = new GraphQLScalarType({
  name: 'JSON',
  description: 'JSON',
  serialize: identity,
  parseValue: identity,
  parseLiteral: parseLiteral,
});

const GraphQLDate = new GraphQLScalarType({
  name: 'Date',
  description: 'Date',
  serialize: identity,
  parseValue: identity,
  parseLiteral: dataParseLiteral,
});

export {GraphQLJSON, GraphQLDate};