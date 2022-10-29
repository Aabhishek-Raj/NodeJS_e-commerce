const express = require('express')
const mongoose = require('mongoose')
const expressLayouts = require('express-ejs-layouts')
const userRouter = require('./routes/user')
const adminRouter = require('./routes/admin')
const cookieParser = require('cookie-parser')
const nocache = require('nocache')
const { checkUser, checkAdmin  } = require('./middlewares/authMiddlewares')

// const bodyParser = require('body-parser')

const app = express()

app.use(express.static('assets'))
app.use(express.json())
app.use(cookieParser())
app.use(expressLayouts)
app.use(nocache())
app.set('layout', './layouts/layout')
app.use(express.urlencoded({ extended: true }))

// View engine
app.set('view engine', 'ejs')

const dbURI = 'mongodb://localhost:27017/PROJECT'
mongoose.connect(dbURI)
  .then(() => {
    console.log('connected to db')
    // listening for requests
    app.listen(7000)
  })
  .catch((err) => console.log(err))

app.use('*', checkUser)
app.use('/', checkUser, userRouter)
app.use('/admin', adminRouter)
