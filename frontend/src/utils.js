export const convertTemperature = (temp, isCelsius) => {
  return isCelsius ? temp : (temp * 9) / 5 + 32;
};

export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

export const getBackgroundClass = (weather) => {
  if (!weather) return "default-bg";
  const mainWeather = weather.weather[0].main.toLowerCase();
  if (mainWeather.includes("rain")) return "rain-bg";
  if (mainWeather.includes("snow")) return "snow-bg";
  if (mainWeather.includes("cloud")) return "cloud-bg";
  return "sunny-bg";
};