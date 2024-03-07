const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const bcrypt = require('bcrypt')
const helper = require('./test_helper')
const Blog = require('../models/blog')
const User = require('../models/user')

//user_api.tests
describe('when there is initially one user at db', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'root', passwordHash })

    await user.save()
  })

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'lafal',
      name: 'Laura',
      password: 'salainen',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    assert(usernames.includes(newUser.username))
  })
})
describe('creation fails with proper statuscode and message', () => {
  test('if username already taken ', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'root',
      name: 'Superuser',
      password: 'salainen',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    assert(result.body.error.includes('expected `username` to be unique'))

    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })
  test('if username is too short', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'SR',
      name: 'Super Ruu',
      password: 'salainen',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    assert(result.body.error.includes('Username must be at least 3 digits'))
    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })
  test('if username is not provided', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      name: 'Super Ruu',
      password: 'salainen',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    assert(result.body.error.includes('Username must be at least 3 digits'))
    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })
  test('if password is too short', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'Tiikeri',
      name: 'Super Ruu',
      password: 'PW',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    assert(result.body.error.includes('Password must be at least 3 digits'))

    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })
  test('if password is not provided', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'Tiikeri',
      name: 'Super Ruu',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    assert(result.body.error.includes('Password must be at least 3 digits'))

    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })
})

//bloglist_api.tests
describe('when there is initially some blogs saved', () => {
  beforeEach(async () => {
    await Blog.deleteMany({})
    await Blog.insertMany(helper.initialBlogs)
  })

  test('there are two blogs which are returned as json', async () => {
    //4.8 sovellus palauttaa oikean määrän JSON-muotoisia blogeja
    const response = await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)

    assert.strictEqual(response.body.length, 2)
  })

  test('No underscore in id', async () => {
    //4.9  blogien identifioivan kentän tulee olla nimeltään id
    const response = await api.get('/api/blogs')
    const firstBlog = response.body[0]
    assert.ok(firstBlog.id)
    assert.strictEqual(firstBlog._id, undefined)
  })
})

