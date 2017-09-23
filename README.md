## FastORM

[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]
[![Node.js Version][node-version-image]][node-version-url]
[![Linux Build][travis-image]][travis-url]
[![License][license-image]][license-url]

> MySQL ORM (or wrapper) based on node-mysql2 client. [Node MySQL2][node-mysql2] is focus on performance, we focus on make easy get information on tables. Supports find, insert, delete, update and join methods with limit, order by and projection of columns.

__Table of contents__

  - [History and Why MySQL2](#history-and-why-mysql2)
  - [Installation](#installation)
  - [First Query](#first-query)
  - [Not only find method available](#not-only-find-method-available)
  - [Authors](#authors)
  - [Documentation](#documentation)
  - [Acknowledgements](#acknowledgements)
  - [Contributing](#contributing)

## History and Why MySQL2

FastORM project it is a necessity of have a fast and easy tool to work with MySQL in our company (and maintainable). We need migrate [Sequalize][sequalize] (good ORM, but in our experience with great memory consumption). Our tool have great influence of MongoDB syntax.

FastORM is mostly compatible (and dependent) of [node-mysql2][node-mysql2] and supports majority of features. We also offers these features and more

 - Faster / Low latency
 - Multi-connections
 - MySQL Binary Log Protocol
 - Async/await support
 - Extended support for Encoding and Collation
 - Use objects as properties like some MongoDB ORM's
 - Compression (inherited from node-mysql2)
 - Joins between two tables (for now)
 - Common methods for MySQL (find, insert, delete...)
 - Easy!

## Installation

FastORM is free from native bindings and can be installed on Linux (tested), Mac OS or Windows without any issues.

```bash
npm install --save fastorm
```

## First Query

```js
// get the ORM
import { Model, Connection } from 'fastorm';

// create the connection to database
const connection = await Connection({
  host: 'localhost',
  user: 'root',
  database: 'test'
});

// Create model to User table
const User = new Model('User', connection);

// Get all records on User
const users = User.find();

// Get one record
const only_one_user = User.find({ limit: 1 });

// Get all user with name Juan and alive
const all_juanes = User.find({ where: { name: 'juan', alive: true } })

// Same with limit 5 and order by age DESC
const only_five_juanes = User.find({ where: { name: 'juan', alive: true }, limit: 5, order: { age: 0 } })

```

## Not only `find` method available

With FastORM you can also insert, delete and join records since the model. It's possible execute "raw" queries too, the module provides `query` method to this. 

FastORM provides `insert`, `delete`, `join` and other methods within the model to work with the records on tables.

```js
// get the ORM
import { Model, Connection } from 'fastorm';

// create the connection to database
const connection = await Connection({
  host: 'localhost',
  user: 'root',
  database: 'test'
});

// Create model to User table
const User = new Model('User', connection);

// Create model to Post table
const Post = new Model('Post', connection);

// Create user Maria with age 36 and not alive
// IMPORTANT: automatically created_at and updated_at columns
// are inserted, you must have these DATETIME columns on the table
const users = await User.insert({
    name: 'maria',
    age: 36,
    alive: false
});

// Delete users with name pedro and not alive
const deleted = await User.delete({
    name: 'pedro',
    alive: false
})

// Get all posts of user juan with columns: name, title and description
const posts = await User.join({
    table: 'post',
    inner: [ 'id:user_id' ],
    where: { name: 'juan' },
    columns: { name: 1, title: 1, description: 1 }
})

```
## Authors

- Jinme Mirabal @mirabalj
- Leon Peña @lpenal
- Sergio Cruz

## Documentation

You can find more detailed documentation [here](https://github.com/mirabalj/fastorm/tree/master/documentation). You should also check various code [examples](https://github.com/mirabalj/fastorm/tree/master/examples) to understand advanced concepts.

## Acknowledgements

  - To @sidorares and your team by node-mysql2 module [node-mysql2](https://github.com/sidorares/node-mysql2)

## Contributing

Want to improve something in `fastorm`. Please check [Contributing.md](https://github.com/mirabalj/fastorm/Contributing.md) for detailed instruction on how to get started.


[npm-image]: https://img.shields.io/npm/v/mysql2.svg
[npm-url]: https://npmjs.org/package/mysql2
[node-version-image]: http://img.shields.io/node/v/mysql2.svg
[node-version-url]: http://nodejs.org/download/
[travis-image]: https://img.shields.io/travis/sidorares/node-mysql2/master.svg?label=linux
[travis-url]: https://travis-ci.org/sidorares/node-mysql2
[appveyor-image]: https://img.shields.io/appveyor/ci/sidorares/node-mysql2/master.svg?label=windows
[appveyor-url]: https://ci.appveyor.com/project/sidorares/node-mysql2
[downloads-image]: https://img.shields.io/npm/dm/mysql2.svg
[downloads-url]: https://npmjs.org/package/mysql2
[license-url]: https://github.com/sidorares/node-mysql2/blob/master/License
[license-image]: https://img.shields.io/npm/l/mysql2.svg?maxAge=2592000
[node-mysql]: https://github.com/mysqljs/mysql
[node-mysql2]: https://github.com/sidorares/node-mysql2
[sequalize]: https://github.com/sequelize/sequelize
[mysql-native]: https://github.com/sidorares/nodejs-mysql-native
