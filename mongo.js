//3.12 tietokanta komentoriviltä

const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]
const url = `mongodb+srv://fullstack:${password}@cluster0.uk8byuf.mongodb.net/testBloglist?retryWrites=true&w=majority`

mongoose.set('strictQuery', false)

const connection = async () => {
  await mongoose.connect(url)
  console.log('Connected')

  const blogSchema = new mongoose.Schema({
    title: String,
    author: String,
    url: String,
    likes: Number,
  })
  const Blog = mongoose.model('Blog', blogSchema)

  const blogs = await Blog.find({})
  blogs.forEach(blog => {
    console.log(blog)
  })

  mongoose.connection.close()
}

connection()

//then()
// mongoose.connect(url).then(() => {
//   const blogSchema = new mongoose.Schema({
//     title: String,
//     author: String,
//     url: String,
//     likes: Number,
//   })

//   const Blog = mongoose.model('Blog', blogSchema)

//   //   const blog = new Blog({
//   //     title: 'Testataan backendiä',
//   //     author: 'Risto REipas',
//   //     url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
//   //     likes: 12,
//   //   })

//   //   blog.save().then(result => {
//   //     console.log('blog saved!')
//   //     mongoose.connection.close()
//   //   })
//   Blog.find({}).then(result => {
//     result.forEach(blog => {
//       console.log(blog)
//     })
//     mongoose.connection.close()
//   })
// })

//muuta härpäkettä

// if (process.argv.length < 3) {
//   console.log('give password as argument')
//   process.exit(1)
// } else if (process.argv.length === 3) {
//   Blog.find({}).then(result => {
//     console.log('bloglist:')
//     result.forEach(blog => {
//       console.log(blog.name, blog.number)
//     })
//     mongoose.connection.close()
//   })
// } else if (process.argv.length > 3) {
//   const blog = new Blog({
//     name: process.argv[3],
//     number: process.argv[4],
//     title: String,
//     author: String,
//     url: String,
//     likes: Number,
//   })
//   blog.save().then(() => {
//     console.log(`Added ${blog.name} number ${blog.number} to phonebook`)
//     mongoose.connection.close()
//   })
// }
