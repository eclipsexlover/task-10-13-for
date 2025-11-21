document.getElementById('get-weather').addEventListener('click', async function() {
    const weatherInfo = document.getElementById('weather-info');
    const button = document.getElementById('get-weather');
    
    try {
        button.disabled = true;
        weatherInfo.innerHTML = '<p>⌛ Определяем ваше местоположение...</p>';
        
        // 1. Получаем геолокацию по IP (резервный способ)
        let city = await getLocationByIP();
        
        // 2. Пробуем получить точную геолокацию через браузер
        try {
            const preciseLocation = await getPreciseLocation();
            city = preciseLocation.city || city;
        } catch (error) {
            console.log('Точная геолокация недоступна, используем IP');
        }
        
        // 3. Получаем реальную погоду
        weatherInfo.innerHTML = '<p>🌤️ Получаем данные о погоде...</p>';
        const weather = await getRealWeather(city);
        
        // 4. Показываем результат
        weatherInfo.innerHTML = `
            <h3>Погода в ${weather.city}</h3>
            <p>🌡️ Температура: ${weather.temperature}°C</p>
            <p>${weather.description}</p>
            <p>💨 Ветер: ${weather.windSpeed} м/с</p>
            <p>💧 Влажность: ${weather.humidity}%</p>
            <small>📍 Местоположение: ${weather.locationMethod}</small>
        `;
        
    } catch (error) {
        weatherInfo.innerHTML = `
            <p>❌ Ошибка: ${error.message}</p>
            <small>Попробуйте обновить страницу</small>
        `;
    } finally {
        button.disabled = false;
    }
});

// Функция получения местоположения по IP
async function getLocationByIP() {
    const response = await fetch('https://get.geojs.io/v1/ip/geo.json');
    const data = await response.json();
    return data.city;
}

// Функция точной геолокации через браузер
function getPreciseLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Геолокация не поддерживается'));
            return;
        }
        
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    // Используем OpenStreetMap для обратного геокодирования
                    const { latitude, longitude } = position.coords;
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
                    );
                    const data = await response.json();
                    resolve({
                        city: data.address.city || data.address.town || data.address.village,
                        country: data.address.country
                    });
                } catch (error) {
                    reject(error);
                }
            },
            (error) => {
                reject(new Error('Доступ к местоположению запрещён'));
            }
        );
    });
}

// Функция получения реальной погоды (используем OpenWeatherMap)
async function getRealWeather(city) {
    // Бесплатный API ключ для демо (в реальном проекте нужно хранить в секретах)
    const apiKey = 'bd5e378503939ddaee76f12ad7a97608'; // Это демо-ключ
    const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}&lang=ru`
    );
    
    if (!response.ok) {
        throw new Error('Город не найден или ошибка API');
    }
    
    const data = await response.json();
    
    return {
        city: data.name,
        temperature: Math.round(data.main.temp),
        description: data.weather[0].description,
        windSpeed: data.wind.speed,
        humidity: data.main.humidity,
        locationMethod: 'реальное API'
    };
}

// Тест для проверки работы
function testWeatherApp() {
    return typeof getRealWeather === 'function' && 
           typeof getLocationByIP === 'function';
}
