import axios from 'axios'

const countriesBaseURL = 'https://studies.cs.helsinki.fi/restcountries/api/all'

const api_key = import.meta.env.VITE_SOME_KEY
const weatherBaseURL = 'https://api.openweathermap.org/data/2.5/weather?'


const getAllCountries = () => {
    const request = axios.get(countriesBaseURL)
    return request.then(response => response.data)
}

const getWeatherReport = (lat, lon) => {
    const request = axios.get(`${weatherBaseURL}lat=${lat}&lon=${lon}&units=metric&appid=${api_key}`)
    return request.then(response => response.data)
}


export default { getAllCountries, getWeatherReport }