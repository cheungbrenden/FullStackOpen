const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const bcrypt = require('bcrypt')
const api = supertest(app)
const helper = require('./test_helper')
const Blog = require('../models/blog')
const User = require('../models/user')


beforeEach(async () => {
  await User.deleteMany({})

  const passwordHash1 = await bcrypt.hash("samplepassword", 10)
  const passwordHash2 = await bcrypt.hash("aaaa", 10)
  const user1 = new User({
    username: "cheungbrenden",
    name: "brendy",
    blogs: [],
    passwordHash: passwordHash1
  })

  const user2 = new User({
    username: "tammyxie",
    name: "tammy",
    blogs: [],
    passwordHash: passwordHash2
  })

  await user1.save()
  await user2.save()
})

beforeEach(async () => {
  await Blog.deleteMany({})

  const users = await User.find({})
  const user = users[0]

  const blogObjects = helper.initialBlogs
    .map(blog => new Blog({
      title: blog.title,
      author: blog.author,
      url: blog.url,
      user: user._id,
      likes: blog.likes ? blog.likes : 0
    }))

  const promiseArray = blogObjects.map(blog => {
    blog.save()
    user.blogs = user.blogs.concat(blog._id)
  })
  await Promise.all(promiseArray)
  await user.save()

})




test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('correct amount of blog posts are returned', async () => {
  const response = await api.get('/api/blogs')
  expect(response.body).toHaveLength(helper.initialBlogs.length)
})

test('verifies that the unique identifier property of the blog posts is named id', async () => {
  const response = await api.get('/api/blogs')
  response.body.forEach(blog => {
    expect(blog.id).toBeDefined()
  })
})

