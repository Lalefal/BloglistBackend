const config = require('./utils/config')
const express = require('express')
require('express-async-errors')
const app = express()
const cors = require('cors')
const blogsRouter = require('./controllers/blogs')
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')
const middleware = require('./utils/middleware')
const logger = require('./utils/logger')
const mongoose = require('mongoose')
mongoose.set('strictQuery', false)

logger.info('yhdistetään ', config.MONGODB_URI)

const connection = async () => {
  try {
    await mongoose.connect(config.MONGODB_URI)
    logger.info('yhdistettiin tietokantaan')
  } catch (error) {
    logger.error('virhe yhteydessä', error.message)
  }
}
connection()

// mongoose
//   .connect(config.MONGODB_URI)
//   .then(() => {
//     logger.info('yhdistettiin tietokantaan')
//   })
//   .catch(error => {
//     logger.error('virhe yhteydessä', error.message)
//   })

app.use(cors())
app.use(express.static('dist'))
app.use(express.json())
app.use(middleware.requestLogger)

app.use('/api/blogs', blogsRouter)
app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)
app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app
