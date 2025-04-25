import { useState } from 'react'
import { FiSearch, FiMapPin, FiHome, FiX } from 'react-icons/fi'
import { useNavigate, useLocation } from 'react-router-dom'
import '../componentscss/Navbar.css'

const Navbar = ({ setWeatherData }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
  const API_URL = `https://api.openweathermap.org/data/2.5/weather?units=metric&appid=${API_KEY}`;

  const fetchWeather = async (locationData) => {
    setLoading(true)
    setError('')
    try {
      let url = API_URL
      if (typeof locationData === 'object') {
        url += `&lat=${locationData.latitude}&lon=${locationData.longitude}`
      } else {
        url += `&q=${locationData}`
      }
      
      const response = await fetch(url)
      const data = await response.json()
      
      if (data.cod === 200) {
        setWeatherData(data)
        localStorage.setItem('lastSearchedCity', data.name)
        const currentPath = location.pathname || '/'
        navigate(`${currentPath}?city=${encodeURIComponent(data.name)}`)
        setMobileMenuOpen(false)
      } else {
        setError(data.message || 'City not found')
      }
    } catch (err) {
      setError('Failed to fetch weather data')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      fetchWeather(searchQuery)
      setSearchQuery('')
    }
  }

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeather({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          })
        },
        () => {
          setError('Geolocation permission denied')
        }
      )
    } else {
      setError('Geolocation is not supported by your browser')
    }
  }

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  return (
    <nav className="navbar-container">
      <div className="navbar-content">
        <div className="navbar-main">
          {/* Logo */}
          <div className="logo-container">
            <FiHome className="logo-icon" />
            <span className="logo-text">WeatherCast</span>
          </div>

          {/* Desktop Navigation */}
          <div className="desktop-nav">
            <a href="/" className="nav-link">Home</a>
            <a href="/forecast" className="nav-link">Forecast</a>
            <a href="/maps" className="nav-link">Maps</a>
          </div>

          {/* Search Form */}
          <div className="search-container">
            <form onSubmit={handleSearch} className="search-form">
              <div className="search-input-container">
                <FiSearch className="search-icon" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search city..."
                  className="search-input"
                />
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  className="location-button"
                  title="Use my location"
                >
                  <FiMapPin className="location-icon" />
                </button>
              </div>
              <button type="submit" className="search-button">
                Search
              </button>
            </form>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="mobile-menu-button"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <FiX className="menu-icon" />
            ) : (
              <svg
                className="menu-icon"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
          <a href="/" className="mobile-nav-link">Home</a>
          <a href="/forecast" className="mobile-nav-link">Forecast</a>
          <a href="/maps" className="mobile-nav-link">Maps</a>
        </div>

        {/* Error message */}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* Loading indicator */}
        {loading && (
          <div className="loading-indicator">
            Loading weather data...
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar