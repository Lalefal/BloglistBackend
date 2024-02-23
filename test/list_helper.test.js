const { test, describe } = require('node:test')
const assert = require('node:assert')
const listHelper = require('../utils/list_helper')
const blogsList = require('./blogs_list')

describe('listhelper', () => {
  test('dummy returns one', () => {
    const blogs = []

    const result = listHelper.dummy(blogs)
    assert.strictEqual(result, 1)
  })
})
describe('total likes', () => {
  const listWithNoBlogs = []
  const listWithOneBlog = [
    {
      _id: '5a422aa71b54a676234d17f8',
      title: 'Go To Statement Considered Harmful',
      author: 'Edsger W. Dijkstra',
      url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
      likes: 5,
      __v: 0,
    },
  ]
  test('of empty list is zero', () => {
    const result = listHelper.totalLikes(listWithNoBlogs)
    assert.strictEqual(result, 0)
  })
  test('One blog total likes', () => {
    const result = listHelper.totalLikes(listWithOneBlog)
    assert.strictEqual(result, 5)
  })

  test('of a bigger list is calculated right', () => {
    const result = listHelper.totalLikes(blogsList)
    assert.strictEqual(result, 36)
  })
})

describe('the most liked blog of them all', () => {
  test('has most likes', () => {
    const result = listHelper.favoriteBlog(blogsList)
    assert.strictEqual(result.likes, 12)
  })
})

describe('the most active author', () => {
  test('has the most blogs', () => {
    const result = listHelper.mostBlogs(blogsList)
    assert.strictEqual(result.author, 'Robert C. Martin')
  })
})

describe('the most liked author of them all', () => {
  test('has the most likes', () => {
    const result = listHelper.mostLikes(blogsList)
    assert.strictEqual(result.author, 'Edsger W. Dijkstra')
  })
})
