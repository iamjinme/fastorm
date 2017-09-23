import Errors from './errors';
import parse, { parseJoin } from './ParseUtils';

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
    const FROM = `FROM ${this.name}`;
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

    return (await this.connection.execute([METHOD, COLUMNS, FROM, WHERE, ORDER_BY, LIMIT, OFFSET].join(' ')))[0];
  }

  /**
   * Insert a new element on table;
   * @param {Object} object data object;
   */
  async insert(object) {
    if (typeof object !== 'object') throw new Error(Errors.INVALID_PARAMS);

    const METHOD = 'INSERT';
    const INTO = `INTO ${this.name}`;
    let COLUMNS = '';
    let VALUES = '';

    const parsed = this.parse({
      properties: object,
    });

    if (parsed.properties) {
      COLUMNS = parsed.properties.keys;
      VALUES = `VALUES ${parsed.properties.values}`;
    }

    return (await this.connection.execute([METHOD, INTO, COLUMNS, VALUES].join(' ')))[0];
  }

  /**
   * Delete elements on DB related to Model;
   * @param {Object} options delete elements with matching query;
   */
  async delete(options) {
    if (typeof options !== 'object') throw new Error(Errors.INVALID_PARAMS);

    const METHOD = 'DELETE';
    const FROM = `FROM ${this.name}`;
    let WHERE = 'WHERE TRUE';
    let LIMIT = '';
    let ORDER_BY = '';

    const parsed = this.parse(options);

    if (parsed.where) WHERE = parsed.where;
    if (parsed.order) ORDER_BY = parsed.order;
    if (parsed.limit) LIMIT = parsed.limit;

    return (await this.connection.execute([METHOD, FROM, WHERE, ORDER_BY, LIMIT].join(' ')))[0];
  }

  /**
   * Update elements on DB related to Model;
   * @param {Object} set data object;
   * @param {Object|String} options update elements matching query;
   */
  async update(set, options) {
    if (typeof set !== 'object') throw new Error(Errors.INVALID_PARAMS);
    if (typeof options !== 'object') throw new Error(Errors.INVALID_PARAMS);

    const METHOD = `UPDATE ${this.name}`;
    let WHERE = 'WHERE TRUE';
    let SET = '';
    let LIMIT = '';
    let ORDER_BY = '';

    const parsed = this.parse({ set, ...options });
    if (parsed.set) SET = parsed.set;
    if (parsed.where) WHERE = parsed.where;
    if (parsed.order) ORDER_BY = parsed.order;
    if (parsed.limit) LIMIT = parsed.limit;

    return (await this.connection.execute([METHOD, SET, WHERE, ORDER_BY, LIMIT].join(' ')))[0];
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
    const FROM = `FROM ${this.name}`;
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

    return (await this.connection.execute([METHOD, COLUMNS, FROM, JOIN, WHERE, ORDER_BY, LIMIT, OFFSET].join(' ')))[0];
  }

  /**
   * Paginate results for query;
   * @param {Object} options
   */
  async paginate(options) {
    // TODO implement this thing, remove Console::log;
  }

  async query(string) {
    return await this.connection.execute(string);
  }
}

Model.prototype.parse = parse;

export default Model;
