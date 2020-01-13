const path = require('path');
const express = require('express');
const app = express();


// configuraciones
app.set('views', path.join(__dirname, 'views'));
// uso de motor de plantilla
app.set('view engine', 'ejs');

// middlewares
app.use(express.json());
app.use(express.urlencoded({extended: false}));

// routes
app.use(require('./routes/index'));

app.listen(3002);
console.log('Servidor en puerto 3002');