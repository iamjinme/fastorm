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
  - [Paginate results](#paginate-results)
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
import { Model, createConnection } from 'fastorm';

// create the connection to database
const connection = await createConnection({
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
import { Model, createConnection } from 'fastorm';

// create the connection to database
const connection = await createConnection({
  host: 'localhost',
  user: 'root',
  database: 'test'
});

// create other connection to other database and server
const other_connection = await createConnection({
  host: 'other_server',
  user: 'root',
  database: 'post'
});

// Create model to User table
const User = new Model('User', connection);

// Create model to Post table
const Post = new Model('Post', connection);

// Create model to Other table in other server (multiple connections, cool!)
const Other = new Model('Other', other_connection);

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
## Paginate results

We create a `paginate` method to facilite managing cursors with lots of information or simply paginate results of any query. In a moment of this history we create an paginate to Sequalize available [here](https://github.com/mirabalj/sequelize-paginate-cursor).

```js

// Paginate all posts of user juan with columns: name, title and description
// Return { objects, nextCursor } when objects are data found, and nextCursor
// is the property keyPaginated of the next row used to paginate again (sinceId)
const juanes_paginated = await User.paginate({
    sinceId: null, // Not necessary in the first call to paginate
    limit: 10, // Default 1
    where: { name: 'juan' },
    select: { name: 1, title: 1, description: 1 },
    keyPaginated: 'document_id', // Optional used to order, default id
    reverse: true // Optional, default false
})

```

## Authors

- Jinme Mirabal [@mirabalj](https://github.com/mirabalj)
- Leon Peña [@ldpenal](https://github.com/ldpenal)
- Sergio Cruz [@sergiocruza](https://github.com/sergiocruza)

## Documentation

You can find more detailed documentation [here](https://github.com/mirabalj/fastorm/tree/master/documentation). You should also check various code [examples](https://github.com/mirabalj/fastorm/tree/master/examples) to understand advanced concepts.

## Acknowledgements

  - To @sidorares and your team by node-mysql2 module [node-mysql2](https://github.com/sidorares/node-mysql2)

## Contributing

Want to improve something in `fastorm`. Please check [Contributing.md](https://github.com/mirabalj/fastorm/Contributing.md) for detailed instruction on how to get started.


[npm-image]: https://img.shields.io/npm/v/fastorm.svg
[npm-url]: https://npmjs.org/package/fastorm
[node-version-image]: https://img.shields.io/node/v/fastorm.svg
[node-version-url]: http://nodejs.org/download/
[travis-image]: https://img.shields.io/badge/linux-tested-green.svg
[travis-url]: https://travis-ci.org/mirabalj/fastorm
[downloads-image]: https://img.shields.io/npm/dm/fastorm.svg
[downloads-url]: https://npmjs.org/package/fastorm
[license-url]: https://github.com/mirabalj/fastorm/blob/master/license
[license-image]: https://img.shields.io/badge/license-MIT-blue.svg
[node-mysql]: https://github.com/mysqljs/mysql
[node-mysql2]: https://github.com/sidorares/node-mysql2
[sequalize]: https://github.com/sequelize/sequelize
[mysql-native]: https://github.com/sidorares/nodejs-mysql-native
