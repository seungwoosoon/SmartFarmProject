// WeatherAPI 호출
const API_KEY = "a1ced7c40c2c4260944112213251008"; // WeatherAPI 키
const BASE_URL = "https://api.weatherapi.com/v1/current.json";

export const getWeatherData = async (lat, lon) => {
  try {
    const url = `${BASE_URL}?key=${API_KEY}&q=${lat},${lon}&aqi=no&lang=en`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.current) {
      return {
        temp: Math.round(data.current.temp_c),
        humidity: data.current.humidity,
        condition: data.current.condition.text,
        wind: data.current.wind_kph
          ? (data.current.wind_kph / 3.6).toFixed(1)
          : undefined, // m/s로 변환
        feelsLike: Math.round(data.current.feelslike_c),
      };
    }
    throw new Error("날씨 데이터를 가져오는데 실패했습니다.");
  } catch (error) {
    console.error("날씨 데이터 조회 실패:", error);
    throw error;
  }
};

// OpenWeatherMap API는 위도/경도를 직접 사용
export const convertToGridCoord = (lat, lon) => {
  return { lat, lon };
};
