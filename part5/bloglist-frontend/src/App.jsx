import { useState, useEffect } from 'react'
import Blog from './components/Blog'
import Notification from './components/Notification'
import blogService from './services/blogs'
import loginService from './services/login'


const App = () => {
  const [blogs, setBlogs] = useState([])
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)
  const [message, setMessage] = useState(null)
  const [messageType, setMessageType] = useState(null)

  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [url, setUrl] = useState('')



  useEffect(() => {
    blogService.getAll().then(blogs =>
      setBlogs(blogs)
    )
  }, [])

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedBlogappUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      blogService.setToken(user.token)
    }
  }, [])


  const handleLogin = async (e) => {
    e.preventDefault()

    try {
      const user = await loginService.login({
        username, password
      })

      window.localStorage.setItem(
        'loggedBlogappUser', JSON.stringify(user)
      )

      blogService.setToken(user.token)
      setUser(user)
      setUsername('')
      setPassword('')
      setMessage('Successful login!')
      setMessageType('success')
      setTimeout(() => {
        setMessage(null)
      }, 5000)

    } catch (exception) {
      setMessage('Wrong username or password')
      setMessageType('fail')
      setTimeout(() => {
        setMessage(null)
      }, 5000)
    }
  }

  const handleAddNewBlog = async (e) => {
    e.preventDefault()

    try {
      const newBlog = { title, author, url, user }

      await blogService.create(newBlog)
  
      const updatedBlogs = await blogService.getAll()
      setBlogs(updatedBlogs)
      setMessage(`a new blog ${newBlog.title} by ${newBlog.author} added`)
      setMessageType('success')
      setTimeout(() => {
        setMessage(null)
      }, 5000)
    }
    catch (exception) {
      console.log(exception)
      setMessage(`Error with adding blog: ${exception.response.data.error}`)
      setMessageType('fail')
      setTimeout(() => {
        setMessage(null)
      }, 5000)
    }


  }


  const logout = () => {
    window.localStorage.removeItem('loggedBlogappUser')
    setUser(null)
    setMessage('Logged Out!')
    setMessageType('success')
    setTimeout(() => {
      setMessage(null)
    }, 5000)
  }


  if (user === null) {
    return (
      <div>
        <h2>Log in to application</h2>
        <Notification message={message} type={messageType}/>
        <form onSubmit={handleLogin}>
          <div>
            username
            <input
              type="text"
              value={username}
              name="Username"
              onChange={({ target }) => setUsername(target.value)}
            />
          </div>
          <div>
            password
            <input
              type="text"
              value={password}
              name="Password"
              onChange={({ target }) => setPassword(target.value)}
            />
          </div>
          <button type="submit">login</button>
        </form>
      </div>


    )
  }

  return (

    <div>
      <h2>Blogs</h2>
      <Notification message={message} type={messageType}/>
      
      <div>{user.name} logged in<button type="submit" onClick={logout}>logout</button></div>
      <br />

      <h2>Create New</h2>
      <form onSubmit={handleAddNewBlog}>
        <div>title:
          <input 
          type="text"
          value={title}
          name="Title"
          onChange={({ target }) => setTitle(target.value)}/>
        </div>
        <div>author:
          <input 
          type="text"
          value={author}
          name="Author"
          onChange={({ target }) => setAuthor(target.value)}/>
        </div>
        <div>url:
          <input 
          type="text"
          value={url}
          name="Url"
          onChange={({ target }) => setUrl(target.value)}/>
        </div>
        <button type="submit">create</button>
      </form>
      


      <div>{blogs.map(blog =>
        <Blog key={blog.id} blog={blog} />
      )}</div>

    </div>
  )
}

export default App