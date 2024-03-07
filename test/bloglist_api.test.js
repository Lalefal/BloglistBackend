const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const helper = require('./test_helper')
const Blog = require('../models/blog')

//2.23 korjaa token-kirjautumisen hajottamat testit
//tee testi: jos pyynnön mukana ei ole tokenia, uuden blogin lisäys ei onnistu,
//ja pyyntö palauttaa oikean statuskoodin 401 Unauthorized

describe('when there is initially some blogs saved', () => {
  beforeEach(async () => {
    await Blog.deleteMany({})
    await Blog.insertMany(helper.initialBlogs)
  })

  //4.8 sovellus palauttaa oikean määrän JSON-muotoisia blogeja
  test('there are two blogs which are returned as json', async () => {
    const response = await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)

    assert.strictEqual(response.body.length, 2)
  })

  //4.9  blogien identifioivan kentän tulee olla nimeltään id
  test('No underscore in id', async () => {
    const response = await api.get('/api/blogs')
    const firstBlog = response.body[0]
    assert.ok(firstBlog.id)
    assert.strictEqual(firstBlog._id, undefined)
  })
})
describe('addition of a new note', () => {
  //4.10 testi, joka varmistaa, että sovellukseen voi lisätä blogeja,
  //blogien määrä kasvaa yhdellä, oikeansisältöinen blogi on lisätty järjestelmään
  test('a valid blog can be added and it shows', async () => {
    const newBlog = {
      title: 'async/await simplifies making async calls',
      author: 'Tiikeri',
      url: 'http://www.cs.utexas/EWD808.html',
      likes: 3,
    }
    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const response = await api.get('/api/blogs')
    const titles = response.body.map(r => r.title)

    assert.strictEqual(response.body.length, helper.initialBlogs.length + 1)
    assert(titles.includes('async/await simplifies making async calls'))
  })

  //4.11 tykkäysten default on nolla
  test('if likes are not given, value is zero', async () => {
    const newBlog = {
      title: 'this blog has no likes',
      author: 'Risto Räppääjä',
      url: 'http://www.cs.utexas.edu/~EWD/',
    }
    const blogWithoutLikes = await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)

    assert.strictEqual(blogWithoutLikes.body.likes, 0)
  })

  //4.12 post ilman titleä ja urlia ei tallennu, pyyntöön vastataan statuskoodilla 400
  test('blog without title and/or url is not added', async () => {
    const newBlog = {
      //title: 'this post is missing info',
      author: 'Ihaa ja Ruu',
      //url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
      likes: 4,
    }

    await api.post('/api/blogs').send(newBlog).expect(400)

    const response = await api.get('/api/blogs')
    assert.strictEqual(response.body.length, helper.initialBlogs.length)
  })

  test('blog with too short title is not added', async () => {
    const newBlog = {
      title: 'this',
      author: 'Ihaa ja Ruu',
      url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
      likes: 4,
    }

    await api.post('/api/blogs').send(newBlog).expect(400)

    const response = await api.get('/api/blogs')
    assert.strictEqual(response.body.length, helper.initialBlogs.length)
  })
})

describe('deletion of a blog', () => {
  //4.13 blogin poistaminen ja deleten testaaminen
  test('a blog can be deleted', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    await api.delete(`/api/blogs/${blogToDelete.id}`).expect(204)

    const blogsAtEnd = await helper.blogsInDb()

    const titles = blogsAtEnd.map(r => r.title)
    assert(!titles.includes(blogToDelete.title))

    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1)
  })

  // beforeEach(async () => {
  //   await Blog.deleteMany({})
  //   console.log('cleared')

  //   const blogObjects = helper.initialBlogs.map(blog => new Blog(blog))
  //   const promiseArray = blogObjects.map(blog => blog.save())
  //   await Promise.all(promiseArray)
  // })
})

