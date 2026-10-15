const API_KEY = "5f085a443220285f4c33c9689f123877";

let currentCity = "";
let timer;
async function getWeather(city) {

    let url =
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;

    let response = await fetch(url);

    if (!response.ok) {
        throw new Error("City not found");
    }

    let  data = await response.json();

    return {
        city: data.name,
        temp: Math.round(data.main.temp),
        feelsLike: Math.round(data.main.feels_like),
        description: data.weather[0].description,
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,

    };
}
async function getForecast(city) {

    let url =
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`;

    let response = await fetch(url);

    if (!response.ok) {
        throw new Error("Forecast not found");
    }

    let data = await response.json();

    return data;
}
function addFavorite(city) {

    let favorites =
        JSON.parse(localStorage.getItem("favorites")) || [];

    if (!favorites.includes(city)) {

        favorites.push(city);

        localStorage.setItem(
            "favorites",
            JSON.stringify(favorites)
        );
    }

    loadFavorites();
}
function removeFavorite(city) {

    let favorites =
        JSON.parse(localStorage.getItem("favorites")) || [];

    favorites = favorites.filter(function(item) {
        return item !== city;
    });

    localStorage.setItem(
        "favorites",
        JSON.stringify(favorites)
    );

    loadFavorites();

    if (currentCity === city) {

        document.getElementById("favoriteBtn").innerText =
            "⭐ Add to Favorites";
    }
}
function loadFavorites() {

    let list =
        document.getElementById("favoritesList");

    list.innerHTML = "";

    let favorites =
        JSON.parse(localStorage.getItem("favorites")) || [];

    favorites.forEach(function(city) {

        let div = document.createElement("div");

        div.className = "favorite-city";

        div.innerHTML = `
            <span>${city}</span>
            <button>❌</button>
        `;

        div.querySelector("span").onclick =
            function() {
                searchWeather(city);
            };

        div.querySelector("button").onclick =
            function() {
                removeFavorite(city);
            };

        list.appendChild(div);
    });
}
async function searchWeather(city) {

    if (city === "") {

        document.getElementById("errorMsg").innerText =
            "Please enter a city name";

        return;
    }

    try {

        document.getElementById("loading").style.display =
            "block";

        document.getElementById("errorMsg").innerText = "";
        let weather = await getWeather(city);
        currentCity = weather.city;
        document.getElementById("weatherCard").style.display =
            "block";

        document.getElementById("cityName").innerText =
            weather.city;

        document.getElementById("temperature").innerText =
            weather.temp + "°C";

        document.getElementById("description").innerText =
            weather.description;

        document.getElementById("humidity").innerText =
            weather.humidity;

        document.getElementById("wind").innerText =
            weather.windSpeed;
        let favorites =
            JSON.parse(localStorage.getItem("favorites")) || [];

        if (favorites.includes(weather.city)) {

            document.getElementById("favoriteBtn").innerText =
                "⭐ Remove Favorite";

        } else {

            document.getElementById("favoriteBtn").innerText =
                "⭐ Add to Favorites";
        }
        let forecastData =
            await getForecast(city);
        showForecast(forecastData);
    }
    catch (error) {

        document.getElementById("weatherCard").style.display =
            "none";

        document.getElementById("forecast").innerHTML = "";

        document.getElementById("errorMsg").innerText =
            "City not found. Please try again.";
    }
    finally {

        document.getElementById("loading").style.display =
            "none";
    }
}
function showForecast(data) {

    let forecast = document.getElementById("forecast");

    forecast.innerHTML = "";

    let days = [];
    let count = 0;

    for (let i = 0; i < data.list.length; i++) {

        let item = data.list[i];

        let date = item.dt_txt.substring(0, 10);

        if (!days.includes(date)) {

            days.push(date);

            let newDate = new Date(item.dt_txt);

            let dateText = newDate.toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric"
            });

            let card = document.createElement("div");

            card.className = "forecast-card";

            card.innerHTML = `
                <h3>${dateText}</h3>

                <h3>${Math.round(item.main.temp)}°C</h3>

                <p>${item.weather[0].description}</p>
            `;

            forecast.appendChild(card);

            count++;

            if (count === 5) {
                break;
            }
        }
    }
}
function debounceSearch() {

    clearTimeout(timer);

    timer = setTimeout(function() {

        let city =
            document.getElementById("cityInput").value.trim();

        if (city !== "") {

            searchWeather(city);
        }

    }, 500);
}
document.addEventListener("DOMContentLoaded", function() {
    loadFavorites();

    document.getElementById("weatherCard").style.display =
        "none";
    document.getElementById("searchBtn").onclick =
        function() {

            let city =
                document.getElementById("cityInput").value.trim();

            searchWeather(city);
        };
    document.getElementById("cityInput").oninput =
        function() {
            debounceSearch();
        };
    document.getElementById("favoriteBtn").onclick =
        function() {

            if (currentCity === "") {
                return;
            }

            let favorites =
                JSON.parse(localStorage.getItem("favorites")) || [];


            if (favorites.includes(currentCity)) {

                removeFavorite(currentCity);

            } else {

                addFavorite(currentCity);

                document.getElementById("favoriteBtn").innerText =
                    "⭐ Remove Favorite";
            }
        };
    document.getElementById("themeBtn").onclick =
        function() {

            document.body.classList.toggle("dark");

            if (
                document.body.classList.contains("dark")
            ) {

                document.getElementById("themeBtn").innerText =
                    "☀️";

            } else {

                document.getElementById("themeBtn").innerText =
                    "🌙";
            }
        };

});