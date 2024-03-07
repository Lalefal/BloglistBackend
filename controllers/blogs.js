const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')
//eristää tokenin headerista authorization
const getTokenFrom = request => {
  const authorization = request.get('authorization')
  if (authorization && authorization.startsWith('Bearer ')) {
    return authorization.replace('Bearer ', '')
  }
  return null
}

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
blogsRouter.post('/', async (request, response) => {
  const body = request.body
  const decodedToken = jwt.verify(getTokenFrom(request), process.env.SECRET) //jwt.verify dekoodaa tokenin
  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token invalid' })
  }
  const user = await User.findById(decodedToken.id)
  //const user = await User.findById(body.userId)

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
