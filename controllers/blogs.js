const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
//const userExtractor = require('../utils/middleware')
const { userExtractor } = require('../utils/middleware')
//const User = require('../models/user')
//const jwt = require('jsonwebtoken')

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
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()
  response.json(savedBlog)
  //response.status(201).json(savedBlog)
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
blogsRouter.put('/:id', async (req, res) => {
  const { title, author, url, likes } = req.body

  const updatedBlog = await Blog.findByIdAndUpdate(
    { _id: req.params.id },
    { title, author, url, likes },
    { new: true, context: 'query' }
  )
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

// blogsRouter.delete('/:id', async (req, res) => {
//   await Blog.findByIdAndDelete(req.params.id)
//   res.status(204).end()
// })

// blogsRouter.put('/:id', async (req, res) => {
//   const body = req.body
//   const blog = {
//     title: body.title,
//     author: body.author,
//     url: body.url,
//     likes: body.likes,
//   }

//   const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, blog, {
//     new: true,
//   })
//   res.json(updatedBlog)
// })

// blog
//   .save()
//   .then(savedBlog => {
//     response.status(201).json(savedBlog)
//   })
//   .catch(error => next(error))
//GET
// blogsRouter.get('/', (request, response) => {
//   Blog.find({}).then(blogs => {
//     response.json(blogs)
//   })
// })

//POST
// blogsRouter.post('/', (request, response) => {
//   const blog = new Blog(request.body)

//   blog.save().then(result => {
//     response.status(201).json(result)
//   })
// })
