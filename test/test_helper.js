const Blog = require('../models/blog')
const User = require('../models/user')

const initialBlogs = [
  {
    title: 'Testataan backendiä',
    author: 'Risto Reipas',
    url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
    likes: 1,
  },
  {
    title: 'Testataan tietokantaamme',
    author: 'Nalle Puh',
    url: 'https://reactpatterns.com/',
  },
]

const nonExistingId = async () => {
  const blog = new Blog({ title: 'willRemoveThisSoon' })
  await blog.save()
  await blog.deleteOne()

  return blog._id.toString()
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(u => u.toJSON())
}

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(blog => blog.toJSON())
}

module.exports = { initialBlogs, nonExistingId, usersInDb, blogsInDb }
