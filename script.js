async function getWeather() {

    const cityInput = document.getElementById("cityInput");
    const weatherResult = document.getElementById("weatherResult");

    const city = cityInput.value.trim();

    if (city === "") {
        weatherResult.innerHTML = `
            <h2>Please enter a city</h2>
            <p class="error">Enter a city name first.</p>
        `;
        return;
    }

    weatherResult.innerHTML = `
        <h2>Loading...</h2>
        <p>Getting current weather data...</p>
    `;

    try {

        // Step 1: Find city coordinates
        const locationResponse = await fetch(
            "https://geocoding-api.open-meteo.com/v1/search?name=" +
            encodeURIComponent(city) +
            "&count=1&language=en&format=json"
        );

        if (!locationResponse.ok) {
            throw new Error("Unable to find city");
        }

        const locationData = await locationResponse.json();

        if (!locationData.results || locationData.results.length === 0) {

            weatherResult.innerHTML = `
                <h2>City Not Found</h2>
                <p class="error">Please enter a valid city name.</p>
            `;

            return;
        }

        const location = locationData.results[0];

        const latitude = location.latitude;
        const longitude = location.longitude;

        // Step 2: Get current weather
        const weatherResponse = await fetch(
            "https://api.open-meteo.com/v1/forecast" +
            "?latitude=" + latitude +
            "&longitude=" + longitude +
            "&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m" +
            "&timezone=auto"
        );

        if (!weatherResponse.ok) {
            throw new Error("Unable to get weather");
        }

        const weatherData = await weatherResponse.json();

        const current = weatherData.current;

        // Step 3: Convert weather code to description
        const description = getWeatherDescription(
            current.weather_code
        );

        // Step 4: Display weather
        weatherResult.innerHTML = `

            <h2>
                ${location.name}, ${location.country}
            </h2>

            <div class="temperature">
                ${current.temperature_2m}°C
            </div>

            <p>
                ${description}
            </p>

            <p>
                🌡️ Feels Like:
                ${current.apparent_temperature}°C
            </p>

            <p>
                💧 Humidity:
                ${current.relative_humidity_2m}%
            </p>

            <p>
                🌧️ Precipitation:
                ${current.precipitation} mm
            </p>

            <p>
                💨 Wind:
                ${current.wind_speed_10m} km/h
            </p>

            <p>
                🕐 Updated:
                ${current.time.replace("T", " ")}
            </p>

        `;

    } catch (error) {

        weatherResult.innerHTML = `
            <h2>Error</h2>
            <p class="error">
                Unable to get weather data.
            </p>
        `;

        console.error(error);
    }
}


// Weather condition
function getWeatherDescription(code) {

    if (code === 0) {
        return "☀️ Clear Sky";
    }

    if (code === 1) {
        return "🌤️ Mainly Clear";
    }

    if (code === 2) {
        return "⛅ Partly Cloudy";
    }

    if (code === 3) {
        return "☁️ Overcast";
    }

    if (code >= 45 && code <= 48) {
        return "🌫️ Fog";
    }

    if (code >= 51 && code <= 57) {
        return "🌦️ Drizzle";
    }

    if (code >= 61 && code <= 67) {
        return "🌧️ Rain";
    }

    if (code >= 71 && code <= 77) {
        return "❄️ Snow";
    }

    if (code >= 80 && code <= 82) {
        return "🌦️ Rain Showers";
    }

    if (code >= 85 && code <= 86) {
        return "🌨️ Snow Showers";
    }

    if (code >= 95 && code <= 99) {
        return "⛈️ Thunderstorm";
    }

    return "🌤️ Weather";
}