describe('Updating a blog', () => {
  //4.14 yksittäisen blogin muokkaaminen ja PUT:in testaaminen

  test('Update likes', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToUpdate = blogsAtStart[1]

    const update = {
      id: blogToUpdate.id,
      likes: 15,
    }
    const blogWithNewLikes = await api
      .put(`/api/blogs/${update.id}`)
      .send(update)
      .expect(200)

    assert.strictEqual(blogWithNewLikes.body.likes, 15)
  })
  test('Update title', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToUpdate = blogsAtStart[0]

    const update = {
      id: blogToUpdate.id,
      title: 'Testataan muokkaamista',
      // author: 'Reippaampi Risto',
    }

    await api.put(`/api/blogs/${update.id}`).send(update).expect(200)

    const blogsAtEnd = await helper.blogsInDb()

    const titles = blogsAtEnd.map(r => r.title)
    assert(titles.includes(update.title))
    assert(!titles.includes(blogToUpdate.title))
  })
  test('Update url', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToUpdate = blogsAtStart[0]

    const update = {
      id: blogToUpdate.id,
      url: 'http://www.cs.utexas.html',
    }

    await api.put(`/api/blogs/${update.id}`).send(update).expect(200)

    const blogsAtEnd = await helper.blogsInDb()

    const urls = blogsAtEnd.map(r => r.url)
    assert(urls.includes(update.url))
    assert(!urls.includes(blogToUpdate.url))
  })
})

after(async () => {
  await mongoose.connection.close()
})

// test('blogs are returned as json', async () => {
//   await api
//     .get('/api/blogs')
//     .expect(200)
//     .expect('Content-Type', /application\/json/) //Headerin arvo, \ jotta / ei tulkita regexin lopetusmerkiksi
// })

// test('there are two blogs', async () => {
//   const response = await api.get('/api/blogs')
//   //assert.strictEqual(response.body.length, initialBlogs.length)
//   assert.strictEqual(response.body.length, 2)
// })

// test('the first blog is about HTTP methods', async () => {
//   const response = await api.get('/api/blogs')

//   const titles = response.body.map(e => e.title)
//   assert(titles.includes('Testataan tietokantaamme')) //assert.strictEqual(contents.includes('Testataan tietokantaa'), true)
// })

// //uuden blogin lisääminen
// test('a valid blog can be added', async () => {
//   const newBlog = {
//     title: 'async/await simplifies making async calls',
//     author: 'Tiikeri',
//     url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
//     likes: 3,
//   }
//   await api
//     .post('/api/blogs')
//     .send(newBlog)
//     .expect(201)
//     .expect('Content-Type', /application\/json/)

//   const response = await api.get('/api/blogs')
//   const titles = response.body.map(r => r.title)

//   assert.strictEqual(response.body.length, helper.initialBlogs.length + 1)
//   assert(titles.includes('async/await simplifies making async calls'))
// })

// //yhden blogin tietojen katsominen
// test('a specific blog can be viewed', async () => {
//   const blogsAtStart = await helper.blogsInDb()

//   const blogToView = blogsAtStart[0]

//   const resultBlog = await api
//     .get(`/api/blogs/${blogToView.id}`)
//     .expect(200)
//     .expect('Content-Type', /application\/json/)

//   assert.deepStrictEqual(resultBlog.body, blogToView)
// })

//   test('Updating', async () => {
//     const blogsAtStart = await helper.blogsInDb()
//     //const blogToUpdate = blogsAtStart[0]

//     const blogToUpdate = {
//       id: blogsAtStart[0].id,
//       title: 'Testataan muokkaamista',
//       author: 'Reippaampi Risto',
//       url: 'http://www.cs.utexas.html',
//       likes: 15,
//     }

//     await api
//       .put(`/api/blogs/${blogToUpdate.id}`)
//       .send(blogToUpdate)
//       .expect(200)

//     const blogsAtEnd = await helper.blogsInDb()

//     const titles = blogsAtEnd.map(r => r.title)
//     assert(titles.includes(blogToUpdate.title))
//     assert(!titles.includes(blogToUpdate.title))
//   })
