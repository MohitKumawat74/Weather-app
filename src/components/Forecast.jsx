import { useState, useEffect } from 'react';
import { FiDroplet, FiWind, FiSun } from 'react-icons/fi';
import { WiRain, WiCloudy, WiDaySunny } from 'weather-icons-react';
import { useLocation } from 'react-router-dom';
import '../componentscss/Forecast.css'

const Forecast = ({ setWeatherData }) => {
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDay, setSelectedDay] = useState(0);
  const location = useLocation();
  
  // Get city from URL or localStorage
  const queryParams = new URLSearchParams(location.search);
  const city = queryParams.get('city') || localStorage.getItem('lastSearchedCity') || 'New Delhi';

  // Function to process API forecast data into daily format
  const processForecastData = (list) => {
    const dailyData = [];
    // Get one reading per day (assuming 3-hour intervals, 8 readings per day)
    for (let i = 0; i < 5; i++) { // For 5 days
      const dayData = list[i * 8]; // Get one reading per day
      if (!dayData) break;
      
      dailyData.push({
        date: i === 0 ? 'Today' : 
              i === 1 ? 'Tomorrow' : 
              new Date(dayData.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' }),
        temp: {
          max: Math.round(dayData.main.temp_max),
          min: Math.round(dayData.main.temp_min)
        },
        weather: {
          main: dayData.weather[0].main,
          description: dayData.weather[0].description,
          icon: dayData.weather[0].icon
        },
        humidity: dayData.main.humidity,
        wind: Math.round(dayData.wind.speed * 3.6), // Convert m/s to km/h
        precipitation: dayData.pop ? Math.round(dayData.pop * 100) : 0 // Probability of precipitation
      });
    }
    return dailyData;
  };

  // Fallback mock data generator
  const getMockData = (city) => {
    return {
      city: city,
      country: "Country",
      daily: [
        {
          date: "Today",
          temp: { max: 32, min: 26 },
          weather: { main: "Sunny", description: "Clear sky", icon: "01d" },
          humidity: 45,
          wind: 12,
          precipitation: 0,
        },
        {
          date: "Tomorrow",
          temp: { max: 31, min: 25 },
          weather: { main: "Partly Cloudy", description: "Partly cloudy", icon: "02d" },
          humidity: 55,
          wind: 10,
          precipitation: 20,
        },
        {
          date: "Wed",
          temp: { max: 29, min: 24 },
          weather: { main: "Rain", description: "Light rain", icon: "10d" },
          humidity: 75,
          wind: 8,
          precipitation: 80,
        },
        {
          date: "Thu",
          temp: { max: 30, min: 25 },
          weather: { main: "Cloudy", description: "Overcast clouds", icon: "03d" },
          humidity: 65,
          wind: 9,
          precipitation: 30,
        },
        {
          date: "Fri",
          temp: { max: 33, min: 27 },
          weather: { main: "Sunny", description: "Clear sky", icon: "01d" },
          humidity: 40,
          wind: 11,
          precipitation: 0,
        }
      ]
    };
  };

  useEffect(() => {
    const fetchForecast = async () => {
      try {
        setLoading(true);
        const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
        
        // First fetch current weather to ensure consistency
        const currentResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`
        );
        const currentData = await currentResponse.json();
        
        if (currentData.cod === 200) {
          setWeatherData(currentData);
          
          // Then fetch forecast
          const forecastResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${API_KEY}`
          );
          const forecastData = await forecastResponse.json();
          
          if (forecastData.cod === '200') {
            const processedData = {
              city: forecastData.city.name,
              country: forecastData.city.country,
              daily: processForecastData(forecastData.list)
            };
            setForecastData(processedData);
          } else {
            setError(forecastData.message || 'Forecast not available');
            setForecastData(getMockData(city));
          }
        } else {
          setError(currentData.message || 'City not found');
          setForecastData(getMockData(city));
        }
      } catch (err) {
        setError('Failed to load forecast data');
        setForecastData(getMockData(city));
      } finally {
        setLoading(false);
      }
    };

    fetchForecast();
  }, [city, setWeatherData]);

  // ... rest of your component (getWeatherIcon and return statement) remains the same
  const getWeatherIcon = (iconCode) => {
    switch(iconCode) {
      case '01d': return <WiDaySunny size={48} color="#F59E0B" />;
      case '02d': return <WiCloudy size={48} color="#94A3B8" />;
      case '10d': return <WiRain size={48} color="#3B82F6" />;
      default: return <WiDaySunny size={48} color="#F59E0B" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">5-Day Forecast</h1>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
            <p>{error}</p>
          </div>
        ) : forecastData ? (
          <>
            <div className="bg-white rounded-xl shadow-md p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                {forecastData.city}, {forecastData.country}
              </h2>
              
              {/* Day selector */}
              <div className="flex overflow-x-auto pb-2 mb-6 scrollbar-hide">
                {forecastData.daily.map((day, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedDay(index)}
                    className={`flex-shrink-0 px-4 py-2 mx-1 rounded-lg transition ${selectedDay === index ? 'bg-blue-100 text-blue-700 font-medium' : 'hover:bg-gray-100'}`}
                  >
                    {day.date}
                  </button>
                ))}
              </div>
              
              {/* Selected day forecast */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex flex-col items-center">
                  {getWeatherIcon(forecastData.daily[selectedDay].weather.icon)}
                  <p className="text-4xl font-bold text-gray-800 my-2">
                    {forecastData.daily[selectedDay].temp.max}° / {forecastData.daily[selectedDay].temp.min}°
                  </p>
                  <p className="text-xl text-gray-600 capitalize">
                    {forecastData.daily[selectedDay].weather.description}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center text-blue-600 mb-1">
                      <FiDroplet className="mr-2" />
                      <span className="text-sm">Humidity</span>
                    </div>
                    <p className="text-xl font-semibold">{forecastData.daily[selectedDay].humidity}%</p>
                  </div>
                  
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center text-blue-600 mb-1">
                      <FiWind className="mr-2" />
                      <span className="text-sm">Wind</span>
                    </div>
                    <p className="text-xl font-semibold">{forecastData.daily[selectedDay].wind} km/h</p>
                  </div>
                  
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center text-blue-600 mb-1">
                      <WiRain size={20} className="mr-2" />
                      <span className="text-sm">Precipitation</span>
                    </div>
                    <p className="text-xl font-semibold">{forecastData.daily[selectedDay].precipitation}%</p>
                  </div>
                  
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center text-blue-600 mb-1">
                      <FiSun className="mr-2" />
                      <span className="text-sm">UV Index</span>
                    </div>
                    <p className="text-xl font-semibold">6.5</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Hourly forecast (simplified) */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Hourly Forecast</h3>
              <div className="flex overflow-x-auto pb-4 scrollbar-hide">
                {Array.from({ length: 24 }).map((_, hour) => (
                  <div key={hour} className="flex-shrink-0 px-4 text-center">
                    <p className="text-sm text-gray-600">{hour}:00</p>
                    <div className="my-2">
                      {hour % 6 === 0 ? <WiRain size={24} /> : 
                       hour % 4 === 0 ? <WiCloudy size={24} /> : 
                       <WiDaySunny size={24} />}
                    </div>
                    <p className="font-medium">{28 + (hour % 3)}°</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default Forecast;