import { useState, useEffect } from 'react'
import countriesService from './services/countries'
import ShowInfo from './components/showinfo'

const App = () => {
  
  const [countries, setCountries] = useState(null)
  const [search, setSearch] = useState("")
  const [selectedCountryWeather, setSelectedCountryWeather] = useState(null)
  
  const handleSearchChange = (e) => {
    setSearch(e.target.value)
  }

  const showCountry = (countryName) => {
    setSearch(countryName)
  }

    useEffect(() => {
    countriesService
      .getAllCountries()
      .then(countries => setCountries(countries))
  }, [])

  if (countries == null) {
    return null
  }

  return (
    <>
      <div>find countries <input value={search} onChange={handleSearchChange}/></div>
      <ShowInfo countries={countries} search={search} showCountry={showCountry} selectedCountryWeather={selectedCountryWeather} setSelectedCountryWeather={setSelectedCountryWeather}/>
    </>
    
  )
}







export default App
