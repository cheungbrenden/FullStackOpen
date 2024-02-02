const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const middleware = require('../utils/middleware')

blogsRouter.get('/', async (request, response) => {

  const blog = await Blog
    .find({}).populate('user', { username: 1, name: 1 })

  response.json(blog)
})


blogsRouter.post('/', middleware.userExtractor, async (request, response) => {
  const body = request.body

  const user = request.user

  if (body.title === undefined || body.url === undefined) {
    response.status(400).json({ error: 'title or url missing' }).end()
  }
  else {
    const blog = new Blog({
      title: body.title,
      url: body.url,
      author: body.author,
      likes: body.likes ? body.likes : 0,
      user: user._id
    })

    const savedBlog = await blog.save()

    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()

    response.status(201).json(savedBlog)
  }
})

blogsRouter.delete('/:id', middleware.userExtractor, async (request, response) => {
  const id = request.params.id

  const user = request.user

  const blogToDelete = await Blog.findById(id);

  if (!blogToDelete || user.id !== blogToDelete.user.toString()) {
    return response.status(401).json({ error: 'Unauthorized: Invalid token or blog not found' });
  }

  await Blog.findByIdAndDelete(id)

  user.blogs = user.blogs.filter(blog => blog.toString() !== id)
  await user.save()

  response.status(204).end()

})

blogsRouter.put('/:id', middleware.userExtractor, async (request, response) => {
  const body = request.body
  const user = request.user
  const id = request.params.id

  const blogToUpdate = await Blog.findById(id);


  if (body.title === undefined || body.url === undefined) {
    return response.status(400).json({ error: 'title or url missing' }).end()
  }

  if (!blogToUpdate || user.id !== blogToUpdate.user.toString()) {
    return response.status(401).json({ error: 'Unauthorized: Invalid token or blog not found' });
  }


  const blog = { ...body, likes: body.likes ? body.likes : 0 }

  const updatedBlog = await Blog.findByIdAndUpdate(id, blog, { new: true })

  response.status(201).json(updatedBlog)





  // const id = request.params.id
  // const body = request.body

  // const blog = { ...body, likes: body.likes ? body.likes : 0 }


  // const updatedBlog = await Blog.findByIdAndUpdate(id, blog, { new: true })
  // response.status(201).json(updatedBlog)

})



module.exports = blogsRouter