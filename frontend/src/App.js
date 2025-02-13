import React, { useState, useEffect } from "react";
import { fetchWeather, fetchForecast, fetchWeatherByCoords } from "./api";
import { convertTemperature, debounce, getBackgroundClass } from "./utils";
import "./App.css";

function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [error, setError] = useState("");
  const [isCelsius, setIsCelsius] = useState(true);
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);

  useEffect(() => {
    const savedFavorites = JSON.parse(localStorage.getItem("favorites")) || [];
    const savedSearches = JSON.parse(localStorage.getItem("recentSearches")) || [];
    setFavorites(savedFavorites);
    setRecentSearches(savedSearches);
  }, []);

  const handleSearch = debounce(async (city) => {
    if (!city) return;
    setLoading(true);
    try {
      const weatherData = await fetchWeather(city);
      setWeather(weatherData);
      setError("");
      const forecastData = await fetchForecast(city);
      setForecast(forecastData);
      addRecentSearch(city);
    } catch (err) {
      setError("City not found. Please try again.");
      setWeather(null);
      setForecast(null);
    } finally {
      setLoading(false);
    }
  }, 500);

  const getLocationWeather = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setLoading(true);
          try {
            const weatherData = await fetchWeatherByCoords(latitude, longitude);
            setWeather(weatherData);
            setError("");
            const forecastData = await fetchForecast(weatherData.name);
            setForecast(forecastData);
            addRecentSearch(weatherData.name);
          } catch (err) {
            setError("Unable to fetch weather for your location.");
            setWeather(null);
            setForecast(null);
          } finally {
            setLoading(false);
          }
        },
        (error) => {
          setError("Geolocation failed. Please enter a city manually.");
        }
      );
    } else {
      setError("Geolocation is not supported by your browser.");
    }
  };

  const addFavorite = (city) => {
    const updatedFavorites = [...favorites, city];
    setFavorites(updatedFavorites);
    localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
  };

  const addRecentSearch = (city) => {
    const updatedSearches = [city, ...recentSearches.slice(0, 4)];
    setRecentSearches(updatedSearches);
    localStorage.setItem("recentSearches", JSON.stringify(updatedSearches));
  };

  return (
    <div className={`App ${getBackgroundClass(weather)}`}>
      <h1>Weather App</h1>
      <input
        type="text"
        placeholder="Enter city name"
        value={city}
        onChange={(e) => {
          setCity(e.target.value);
          handleSearch(e.target.value);
        }}
      />
      <button onClick={() => handleSearch(city)}>Get Weather</button>
      <button onClick={getLocationWeather}>Get My Location Weather</button>

      {loading && <div className="loading">Loading...</div>}
      {error && <p className="error">{error}</p>}

      {weather && (
        <div className="weather-info">
          <h2>{weather.name}, {weather.sys.country}</h2>
          <p>Temperature: {convertTemperature(weather.main.temp, isCelsius).toFixed(1)}°{isCelsius ? "C" : "F"}</p>
          <p>Weather: {weather.weather[0].description}</p>
          <p>Humidity: {weather.main.humidity}%</p>
          <p>Wind Speed: {weather.wind.speed} m/s</p>
          <button onClick={() => setIsCelsius(!isCelsius)}>
            Switch to {isCelsius ? "Fahrenheit" : "Celsius"}
          </button>
          <button onClick={() => addFavorite(weather.name)}>Add to Favorites</button>
        </div>
      )}

      {forecast && (
        <div className="forecast">
          <h3>5-Day Forecast</h3>
          {forecast.list.filter((item, index) => index % 8 === 0).slice(0, 5).map((item, index) => (
            <div key={index} className="forecast-item">
              <p>Date: {item.dt_txt}</p>
              <p>Temperature: {convertTemperature(item.main.temp, isCelsius).toFixed(1)}°{isCelsius ? "C" : "F"}</p>
              <p>Weather: {item.weather[0].description}</p>
            </div>
          ))}
        </div>
      )}

      {weather && weather.alerts && (
        <div className="alerts">
          <h3>Weather Alerts</h3>
          {weather.alerts.map((alert, index) => (
            <div key={index} className="alert">
              <p><strong>{alert.event}</strong></p>
              <p>{alert.description}</p>
            </div>
          ))}
        </div>
      )}

      <div className="favorites">
        <h3>Favorites</h3>
        {favorites.map((fav, index) => (
          <button key={index} onClick={() => handleSearch(fav)}>{fav}</button>
        ))}
      </div>

      <div className="recent-searches">
        <h3>Recent Searches</h3>
        {recentSearches.map((search, index) => (
          <button key={index} onClick={() => handleSearch(search)}>{search}</button>
        ))}
      </div>
    </div>
  );
}

export default App;