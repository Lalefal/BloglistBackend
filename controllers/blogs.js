const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

//GET
blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({})
  response.json(blogs)
})

//GET id
blogsRouter.get('/:id', async (request, response) => {
  const blog = await Blog.findById(request.params.id)
  if (blog) {
    response.json(blog)
  } else {
    response.status(404).end()
  }
})

//POST
blogsRouter.post('/', async (request, response) => {
  const body = request.body
  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
  })
  const savedBlog = await blog.save()
  response.status(201).json(savedBlog)
})

//PUT
blogsRouter.put('/:id', async (req, res) => {
  const body = req.body
  const blog = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
  }

  const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, blog, {
    new: true,
  })
  res.json(updatedBlog)
})

//DELETE by id
blogsRouter.delete('/:id', async (req, res) => {
  await Blog.findByIdAndDelete(req.params.id)
  res.status(204).end()
})

module.exports = blogsRouter

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