test('making HTTP POST request creates new blog post', async () => {

  const user = {
    username: "cheungbrenden",
    password: "samplepassword"
  }

  const loginUser = await api
    .post('/api/login')
    .send(user)
    .expect(200)

  const newBlog = {
    title: "New Blog Title",
    author: "Unknown Author",
    url: "www.fakewebsite.com",
    likes: 1000,
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .set('Authorization', `Bearer ${loginUser.body.token}`)
    .expect(201)
    .expect('Content-Type', /application\/json/)


  const expectedBlogs = await helper.blogsInDb()

  expect(expectedBlogs).toHaveLength(helper.initialBlogs.length + 1)

  const blogTitles = expectedBlogs.map(blog => blog.title)

  expect(blogTitles).toContain("New Blog Title")
})

test('blog cannot be added by unauthorized users', async () => {
  const user = {
    username: "cheungbrenden",
    password: "wrongpassword"
  }

  const loginUser = await api
    .post('/api/login')
    .send(user)
    .expect(401)

  const newBlog = {
    title: "New Blog Title",
    author: "Unknown Author",
    url: "www.fakewebsite.com",
    likes: 1000,
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .set('Authorization', `Bearer ${loginUser.body.token}`)
    .expect(401)
    .expect('Content-Type', /application\/json/)

  const expectedBlogs = await helper.blogsInDb()

  expect(expectedBlogs).toHaveLength(helper.initialBlogs.length)


})


test('if likes property is missing from request, default to 0', async () => {

  const user = {
    username: "cheungbrenden",
    password: "samplepassword"
  }

  const loginUser = await api
    .post('/api/login')
    .send(user)

  const newBlog = {
    title: "New Blog Title",
    author: "Unknown Author",
    url: "www.fakewebsite.com",
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .set('Authorization', `Bearer ${loginUser.body.token}`)
    .expect(201)
    .expect('Content-Type', /application\/json/)


  const expectedBlogs = await helper.blogsInDb()
  const addedNewBlog = expectedBlogs.find(blog => blog.title === "New Blog Title")
  expect(addedNewBlog.likes).toEqual(0)

})

test("400 Bad Request if title or url properties missing", async () => {

  const user = {
    username: "cheungbrenden",
    password: "samplepassword"
  }

  const loginUser = await api
    .post('/api/login')
    .send(user)

  const missingTitle = {
    author: "Unknown Author",
    url: "www.fakewebsite.com",
    likes: 1000,
  }

  const missingUrl = {
    title: "New Blog Title",
    author: "Unknown Author",
    likes: 1000,
  }

  const missingTitleResult = await api
    .post('/api/blogs')
    .send(missingTitle)
    .set('Authorization', `Bearer ${loginUser.body.token}`)
    .expect(400)

  expect(missingTitleResult.body.error).toContain('title or url missing')

  const missingUrlResult = await api
    .post('/api/blogs')
    .send(missingUrl)
    .set('Authorization', `Bearer ${loginUser.body.token}`)
    .expect(400)

  expect(missingUrlResult.body.error).toContain('title or url missing')

  const expectedBlogs = await helper.blogsInDb()
  expect(expectedBlogs).toHaveLength(helper.initialBlogs.length)

})

describe("deletion of a blog", () => {
  test("succeeds with status code 204 if blog id is valid", async () => {

    const user = {
      username: "cheungbrenden",
      password: "samplepassword"
    }

    const loginUser = await api
      .post('/api/login')
      .send(user)

    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', `Bearer ${loginUser.body.token}`)
      .expect(204)

    const blogsAfterDeletion = await helper.blogsInDb()
    expect(blogsAfterDeletion).toHaveLength(blogsAtStart.length - 1)

    const blogTitles = blogsAfterDeletion.map(blog => blog.title)
    expect(blogTitles).not.toContain(blogToDelete.title)

    const users = await helper.usersInDb()
    const userWithDeletedBlog = users.find(user => user.id === blogToDelete.user.toString())

    const blogTitlesOfUserWithDeletedBlog = userWithDeletedBlog.blogs.map(blog => blog.title)

    expect(blogTitlesOfUserWithDeletedBlog).not.toContain(blogToDelete.title)

  })

  test("fails with status code 400 if blog id is invalid", async () => {
    const user = {
      username: "cheungbrenden",
      password: "samplepassword"
    }

    const loginUser = await api
      .post('/api/login')
      .send(user)

    const invalidId = 'aaaaaaaaaaaaaa'

    await api
      .delete(`/api/blogs/${invalidId}`)
      .set('Authorization', `Bearer ${loginUser.body.token}`)
      .expect(400)

  })

  test("blog cannot be deleted by unauthorized user", async () => {
    const invalidUser = {
      username: "cheungbrenden",
      password: "wrongpassword"
    }

    const wrongValidUser = {
      username: "tammyxie",
      password: "aaaa"
    }

    const loginUser1 = await api
      .post('/api/login')
      .send(invalidUser)
      .expect(401)

    const loginUser2 = await api
      .post('/api/login')
      .send(wrongValidUser)
      .expect(200)

    const blogsStart = await helper.blogsInDb()
    const blog = blogsStart[0]

    await api
      .delete(`/api/blogs/${blog.id}`)
      .set('Authorization', `Bearer ${loginUser1.body.token}`)
      .expect(401)

    await api
      .delete(`/api/blogs/${blog.id}`)
      .set('Authorization', `Bearer ${loginUser2.body.token}`)
      .expect(401)

    const blogsEnd = await helper.blogsInDb()
    expect(blogsStart).toHaveLength(blogsEnd.length)

  })

})

describe("updating blog", () => {

  test("succeeds with status code 201 if likes updated", async () => {

    const user = {
      username: "cheungbrenden",
      password: "samplepassword"
    }

    const loginUser = await api
      .post('/api/login')
      .send(user)
      .expect(200)


    const blogsAtStart = await helper.blogsInDb()
    const blogToUpdate = blogsAtStart[0]
    const updatedNumberOfLikes = 15
    const updatedBlog = { ...blogToUpdate, likes: updatedNumberOfLikes }

    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(updatedBlog)
      .set('Authorization', `Bearer ${loginUser.body.token}`)
      .expect(201)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(blogsAtStart.length)
    expect(blogsAtEnd).toContainEqual(updatedBlog)
  })

  test("blog cannot be updated by unauthorized user", async () => {
    const invalidUser = {
      username: "cheungbrenden",
      password: "wrongpassword"
    }

    const wrongValidUser = {
      username: "tammyxie",
      password: "aaaa"
    }

    const loginUser1 = await api
      .post('/api/login')
      .send(invalidUser)
      .expect(401)

    const loginUser2 = await api
      .post('/api/login')
      .send(wrongValidUser)
      .expect(200)

    const blogsStart = await helper.blogsInDb()
    const blog = blogsStart[0]
    const updatedBlog = { ...blog, likes: 15 }

    await api
      .put(`/api/blogs/${blog.id}`)
      .send(updatedBlog)
      .set('Authorization', `Bearer ${loginUser1.body.token}`)
      .expect(401)

    await api
      .put(`/api/blogs/${blog.id}`)
      .send(updatedBlog)
      .set('Authorization', `Bearer ${loginUser2.body.token}`)
      .expect(401)


    const blogsEnd = await helper.blogsInDb()
    expect(blogsEnd).toHaveLength(blogsStart.length)
    expect(blogsEnd).not.toContainEqual(updatedBlog)
  })


})

describe("valid user", () => {

  test("create user succeeds", async () => {
    const newUser = {
      username: 'aaa',
      name: 'aaaa',
      password: 'aaa'
    }

    await api
      .post('/api/users/')
      .send(newUser)
      .expect(201)
  })

  test("username shorter than 3 characters", async () => {

    const startUsers = await helper.usersInDb()

    const newUser = {
      username: 'aa',
      name: 'aaaa',
      password: 'aaa'
    }

    await api
      .post('/api/users/')
      .send(newUser)
      .expect(400)

    const endUsers = await helper.usersInDb()
    expect(startUsers).toHaveLength(endUsers.length)
  })

  test("username not unique", async () => {

    const startUsers = await helper.usersInDb()

    const repeatUsername = {
      username: 'cheungbrenden',
      name: 'whatever',
      password: 'also_whatever'
    }

    await api
      .post('/api/users/')
      .send(repeatUsername)
      .expect(400)

    const endUsers = await helper.usersInDb()
    expect(startUsers).toHaveLength(endUsers.length)
  })

  test("password shorter than 3 characters", async () => {

    const startUsers = await helper.usersInDb()

    const newUser = {
      username: 'aaa',
      name: 'aaaa',
      password: 'aa'
    }

    const result = await api
      .post('/api/users/')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain("password length too short (must be > 2)")

    const endUsers = await helper.usersInDb()
    expect(startUsers).toHaveLength(endUsers.length)
  })

  test("username is required", async () => {

    const startUsers = await helper.usersInDb()

    const newUser = {
      name: 'aaaa',
      password: 'aaa'
    }

    const result = await api
      .post('/api/users/')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('username required')

    const endUsers = await helper.usersInDb()
    expect(startUsers).toHaveLength(endUsers.length)

  })

  test("password is required", async () => {

    const startUsers = await helper.usersInDb()

    const newUser = {
      username: 'aaa',
      name: 'aaaa',
    }

    const result = await api
      .post('/api/users/')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('password required')

    const endUsers = await helper.usersInDb()
    expect(startUsers).toHaveLength(endUsers.length)

  })
})

afterAll(async () => {
  await mongoose.connection.close()
})