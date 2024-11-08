import { useEffect, useMemo, useState } from "react";
import {
  RiCelsiusFill,
  RiFahrenheitFill,
  RiHeartAdd2Line,
} from "react-icons/ri";
import { TbMapSearch, TbMoon, TbSearch, TbSun } from "react-icons/tb";
import "./App.css";

import DetailsCard from "./Components/DetailsCard";
import SummaryCard from "./Components/SummaryCard";
import Astronaut from "./asset/not-found.svg";
import SearchPlace from "./asset/search.svg";
import BackgroundColor from "./Components/BackgroundColor";
import Animation from "./Components/Animation";

import axios from "axios";

function App() {
  const API_KEY = "6b38d28cdcec1b2ec01b00d2c7be0806";

  const [noData, setNoData] = useState();
  const [searchTerm, setSearchTerm] = useState("");
  const [weatherData, setWeatherData] = useState([]);
  const [city, setCity] = useState();
  const [weatherIcon, setWeatherIcon] = useState(
    `https://openweathermap.org/img/wn/10n@2x.png`
  );
  const [currentLanguage, setLanguage] = useState(
    () => localStorage.getItem("language") || "en"
  );
  const [loading, setLoading] = useState(false);
  const [backgroundSoundEnabled, setBackgroundSoundEnabled] = useState(true);
  const [isFahrenheitMode, setIsFahrenheitMode] = useState(false);
  const degreeSymbol = useMemo(
    () => (isFahrenheitMode ? "\u00b0F" : "\u00b0C"),
    [isFahrenheitMode]
  );
  const [active, setActive] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [favorites, setFavorites] = useState([]); // State for favorites

  useEffect(() => {
    if (isDark) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, [isDark]);

  const toggleDark = () => setIsDark((prev) => !prev);

  const toggleFahrenheit = () => setIsFahrenheitMode(!isFahrenheitMode);

  const submitHandler = (e) => {
    e.preventDefault();
    getWeather(searchTerm);
  };

  const getWeather = async (location) => {
    setLoading(true);
    setWeatherData([]);
    let how_to_search =
      typeof location === "string"
        ? `q=${location}`
        : `lat=${location[0]}&lon=${location[1]}`;

    const url = "https://api.openweathermap.org/data/2.5/forecast?";

    try {
      const res = await fetch(
        `${url}${how_to_search}&appid=${API_KEY}&units=metric&cnt=5&exclude=hourly,minutely`
      );
      const data = await res.json();

      if (data.cod !== "200") {
        setNoData("Location Not Found");
        setCity("Unknown Location");
        return;
      }

      setWeatherData(data);
      setCity(`${data.city.name}, ${data.city.country}`);
      setWeatherIcon(
        `https://openweathermap.org/img/wn/${data.list[0].weather[0]["icon"]}@4x.png`
      );
    } catch (error) {
      console.error("Error fetching weather data:", error);
      setNoData("Error fetching weather data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const addFavorite = () => {
    if (!favorites.includes(city)) {
      setFavorites([...favorites, city]);
    }
  };

  const removeFavorite = (cityToRemove) => {
    setFavorites(favorites.filter((fav) => fav !== cityToRemove));
  };

  const searchCountries = (input) => {
    setSearchTerm(input);
  };

  const loadWeatherForFavorite = (cityName) => {
    getWeather(cityName);
  };
  const [query, setQuery] = useState(""); // User input for country search
  const [suggestions, setSuggestions] = useState([]); // Country suggestions
  const [selectedCountry, setSelectedCountry] = useState(""); // Selected country name

  // Function to fetch countries based on the user's input
  const fetchCountries = async (input) => {
    if (!input) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await axios.get("https://restcountries.com/v3.1/all");
      const filteredCountries = response.data
        .map((country) => country.name.common) // Get country name
        .filter((name) => name.toLowerCase().includes(input.toLowerCase())); // Filter based on input

      setSuggestions(filteredCountries);
    } catch (error) {
      console.error("Error fetching country data", error);
    }
  };

  // Handle input change and fetch country suggestions
  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    fetchCountries(value);
  };

  // Handle country selection from suggestions
  const handleCountrySelect = (country) => {
    setQuery(country);
    setSelectedCountry(country);
    setSuggestions([]); // Clear suggestions after selection
  };

  // Render country suggestions
  const renderSuggestions = () => {
    if (!suggestions.length) return null;
    return (
      <ul className="suggestions-list">
        {suggestions.map((country, index) => (
          <li
            key={index}
            onClick={() => handleCountrySelect(country)}
            className="suggestion-item"
          >
            {country}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="container">
      <div
        className="blur"
        style={{
          background: weatherData ? BackgroundColor(weatherData) : "#a6ddf0",
          top: "-10%",
          right: "0",
        }}
      ></div>
      <div
        className="blur"
        style={{
          background: weatherData ? BackgroundColor(weatherData) : "#a6ddf0",
          top: "36%",
          left: "-6rem",
        }}
      ></div>

      <div className="content">
        <div className="form-container">
          <div className="name">
            <Animation />
            <div className="toggle-container">
              <input
                type="checkbox"
                className="checkbox"
                id="checkbox"
                checked={isDark}
                onChange={toggleDark}
              />
              <label htmlFor="checkbox" className="label">
                <TbMoon style={{ color: "#a6ddf0" }} />
                <TbSun style={{ color: "#f5c32c" }} />
                <div className="ball" />
              </label>
            </div>
            <div className="city">
              <TbMapSearch />
            </div>
          </div>

          <div className="search">
            <form className="search-bar" noValidate onSubmit={submitHandler}>
              <input
                placeholder={active ? "" : "Explore cities weather"}
                onChange={(e) => searchCountries(e.target.value)}
                required
                className="input_search"
              />

              <button className="s-icon">
                <TbSearch />
              </button>
            </form>
          </div>
          <div className="favorites">
            <h2
              style={{
                marginRight: currentLanguage === "es" || "fr" ? "10px" : "0px",
                color: isDark ? "#fff" : "#333",
              }}
            >
              Favourite
            </h2>
            <table className="favorites-table">
              <tbody>
                {favorites.map((favCity, index) => (
                  <tr key={index}>
                    <td
                      onClick={() => loadWeatherForFavorite(favCity)}
                      style={{ color: isDark ? "#fff" : "#333" }}
                    >
                      {favCity}
                    </td>
                    <td id="btn">
                      <button onClick={() => removeFavorite(favCity)}>
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="info-container">
          <div className="info-inner-container">
            <div className="toggle-container">
              <input
                type="checkbox"
                className="checkbox"
                id="fahrenheit-checkbox"
                onChange={toggleFahrenheit}
              />
              <label htmlFor="fahrenheit-checkbox" className="label">
                <RiFahrenheitFill />
                <RiCelsiusFill />
                <div className="ball" />
              </label>
            </div>
            <div className="city-title">
              <h2>{city}</h2>
            </div>
            <button
              onClick={addFavorite}
              title="Add to favourite"
              className="favorite-btn"
            >
              <RiHeartAdd2Line />
            </button>
          </div>

          {loading ? (
            <div className="loader"></div>
          ) : (
            <span>
              {weatherData.length === 0 ? (
                <div className="nodata">
                  {noData === "Location Not Found" ? (
                    <img src={Astronaut} alt="an astronaut lost in space" />
                  ) : (
                    <img src={SearchPlace} alt="search icon" />
                  )}
                </div>
              ) : (
                <>
                  <DetailsCard
                    weather_icon={weatherIcon}
                    data={weatherData}
                    soundEnabled={backgroundSoundEnabled}
                    isFahrenheitMode={isFahrenheitMode}
                    degreeSymbol={degreeSymbol}
                  />

                  <h1 className="title centerTextOnMobile"></h1>
                  <ul className="summary">
                    {weatherData.list.map((days, index) => (
                      <SummaryCard
                        key={index}
                        day={days}
                        isFahrenheitMode={isFahrenheitMode}
                        degreeSymbol={degreeSymbol}
                      />
                    ))}
                  </ul>
                </>
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
