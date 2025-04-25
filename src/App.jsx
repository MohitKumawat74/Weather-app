import {  Routes, Route } from 'react-router-dom'
import { useState } from 'react'
import Navbar from './components/Navbar'
import Home from './components/Home'
import Forecast from './components/Forecast'
import Maps from './components/Maps'

const App = () => {
  const [weatherData, setWeatherData] = useState(null)

  return (
    <>
     <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-700">
     <Navbar setWeatherData={setWeatherData} />
  
        <Routes>
          <Route path="/" element={<Home weatherData={weatherData} setWeatherData={setWeatherData} />} />
          <Route path="/forecast" element={<Forecast setWeatherData={setWeatherData} />} />
          <Route path="/maps" element={<Maps />} />
        </Routes>
     
    
  
    </div>
    </>
  )
}

export default App