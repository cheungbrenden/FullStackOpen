import countriesService from '../services/countries'

const ShowInfo = ({ countries, search, showCountry, selectedCountryWeather, setSelectedCountryWeather }) => {

    const filteredCountries = countries.filter(country => country.name.common.toLowerCase().includes(search.toLowerCase()))

    if (filteredCountries.length > 10) {
        return (
            <div>Too many matches, specify another filter</div>
        )
    }

    const isSearchExact = filteredCountries.find((country) => search.toLowerCase() == country.name.common.toLowerCase())

    if (filteredCountries.length > 1 && isSearchExact == null) {
        return (
            <>
                {filteredCountries.map(
                    country =>
                        <div key={country.name.common}>{country.name.common} <button onClick={() => showCountry(country.name.common)}>show</button></div>
                )}
            </>
        )
    }


    if (filteredCountries.length == 1 || isSearchExact != null) {

        const selectedCountry = isSearchExact ? isSearchExact : filteredCountries[0]

        const [lat, lon] = selectedCountry.name.common == "United States Minor Outlying Islands"
            ? [selectedCountry.latlng[0], selectedCountry.latlng[1]]
            : [selectedCountry.capitalInfo.latlng[0], selectedCountry.capitalInfo.latlng[1]]

        countriesService
            .getWeatherReport(lat, lon)
            .then(country => setSelectedCountryWeather(country))

        if (selectedCountryWeather == null) {
            return null
        }


        return (
            <>
                <h1>{selectedCountry.name.common}</h1>
                <div>
                    capital {selectedCountry.capital}
                </div>
                <div>
                    area {selectedCountry.area} km<sup>2</sup>
                </div>
                <b>languages</b>
                <ul>
                    {Object.values(selectedCountry.languages).map(language => <li key={language}>{language}</li>)}
                </ul>
                <img src={selectedCountry.flags.png} alt="country" />

                <h2>Weather in {selectedCountry.capital}</h2>
                <div>temperature {selectedCountryWeather.main.temp} Celsius</div>
                <img src={`https://openweathermap.org/img/wn/${selectedCountryWeather.weather[0].icon}@2x.png`} />
                <div>wind {selectedCountryWeather.wind.speed} m/s</div>
            </>

        )
    }
}


export default ShowInfo