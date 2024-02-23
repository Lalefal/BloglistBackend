const dummy = blogs => {
  return 1
}

const totalLikes = blogs => {
  return blogs.reduce((sum, blog) => sum + blog.likes, 0)
}

const favoriteBlog = blogs => {
  const mostLikes = blogs.reduce((maxLikes, blog) => {
    return blog.likes > maxLikes ? blog.likes : maxLikes
  }, 0)
  const mostLikedBlog = blogs.find(blog => blog.likes === mostLikes)
  const result = {
    title: mostLikedBlog.title,
    author: mostLikedBlog.author,
    likes: mostLikedBlog.likes,
  }
  //console.log(result)
  return result
}

const mostBlogs = blogs => {
  const blogCount = blogs.reduce((count, blog) => {
    count[blog.author] = (count[blog.author] || 0) + 1
    return count
  }, {})
  const mostBlogsAuthor = Object.keys(blogCount).reduce((a, b) =>
    blogCount[a] > blogCount[b] ? a : b
  )
  const result = { author: mostBlogsAuthor, blogs: blogCount[mostBlogsAuthor] }
  //console.log(result)
  return result
}

const mostLikes = blogs => {
  const authorsLikes = blogs.reduce((count, blog) => {
    count[blog.author] = (count[blog.author] || 0) + blog.likes
    return count
  }, {})

  const mostLikedAuthor = Object.keys(authorsLikes).reduce((a, b) => {
    return authorsLikes[a] > authorsLikes[b] ? a : b
  })

  const result = {
    author: mostLikedAuthor,
    likes: authorsLikes[mostLikedAuthor],
  }
  console.log(result)
  return result
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
}

//apufunktioita ja yksikkötestejä,
//4.3 dummy, saa parametrikseen taulukollisen blogeja
//      ja palauttaa aina luvun 1.
//4.4 totalLikes, saa parametrikseen taulukollisen blogeja,
//      palauttaa blogien yhteenlaskettujen tykkäysten määrän.
//4.5 funktio favoriteBlog selvittää millä blogilla on eniten tykkäyksiä
//4.6  funktio mostBlogs, selvittää kirjoittajan, jolla on eniten blogeja.
//      Funktion paluuarvo kertoo myös ennätysbloggaajan blogien määrän
//4.7 funktio mostLikes selvittää kirjoittajan, jonka blogeilla on eniten tykkäyksiä
//      paluuarvo kertoo myös suosikkibloggaajan likejen yhteenlasketun määrän
