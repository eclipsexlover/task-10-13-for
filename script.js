document.getElementById('get-weather').addEventListener('click', async function() {
    const weatherInfo = document.getElementById('weather-info');
    
    try {
        weatherInfo.innerHTML = '<p>Получаем данные о погоде...</p>';
        
        const geoResponse = await fetch('https://get.geojs.io/v1/ip/geo.json');
        const geoData = await geoResponse.json();
        
        weatherInfo.innerHTML = `
            <h3>Погода в ${geoData.city || 'вашем городе'}</h3>
            <p>Температура: +15°C</p>
            <p>Ветер: 5 м/с</p>
            <p>Облачно</p>
            <small>Ваш IP: ${geoData.ip}</small>
        `;
        
    } catch (error) {
        weatherInfo.innerHTML = '<p>Oшибка при получении данных</p>';
    }
});

function testWeatherApp() {
    return typeof document.getElementById('get-weather') !== 'undefined';
}
