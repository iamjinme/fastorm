import _ from 'lodash';

const parseValue = (column, value) => {
  if (typeof value !== 'object') return value;

  const properties = Object.keys(value);

  let parsed = '';
  for (let i = 0; i < properties.length; i += 1) {
    const property = properties[i];
    let compare = '=';

    if (property === '$ne') compare = '<>';
    if (property === '$gt') compare = '>';
    if (property === '$gte') compare = '>=';
    if (property === '$lt') compare = '<';
    if (property === '$lte') compare = '<=';

    const element = (typeof value[property] === 'string') ? `'${value[property]}'` : value[property];
    parsed += `\`${column}\` ${compare} ${element}`;

    if (i !== properties.length - 1) {
      parsed += ' AND ';
    }
  }
  return parsed;
};

const parseWhere = (where) => {
  if (typeof where === 'string') return `WHERE ${where}`;

  const properties = Object.keys(where);

  if (properties.length === 0) return 'WHERE TRUE';

  const conditions = [];
  for (let i = 0; i < properties.length; i += 1) {
    const property = properties[i];

    // TODO check if type validation is neeeded;
    const element = (typeof where[property] === 'string') ? `'${where[property]}'` : parseValue(property, where[property]);
    if (typeof where[property] !== 'object') {
      conditions.push(`\`${property}\` = ${element}`);
    } else {
      conditions.push(`${element}`);
    }

    if (i !== properties.length - 1) {
      conditions.push('AND');
    }
  }

  return `WHERE ${conditions.join(' ')}`;
};

const parseLimit = limit => `LIMIT ${limit}`;

const parseOffset = offset => `OFFSET ${offset}`;

const parseOrderBy = (orderBy) => {
  const properties = Object.keys(orderBy);

  const conditions = [];
  for (let i = 0; i < properties.length; i += 1) {
    const property = properties[i];
    const order = orderBy[property] ? 'ASC' : 'DESC';
    conditions.push(`\`${property}\` ${order}`);
  }

  return `ORDER BY ${conditions.join(', ')} `;
};

const parseColumns = (columns) => {
  const properties = Object.keys(columns);

  if (properties.length === 0) return '*';

  const columnsArray = [];
  for (let i = 0; i < properties.length; i += 1) {
    const property = properties[i];

    if (columns[property]) {
      columnsArray.push(`\`${property}\``);
    }
  }

  return `${columnsArray.join(',')}`;
};

const parseProperties = (properties) => {
  const keys = [];
  const values = [];

  const props = Object.keys(properties);

  for (let i = 0; i < props.length; i += 1) {
    const property = props[i];

    keys.push(`\`${property}\``);
    values.push((typeof properties[property] === 'string')
      ? `'${properties[property]}'`
      : properties[property]);
  }

  keys.push('createdAt');
  values.push('current_timestamp()');

  keys.push('updatedAt');
  values.push('current_timestamp()');

  return {
    keys: `(${keys.join(', ')})`,
    values: `(${values.join(', ')})`,
  };
};

const parseSet = (set) => {
  const setArray = [];
  const properties = Object.keys(set);

  properties.forEach((prop) => {
    const data = (typeof set[prop] === 'string')
    ? `'${set[prop]}'`
    : set[prop];

    setArray.push(`\`${prop}\` = ${data}`);
  });

  setArray.push('updatedAt = current_timestamp()');

  return `SET ${setArray.join(', ')}`;
};

const parseJoin = (source, target, inner = []) => {
  const onClause = _.map(inner, (plainElement) => {
    const splits = plainElement.split(':');
    return `${source}.${splits[0]} = ${target}.${splits[1]}`;
  }).join(' AND ');

  return `JOIN ${target} ON ${onClause}`;
};

const padWithZeroes = string => (`0${string}`).slice(-2);

export {
  parseJoin,
  padWithZeroes,
};

export default (query) => {
  const sql = {};

  if (query.columns) sql.columns = parseColumns(query.columns);
  if (query.where) sql.where = parseWhere(query.where);
  if (query.order) sql.order = parseOrderBy(query.order);
  if (query.limit) sql.limit = parseLimit(query.limit);
  if (query.offset) sql.offset = parseOffset(query.offset);
  if (query.properties) sql.properties = parseProperties(query.properties);
  if (query.set) sql.set = parseSet(query.set);

  return sql;
};
