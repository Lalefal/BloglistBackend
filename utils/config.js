require('dotenv').config()

let PORT = process.env.PORT
let mongoUrl = process.env.mongoUrl

module.exports = {
  mongoUrl,
  PORT,
}
