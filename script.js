document.getElementById('get-weather').addEventListener('click', async function() {
    const weatherInfo = document.getElementById('weather-info');
    const button = document.getElementById('get-weather');
    
    try {
        button.disabled = true;
        weatherInfo.innerHTML = '<p>Определяем ваше местоположение...</p>';
        
        let city = await getLocationByIP();
        
        try {
            const preciseLocation = await getPreciseLocation();
            city = preciseLocation.city || city;
        } catch (error) {
            console.log('Точная геолокация недоступна, используем IP');
        }
        
        weatherInfo.innerHTML = '<p>Получаем данные о погоде...</p>';
        const weather = await getRealWeather(city);
        

        weatherInfo.innerHTML = `
            <h3>Погода в ${weather.city}</h3>
            <p>емпература: ${weather.temperature}°C</p>
            <p>${weather.description}</p>
            <p>Ветер: ${weather.windSpeed} м/с</p>
            <p>Влажность: ${weather.humidity}%</p>
            <small>Местоположение: ${weather.locationMethod}</small>
        `;
        
    } catch (error) {
        weatherInfo.innerHTML = `
            <p>Ошибка: ${error.message}</p>
            <small>Попробуйте обновить страницу</small>
        `;
    } finally {
        button.disabled = false;
    }
});
async function getLocationByIP() {
    const response = await fetch('https://get.geojs.io/v1/ip/geo.json');
    const data = await response.json();
    return data.city;
}

function getPreciseLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Геолокация не поддерживается'));
            return;
        }
        
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
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

async function getRealWeather(city) {
    const apiKey = 'bd5e378503939ddaee76f12ad7a97608'; 
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

function testWeatherApp() {
    return typeof getRealWeather === 'function' && 
           typeof getLocationByIP === 'function';
}
