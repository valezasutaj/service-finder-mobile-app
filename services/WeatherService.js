
const API_KEY = "3f21d6c71fe38e6e96aebfffcc07319a"; 

export const getWeatherByCity = async (city) => {
  try {
    const response = await fetch(
     `https://api.openweathermap.org/data/2.5/weather?q=${city},XK&appid=${API_KEY}&units=metric`
    );
    const data = await response.json();

    if (data.cod !== 200) {
      throw new Error("City not found");
    }

    return {
      temp: Math.round(data.main.temp),
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      isDay: data.weather[0].icon.includes("d"),
    };
  } catch (error) {
    console.error("Error fetching weather:", error);
    return null;
  }
};
