import { FiDroplet, FiWind } from 'react-icons/fi'
import { useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import '../componentscss/Home.css'

const Home = ({ weatherData, setWeatherData }) => {
  const location = useLocation()
  
  // Get city from URL or localStorage
  const queryParams = new URLSearchParams(location.search)
  const city = queryParams.get('city') || localStorage.getItem('lastSearchedCity')

  useEffect(() => {
    if (city && !weatherData) {
      // Fetch weather data if city is in URL/localStorage but no weatherData
      const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY
      const API_URL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`
      
      fetch(API_URL)
        .then(response => response.json())
        .then(data => {
          if (data.cod === 200) {
            setWeatherData(data)
          }
        })
    }
  }, [city, weatherData, setWeatherData])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-100">
      <div className="py-12 px-4">
        <div className="max-w-md mx-auto bg-white/80 backdrop-blur-sm rounded-xl shadow-md overflow-hidden p-6">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Weather App</h1>
          
          {weatherData ? (
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-800">
                {weatherData.name}, {weatherData.sys.country}
              </h2>
              <div className="flex justify-center items-center my-4">
                <img
                  src={`https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`}
                  alt={weatherData.weather[0].description}
                  className="w-20 h-20"
                />
                <span className="text-5xl font-bold text-gray-800">
                  {Math.round(weatherData.main.temp)}°C
                </span>
              </div>
              <p className="text-xl text-gray-700 capitalize">
                {weatherData.weather[0].description}
              </p>
              
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-white/70 p-3 rounded-lg">
                  <p className="text-gray-600">Feels Like</p>
                  <p className="font-semibold">{Math.round(weatherData.main.feels_like)}°C</p>
                </div>
                <div className="bg-white/70 p-3 rounded-lg">
                  <p className="text-gray-600">Humidity</p>
                  <p className="font-semibold">{weatherData.main.humidity}%</p>
                </div>
                <div className="bg-white/70 p-3 rounded-lg">
                  <p className="text-gray-600">Wind Speed</p>
                  <p className="font-semibold">{weatherData.wind.speed} m/s</p>
                </div>
                <div className="bg-white/70 p-3 rounded-lg">
                  <p className="text-gray-600">Pressure</p>
                  <p className="font-semibold">{weatherData.main.pressure} hPa</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-600">
            {city ? `Loading weather for ${city}...` : 'Search for a city or use your location to see weather data'}
          </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Home