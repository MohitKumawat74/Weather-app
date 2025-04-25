import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import { useNavigate } from 'react-router-dom'
import 'leaflet/dist/leaflet.css'
import { FiZoomIn, FiZoomOut, FiRefreshCw, FiSearch } from 'react-icons/fi' // ✅ Add this line
import '../componentscss/Maps.css'

const MapClickHandler = ({ API_KEY }) => {
  const navigate = useNavigate()

  useMapEvents({
    click: async (e) => {
      const lat = e.latlng.lat
      const lon = e.latlng.lng

      try {
        const response = await fetch(
          `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`
        )
        const data = await response.json()

        if (data.length > 0 && data[0].name) {
          const city = data[0].name
          navigate(`/?city=${encodeURIComponent(city)}`)
        } else {
          console.warn('No city found at clicked location.')
        }
      } catch (err) {
        console.error('Reverse geocoding failed:', err)
      }
    }
  })

  return null
}


// 📍 Smooth fly-to animation when cityCoords updates
const MapFlyTo = ({ coords }) => {
  const map = useMap()
  useEffect(() => {
    map.flyTo(coords, 8)
  }, [coords, map])
  return null
}

// 🧭 Main component
const Maps = () => {
  const [selectedLayer, setSelectedLayer] = useState('clouds')
  const [action, setAction] = useState('')
  const [searchCity, setSearchCity] = useState('')
  const [cityCoords, setCityCoords] = useState([20.5937, 78.9629]) // Default: India

  const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY

  const layerURLs = {
    temperature: 'temp_new',
    precipitation: 'precipitation_new',
    wind: 'wind_new',
    clouds: 'clouds_new',
    pressure: 'pressure_new',
    humidity: 'humidity_new',
  }

  const currentLayer = layerURLs[selectedLayer]

  const handleSearch = async () => {
    if (!searchCity) return
    try {
      const res = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${searchCity}&limit=1&appid=${API_KEY}`
      )
      const data = await res.json()
      if (data.length > 0) {
        setCityCoords([data[0].lat, data[0].lon])
      }
    } catch (err) {
      console.error('Error fetching city coordinates:', err)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Weather Maps</h1>

        {/* Layer & Action Controls */}
        <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
          <div className="flex space-x-2">
            {Object.keys(layerURLs).map((key) => (
              <button
                key={key}
                onClick={() => setSelectedLayer(key)}
                className={`px-4 py-2 rounded-lg capitalize ${
                  selectedLayer === key ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'
                }`}
              >
                {key}
              </button>
            ))}
          </div>

          <div className="flex space-x-2">
            <button onClick={() => setAction('zoomIn')} className="p-2 bg-white rounded-lg hover:bg-gray-100">
              <FiZoomIn />
            </button>
            <button onClick={() => setAction('zoomOut')} className="p-2 bg-white rounded-lg hover:bg-gray-100">
              <FiZoomOut />
            </button>
            <button onClick={() => setAction('refresh')} className="p-2 bg-white rounded-lg hover:bg-gray-100">
              <FiRefreshCw />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Search location..."
            value={searchCity}
            onChange={(e) => setSearchCity(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 w-full md:w-64"
          />
          <FiSearch className="absolute left-3 top-3 text-gray-400" />
        </div>

        {/* Map Display */}
        <div className="overflow-hidden rounded-xl shadow-lg border border-gray-200">
          <MapContainer
            center={cityCoords}
            zoom={5}
            scrollWheelZoom={true}
            style={{ height: '500px', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />
            <TileLayer
              url={`https://tile.openweathermap.org/map/${currentLayer}/{z}/{x}/{y}.png?appid=${API_KEY}`}
              attribution="&copy; OpenWeatherMap"
            />
            <MapFlyTo coords={cityCoords} />
            <MapClickHandler API_KEY={API_KEY} />
          </MapContainer>
        </div>
      </div>
    </div>
  )
}

export default Maps
