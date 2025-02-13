import axios from "axios";

const API_KEY = process.env.REACT_APP_API_KEY;

export const fetchWeather = async (city) => {
  const response = await axios.get(`http://localhost:5000/api/weather?city=${city}`);
  return response.data;
};

export const fetchForecast = async (city) => {
  const response = await axios.get(`http://localhost:5000/api/forecast?city=${city}`);
  return response.data;
};

export const fetchWeatherByCoords = async (lat, lon) => {
  const response = await axios.get(`http://localhost:5000/api/weather?lat=${lat}&lon=${lon}`);
  return response.data;
};