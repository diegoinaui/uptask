const express = require('express')
//const expressValidator = require('express-validator');
const routes = require('./routes')
const path = require('path')
const db = require('./config/db')
const helpers = require('./helpers')
const flash = require('connect-flash')
const session = require('express-session')
const cookieParser = require('cookie-parser')
const passport = require('./config/passport')
require('dotenv').config({ path: './variables.env' })

require('./models/Proyectos')
require('./models/Tareas')
require('./models/Usuarios')
db.sync()
  .then(() => console.log('Conectado al servidor MySql'))
  .catch(error => console.error(error))

const app = express()

app.use(express.static('public'))

app.set('view engine', 'pug')

app.set('views', path.join(__dirname, 'views'))

app.use(flash())

app.use(cookieParser())

app.use(session({
  secret: 'supersecreto',
  resave: false,
  saveUninitialized: false
}))

app.use(passport.initialize())
app.use(passport.session())

// Variables locales
app.use((req, res, next) => {
  res.locals.vardump = helpers.vardump
  res.locals.mensajes = req.flash()
  res.locals.usuario = { ...req.user } || null
  next()
})

// @deprecated
//app.use(bodyParser.urlencoded({ extended: true}))
app.use(express.urlencoded({
  extended: true
}))

//app.use(expressValidator());

app.use(routes())

const host = process.env.HOST || '0.0.0.0';
const port = process.env.PORT || 3000;

app.listen(port, host, () => {
  console.log(`Server listen on ${host}:${port}`)
} )