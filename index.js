const express = require("express");
const path = require("path");
const { Pool } = require("pg");

const app = express();



// Notifique que debe usarse el motor de plantilla EJS.
app.set("view engine", "ejs");

// Especifique que las vistas se guardan en la carpeta "views".
app.set("views", path.join(__dirname + "/views"));

//uso de archivos estaticos como bootstrap 4.4.1 y jquery, luego en el index de la vista solo agregar 
{/* <link rel="stylesheet" href="/css/bootstrap.min.css"></link> */}
app.use('/css', express.static(path.join(__dirname, "/node_modules/bootstrap/dist/css")));
app.use('/js', express.static(path.join(__dirname + '/node_modules/jquery/dist')));
app.use('/js', express.static(path.join(__dirname + '/public/js')));
// app.use('/js', express.static(path.join(__dirname + '/node_modules/bootstrap/dist/js')));

app.use(express.urlencoded({ extended: false })); // <--- middleware configuration


const pool = new Pool({
    user: "user",
    host: "host",
    database: "database",
    password: "password",
    port: port
  });
  console.log("Successful connection to the database");

  const sql_create = `CREATE TABLE IF NOT EXISTS Books (
    Book_ID SERIAL PRIMARY KEY,
    Title VARCHAR(100) NOT NULL,
    Author VARCHAR(100) NOT NULL,
    Comments TEXT
  );`;
  
//   pool.query(sql_create, [], (err, result) => {
//     if (err) {
//       return console.error(err.message);
//     }
//     console.log("Successful creation of the 'Books' table");
//   });

   // Database seeding
   const sql_insert = `INSERT INTO Books (Book_ID, Title, Author, Comments) VALUES
   (1, 'Mrs. Bridge', 'Evan S. Connell', 'First in the serie'),
   (2, 'Mr. Bridge', 'Evan S. Connell', 'Second in the serie'),
   (3, 'L''ingénue libertine', 'Colette', 'Minne + Les égarements de Minne')
 ON CONFLICT DO NOTHING;`;
//  pool.query(sql_insert, [], (err, result) => {
//    if (err) {
//      return console.error(err.message);
//    }
//    const sql_sequence = "SELECT SETVAL('Books_Book_ID_Seq', MAX(Book_ID)) FROM Books;";
//    pool.query(sql_sequence, [], (err, result) => {
//      if (err) {
//        return console.error(err.message);
//      }
//      console.log("Successful creation of 3 books");
//    });
//  });

app.listen(3000, () => {
  console.log("Server started (http://localhost:3000/) !");
});

app.get("/", (req, res) => {
//   res.send ("Hola mundo...");
//envio a la vista index
res.render("index");
});

app.get("/about", (req, res) => {
    res.render("about");
});

app.get("/data", (req, res) => {
    const test = {
    title: "Test",
    items: ["one", "two", "three"]
    };
    //el objeto test es pasado a la vista del archivo data.ejs con el nombre model para poder usarlo
    res.render("data", {model: test});
});

app.get("/books", (req, res) => {
    const sql = "SELECT * FROM Books ORDER BY Title"
    pool.query(sql, [], (err, result) => {
      if (err) {
        return console.error(err.message);
      }
      res.render("books", { model: result.rows });
    });
  });

  // GET /edit/5
app.get("/edit/:id", (req, res) => {
    const id = req.params.id;
    const sql = "SELECT * FROM Books WHERE Book_ID = $1";
    pool.query(sql, [id], (err, result) => {
      // if (err) ...
      res.render("edit", { model: result.rows[0] });
    });
  });

  // POST /edit/5
app.post("/edit/:id", (req, res) => {
    const id = req.params.id;
    console.log(id);
    const book = [req.body.Title, req.body.Author, req.body.Comments, id];
    const sql = "UPDATE Books SET Title = $1, Author = $2, Comments = $3 WHERE (Book_ID = $4)";
    pool.query(sql, book, (err, result) => {
      if (err) {
          console.log(err)
          return;
      }
      res.redirect("/books");
    });
  });

  // GET /create
app.get("/create", (req, res) => {
    res.render("create", { model: {} });
  });

  // POST /create
app.post("/create", (req, res) => {
    const sql = "INSERT INTO Books (Title, Author, Comments) VALUES ($1, $2, $3)";
    const book = [req.body.Title, req.body.Author, req.body.Comments];
    pool.query(sql, book, (err, result) => {
      // if (err) ...
      res.redirect("/books");
    });
  });

  // GET /delete/5
app.get("/delete/:id", (req, res) => {
    const id = req.params.id;
    const sql = "SELECT * FROM Books WHERE Book_ID = $1";
    pool.query(sql, [id], (err, result) => {
      // if (err) ...
      res.render("delete", { model: result.rows[0] });
    });
  });

  // POST /delete/5
app.post("/delete/:id", (req, res) => {
    const id = req.params.id;
    const sql = "DELETE FROM Books WHERE Book_ID = $1";
    pool.query(sql, [id], (err, result) => {
      // if (err) ...
      res.redirect("/books");
    });
  });