describe('addition of a new note', () => {
  //2.23 korjaa token-kirjautumisen hajottamat testit
  //tee testi: jos pyynnön mukana ei ole tokenia, uuden blogin lisäys ei onnistu,
  //ja pyyntö palauttaa oikean statuskoodin 401 Unauthorized

  let newUser
  let loginResponse
  let token //let koska muuttujan arvo asetetaan myöhemmin

  test('login with new user', async () => {
    newUser = {
      username: 'testuser',
      name: 'Test User',
      password: 'password123',
    }
    // Luo uusi käyttäjä
    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)
    // Kirjaudu sisään luodulla käyttäjällä
    loginResponse = await api
      .post('/api/login')
      .send({ username: newUser.username, password: newUser.password })
      .expect(200)
      .expect('Content-Type', /application\/json/)
    token = loginResponse.body.token
  })
  test('post without token is not added, 401 Unauthorized', async () => {
    const newBlog = {
      title: 'this post has no token',
      author: 'Ihaa ja Ruu',
      url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
      likes: 4,
    }

    await api.post('/api/blogs').send(newBlog).expect(401)

    const response = await api.get('/api/blogs')
    assert.strictEqual(response.body.length, helper.initialBlogs.length)
  })
  test('blog without title and/or url is not added', async () => {
    //4.12 post ilman titleä ja urlia ei tallennu, pyyntöön vastataan statuskoodilla 400
    const newBlog = {
      //title: 'this post is missing info',
      author: 'Ihaa ja Ruu',
      //url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
      likes: 4,
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(400)

    const response = await api.get('/api/blogs')
    assert.strictEqual(response.body.length, helper.initialBlogs.length)
  })
  test('blog with too short title is not added', async () => {
    const newBlog = {
      title: 't',
      author: 'Ihaa ja Ruu',
      url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
      likes: 4,
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(400)

    const response = await api.get('/api/blogs')
    assert.strictEqual(response.body.length, helper.initialBlogs.length)
  })

  test('a valid blog can be added and it shows', async () => {
    //4.10 testi, joka varmistaa, että sovellukseen voi lisätä blogeja,
    //blogien määrä kasvaa yhdellä, oikeansisältöinen blogi on lisätty järjestelmään

    const newBlog = {
      title: 'async/await simplifies making async calls',
      author: 'Tiikeri',
      url: 'http://www.cs.utexas/EWD808.html',
      likes: 3,
    }
    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const response = await api.get('/api/blogs')
    const titles = response.body.map(r => r.title)

    assert.strictEqual(response.body.length, helper.initialBlogs.length + 1)
    assert(titles.includes('async/await simplifies making async calls'))
  })

  test('if likes are not given, value is zero', async () => {
    //4.11 tykkäysten default on nolla
    const newBlog = {
      title: 'this blog has no likes',
      author: 'Risto Räppääjä',
      url: 'http://www.cs.utexas.edu/~EWD/',
    }
    const blogWithoutLikes = await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(201)

    assert.strictEqual(blogWithoutLikes.body.likes, 0)
  })

  test('a blog can be deleted with a valid token', async () => {
    //4.13 blogin poistaminen ja deleten testaaminen
    const blogsAtStart = await helper.blogsInDb()
    const lastIndex = blogsAtStart.length - 1
    const blogToDelete = blogsAtStart[lastIndex]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204)

    const blogsAtEnd = await helper.blogsInDb()

    const titles = blogsAtEnd.map(r => r.title)
    assert(!titles.includes(blogToDelete.title))

    assert.strictEqual(blogsAtEnd.length, blogsAtStart.length - 1)
  })
  test('a blog cant be deleted without a valid token', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const lastIndex = blogsAtStart.length - 1
    const blogToDelete = blogsAtStart[lastIndex]

    await api.delete(`/api/blogs/${blogToDelete.id}`).expect(401)

    const blogsAtEnd = await helper.blogsInDb()

    const titles = blogsAtEnd.map(r => r.title)
    assert(titles.includes(blogToDelete.title))

    assert.strictEqual(blogsAtEnd.length, blogsAtStart.length)
  })

  test('Update likes', async () => {
    //4.14 yksittäisen blogin muokkaaminen ja PUT:in testaaminen
    const blogsAtStart = await helper.blogsInDb()
    const lastIndex = blogsAtStart.length - 1
    const blogToUpdate = blogsAtStart[lastIndex]

    const update = {
      id: blogToUpdate.id,
      likes: 15,
    }
    const blogWithNewLikes = await api
      .put(`/api/blogs/${update.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send(update)
      .expect(200)

    assert.strictEqual(blogWithNewLikes.body.likes, 15)
  })
  test('Update url', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const lastIndex = blogsAtStart.length - 1
    const blogToUpdate = blogsAtStart[lastIndex]

    const update = {
      id: blogToUpdate.id,
      url: 'http://www.uusiUrl.fi',
    }

    await api
      .put(`/api/blogs/${update.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send(update)
      .expect(200)

    const blogsAtEnd = await helper.blogsInDb()

    const urls = blogsAtEnd.map(r => r.url)
    assert(urls.includes(update.url))
    assert(!urls.includes(blogToUpdate.url))
  })
})
after(async () => {
  await mongoose.connection.close()
})

// describe('login success', () => {
//   test('login with new user', async () => {
//     let newUser
//     let loginResponse
//     let token

//     newUser = {
//       username: 'testuser',
//       name: 'Test User',
//       password: 'password123',
//     }
//     // Luo uusi käyttäjä
//     await api
//       .post('/api/users')
//       .send(newUser)
//       .expect(201)
//       .expect('Content-Type', /application\/json/)
//     // Kirjaudu sisään luodulla käyttäjällä
//     loginResponse = await api
//       .post('/api/login')
//       .send({ username: newUser.username, password: newUser.password })
//       .expect(200)
//       .expect('Content-Type', /application\/json/)
//     token = loginResponse.body.token
//   })
// })
