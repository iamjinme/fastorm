import Errors from './errors';
import parse, { parseJoin, padWithZeroes } from './ParseUtils';

class Model {

  /**
   * Construct a new model
   * @param {String} name model's name;
   * @param {Object} connection driver connection;
   */
  constructor(name, connection) {
    if (!name) throw new Error(Errors.MODEL_NAME_MUST_BE_PROVIDED);
    if (!connection) throw new Error(Errors.CONNECTION_NOT_PROVIDED);
    if (!name.length === 0) throw new Error(Errors.MODEL_NAME_MUST_BE_PROVIDED);

    this.name = name;
    this.connection = connection;
  }

  /**
   * Find elements in related table mode;
   * @param {Object|String} options query to perform;
   */
  async find(options) {
    if (typeof options !== 'object') throw new Error(Errors.INVALID_PARAMS);
    const METHOD = 'SELECT';
    const FROM = `FROM \`${this.name}\``;
    let COLUMNS = '*';
    let WHERE = 'WHERE TRUE';
    let LIMIT = '';
    let ORDER_BY = '';
    let OFFSET = '';

    const parsed = this.parse(options);

    if (parsed.columns) COLUMNS = parsed.columns;
    if (parsed.where) WHERE = parsed.where;
    if (parsed.order) ORDER_BY = parsed.order;
    if (parsed.limit) LIMIT = parsed.limit;
    if (parsed.offset) OFFSET = parsed.offset;

    const query = [METHOD, COLUMNS, FROM, WHERE, ORDER_BY, LIMIT, OFFSET].join(' ');
    const response = (await this.connection.execute(query))[0];
    this.connection.unprepare(query).then(() => undefined);

    if (options.limit === 1) return response[0];
    return response;
  }

  /**
   * Insert a new element on table;
   * @param {Object} object data object;
   */
  async insert(object) {
    if (typeof object !== 'object') throw new Error(Errors.INVALID_PARAMS);

    const METHOD = 'INSERT';
    const INTO = `INTO \`${this.name}\``;
    let COLUMNS = '';
    let VALUES = '';

    const parsed = this.parse({
      properties: object,
    });

    if (parsed.properties) {
      COLUMNS = parsed.properties.keys;
      VALUES = `VALUES ${parsed.properties.values}`;
    }

    const query = [METHOD, INTO, COLUMNS, VALUES].join(' ');
    const response = (await this.connection.execute(query))[0];
    this.connection.unprepare(query).then(() => undefined);

    return response;
  }

  /**
   * Delete elements on DB related to Model;
   * @param {Object} options delete elements with matching query;
   */
  async delete(options) {
    if (typeof options !== 'object') throw new Error(Errors.INVALID_PARAMS);

    const METHOD = 'DELETE';
    const FROM = `FROM \`${this.name}\``;
    let WHERE = 'WHERE TRUE';
    let LIMIT = '';
    let ORDER_BY = '';

    const parsed = this.parse(options);

    if (parsed.where) WHERE = parsed.where;
    if (parsed.order) ORDER_BY = parsed.order;
    if (parsed.limit) LIMIT = parsed.limit;

    const query = [METHOD, FROM, WHERE, ORDER_BY, LIMIT].join(' ');
    const response = (await this.connection.execute(query))[0];
    this.connection.unprepare(query).then(() => undefined);

    return response;
  }

  /**
   * Update elements on DB related to Model;
   * @param {Object} set data object;
   * @param {Object|String} options update elements matching query;
   */
  async update(set, options) {
    if (typeof set !== 'object') throw new Error(Errors.INVALID_PARAMS);
    if (typeof options !== 'object') throw new Error(Errors.INVALID_PARAMS);

    const METHOD = `UPDATE \`${this.name}\``;
    let WHERE = 'WHERE TRUE';
    let SET = '';
    let LIMIT = '';
    let ORDER_BY = '';

    const parsed = this.parse({ set, ...options });
    if (parsed.set) SET = parsed.set;
    if (parsed.where) WHERE = parsed.where;
    if (parsed.order) ORDER_BY = parsed.order;
    if (parsed.limit) LIMIT = parsed.limit;

    const query = [METHOD, SET, WHERE, ORDER_BY, LIMIT].join(' ');
    const response = (await this.connection.execute(query))[0];
    this.connection.unprepare(query).then(() => undefined);

    return response;
  }

