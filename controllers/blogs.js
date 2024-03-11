const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const { userExtractor } = require('../utils/middleware')

//GET
blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
  response.json(blogs)
})

//GET by id
blogsRouter.get('/:id', async (request, response) => {
  const blog = await Blog.findById(request.params.id).populate('user', {
    username: 1,
    name: 1,
  })
  if (blog) {
    response.json(blog)
  } else {
    response.status(404).end()
  }
})

//POST
blogsRouter.post('/', userExtractor, async (request, response) => {
  const body = request.body
  const user = request.user
  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
    user: user._id,
  })
  const savedBlog = await blog.save()
  await savedBlog.populate('user', { username: 1, name: 1 })
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()
  response.status(201).json(savedBlog)
})

//DELETE by id
blogsRouter.delete('/:id', userExtractor, async (request, response) => {
  const user = request.user
  const blog = await Blog.findById(request.params.id)
  if (!blog) {
    return response.status(404).json({ error: 'blog not found' })
  }
  if (blog.user.toString() !== user._id.toString()) {
    return response.status(401).json({ error: 'unauthorized' })
  }
  await Blog.findByIdAndDelete(request.params.id)
  response.status(204).end()
})

//PUT
blogsRouter.put('/:id', userExtractor, async (req, res) => {
  const user = req.user
  const { title, author, url, likes } = req.body
  const blog = await Blog.findById(req.params.id)
  if (!blog) {
    return res.status(404).json({ error: 'blog not found' })
  }
  if (blog.user.toString() !== user._id.toString()) {
    return res.status(401).json({ error: 'unauthorized' })
  }

  const updatedBlog = await Blog.findByIdAndUpdate(
    req.params.id, //{ _id: req.params.id },
    { title, author, url, likes, user: user._id },
    { new: true, context: 'query' }
  ).populate('user', { username: 1, name: 1 })
  res.json(updatedBlog)
})

module.exports = blogsRouter

//eristää tokenin headerista authorization
// const getTokenFrom = request => {
//   const authorization = request.get('authorization')
//   if (authorization && authorization.startsWith('Bearer ')) {
//     return authorization.replace('Bearer ', '')
//   }
//   return null
// }
