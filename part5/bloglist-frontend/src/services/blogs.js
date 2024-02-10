import axios from 'axios'
const baseUrl = '/api/blogs'

let token = null

const setToken = newToken => {
  token = `Bearer ${newToken}`
}

const getAll = () => {
  const request = axios.get(baseUrl)
  return request.then(response => response.data)
}

const create = async newObject => {
  const config = {
    headers: { Authorization: token }
  }

  console.log("this should print")

  const response = await axios.post(baseUrl, newObject, config)
  // console.log(response)
  // if (response === null) {
  //   console.log('aaaaaaaaaaaaaaaaaaa')
  // }
  return response.data
}



export default { getAll, create, setToken }