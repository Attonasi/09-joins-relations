'use strict';

const pg = require('pg');
const express = require('express');
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 5000;
const app = express();
const conString = process.env.DATABASE_URL || 'postgres://attonasi:Joy1is1me!@localhost:5000/postress';

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('./public'));


// NOTE: Routes for requesting HTML resources
app.get('/', function(request, response) {
  response.sendFile('index.html', {root: '.'});
});

app.get('/new', function(request, response) {
  response.sendFile('new.html', {root: '.'});
});

// NOTE: Routes for making API calls to enact CRUD Operations on our database
app.get('/articles/all', function(request, response) {
  let client = new pg.Client(conString);

  client.connect(function(err) {
    if (err) console.error(err);
    client.query(
      `SELECT * FROM articles INNER JOIN authors ON articles.author_id = authors.author_id;`, // TODO: Write a SQL query which inner joins the data from articles and authors for all records
      function(err, result) {
        if (err) console.error(err);
        response.send(result);
        client.end();
      }
    );
  })
});

app.post('/articles/insert', function(request, response) {
  let client = new pg.Client(conString)

  client.query(
    'INSERT INTO author(author, "authorUrl") VALUES ($1, $2) ON CONFLICT DO NOTHING;', // TODO: Write a SQL query to insert a new author, ON CONFLICT DO NOTHING
    [
      request.body.author,
      request.body.authorUrl
    ], // TODO: Add the author and "authorUrl" as data for the SQL query
    function(err) {
      if (err) console.error(err)
      queryTwo() // This is our second query, to be executed when this first query is complete.
    }
  )

  function queryTwo() {
    client.query(
      `SELECT author_id FROM authors WHERE author = $1`, // TODO: Write a SQL query to retrieve the author_id from the authors table for the new article
      [
        request.body.author
      ], // TODO: Add the author name as data for the SQL query
      function(err, result) {
        if (err) console.error(err)
        queryThree(result.rows[0].author_id) // This is our third query, to be executed when the second is complete. We are also passing the author_id into our third query
      }
    )
  }

  function queryThree(author_id) {
    client.query(
      `INSERT INTO articles(author_id, title, category, "publishedOn", body) VALUES($1, $2, $3, $4, $5)`, // TODO: Write a SQL query to insert the new article using the author_id from our previous query
      [
        author_id,
        request.body.title,
        request.body.category,
        request.body.publishedOn,
        request.body.body
      ] // TODO: Add the data from our new article, including the author_id, as data for the SQL query.
    );
  }

  client.connect();
  response.send('insert complete');
});

app.put('/articles/update', function(request, response) {
  let client = new pg.Client(conString);

  client.query(
    `SELECT author_id FROM authors`, // TODO: Write a SQL query to retrieve the author_id from the authors table for the new article
    [
      request.body.author
``  ], // TODO: Add the author name as data for the SQL query
    function(err, result) {
      if (err) console.error(err)
      queryTwo(result.rows[0].author_id)
      queryThree(result.rows[0].author_id)
    }
  )

  function queryTwo(author_id) {
    client.query(
      ``, // TODO: Write a SQL query to update an existing author record
      [] // TODO: Add the values for this table as data for the SQL query
    )
  }

  function queryThree(author_id) {
    client.query(
      ``, // TODO: Write a SQL query to update an existing article record
      [] // TODO: Add the values for this table as data for the SQL query
    );
  }

  client.connect();
  response.send('insert complete');
});

app.delete('/articles/delete', function(request, response) {
  let client = new pg.Client(conString);

  client.connect(function(err) {
    if (err) console.error(err);

    client.query(
      `DELETE FROM articles WHERE article_id=${request.body.article_id};`,
      function(err) {
        if (err) console.error(err);
        client.end();
      }
    );
  });
  response.send('Delete complete');
});

app.delete('/articles/truncate', function(request, response) {
  let client = new pg.Client(conString);

  client.connect(function(err) {
    if (err) console.error(err);

    client.query(
      'DELETE FROM articles;',
      function(err) {
        if (err) console.error(err);
        client.end();
      }
    );
  });
  response.send('Truncate complete');
});

app.listen(PORT, function() {
  console.log(`Server started on port ${PORT}!`);
});
