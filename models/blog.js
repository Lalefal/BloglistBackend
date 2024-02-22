const mongoose = require('mongoose')


//miksei .. = new mongoose.Schema ??
const blogSchema = mongoose.Schema({
  title: String,
  author: String,
  url: String,
  likes: Number,
})


module.exports = mongoose.model('Blog', blogSchema)