  /**
   * Perform JOIN of relations
   * @param {Object} options data object with join params;
   */
  async join({ table, inner = [], options }) {
    if (typeof options !== 'object') throw new Error(Errors.INVALID_PARAMS);

    if (!table || (typeof table !== 'string') || table.length === 0) {
      throw new Error(Errors.RELATION_TABLE_NOT_PROVIDED);
    }

    if (inner.length === 0) throw new Error(Errors.RELATION_COLUMNS_NOT_PROVIDED);

    const METHOD = 'SELECT';
    const FROM = `FROM \`${this.name}\``;
    let COLUMNS = '*';
    let WHERE = 'WHERE TRUE';
    let LIMIT = '';
    let ORDER_BY = '';
    let OFFSET = '';

    const parsed = this.parse(options);
    const JOIN = parseJoin(this.name, table, inner);

    if (parsed.columns) COLUMNS = parsed.columns;
    if (parsed.where) WHERE = parsed.where;
    if (parsed.order) ORDER_BY = parsed.order;
    if (parsed.limit) LIMIT = parsed.limit;
    if (parsed.offset) OFFSET = parsed.offset;

    const query = [METHOD, COLUMNS, FROM, JOIN, WHERE, ORDER_BY, LIMIT, OFFSET].join(' ');
    const response = (await this.connection.execute(query))[0];
    this.connection.unprepare(query).then(() => undefined);

    return response;
  }

  /**
   * Paginate results for query;
   * @param {Object} options
   */
  async paginate({
    sinceId, maxId, limit = 10,
    select = {}, where = {},
    keyPaginated = 'id', reverse = false,
  } = {}) {
    try {
      const lsThanE = reverse ? '>=' : '<=';
      const lsThan = reverse ? '>' : '<';
      const gsThan = reverse ? '<' : '>';
      // Convert string to work with <=> conditionals
      const stringWhere = this.parse({ where }).where.slice(5);
      let stringFindWhere = stringWhere;
      // Conditional to search since Id
      if (sinceId) {
        if (typeof sinceId === 'string') {
          stringFindWhere += ` AND \`${keyPaginated}\` ${lsThanE} '${sinceId}'`;
        } else {
          stringFindWhere += ` AND \`${keyPaginated}\` ${lsThanE} ${sinceId}`;
        }
      }
      // Conditional to search until Id
      if (maxId) {
        if (typeof maxId === 'string') {
          stringFindWhere += ` AND \`${keyPaginated}\` ${gsThan} '${maxId}'`;
        } else {
          stringFindWhere += ` AND \`${keyPaginated}\` ${gsThan} ${maxId}`;
        }
      }

      // Assign order of search
      const order = {};
      order[keyPaginated] = reverse ? 1 : 0;

      // Execute query with limit
      const objects = await this.find({
        where: stringFindWhere,
        limit,
        columns: select,
        order,
      });

      let nextCursor = null;
      const len = objects.length;

      // Search fine? create a cursor!
      if (len) {
        let lastCursor = objects[len - 1][keyPaginated];

        if (lastCursor instanceof Date) {
          // Gonna parse the Date from JS to DATETIME to MySQL;
          lastCursor = `${[lastCursor.getFullYear(), padWithZeroes(lastCursor.getMonth() + 1),
            padWithZeroes(lastCursor.getDate())].join('-')} ${[padWithZeroes(lastCursor.getHours()),
            padWithZeroes(lastCursor.getMinutes()), padWithZeroes(lastCursor.getSeconds())].join(':')}`;
        }

        const stringNextCursorWhere = `${stringWhere} AND \`${keyPaginated}\` ${lsThan} '${lastCursor}'`;
        // Find next cursor
        const nextObject = await this.find({
          where: stringNextCursorWhere,
          order,
          limit: 1,
        });

        // Exist next cursor?
        if (nextObject) {
          nextCursor = nextObject[keyPaginated];
        }
      }

      // Create paginate object
      const objectReturn = {
        objects,
        nextCursor,
      };

      // Return paginate
      return objectReturn;
    } catch (err) {
      // Catch error and send to callback
      throw err;
    }
  }

  /**
   * Execute 'raw' queries;
   * @param {Object} options
   */
  async query(string) {
    const response = await this.connection.execute(string);
    this.connection.unprepare(string).then(() => undefined);

    return response;
  }
}

Model.prototype.parse = parse;

export default Model;
