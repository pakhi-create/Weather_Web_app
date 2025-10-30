
    const API_KEY = "f519a1da53a57cf921c36926a4cb0c5a";
    const API_BASE_URL = "https://api.openweathermap.org/data/2.5";

    const appBody = document.getElementById("app-body");
    const cityInput = document.getElementById("city-input");
    const searchButton = document.getElementById("search-button");
    const weatherDisplay = document.getElementById("weather-display");
    const messageBox = document.getElementById("message-box");
    const locationEl = document.getElementById("location");
    const dateTimeEl = document.getElementById("date-time");
    const temperatureEl = document.getElementById("temperature");
    const humidityEl = document.getElementById("humidity-value");
    const windSpeedEl = document.getElementById("wind-speed-value");
    const minTempEl = document.getElementById("min-temp-value");
    const maxTempEl = document.getElementById("max-temp-value");
    const conditionEl = document.getElementById("weather-condition");
    const prevDayButton = document.getElementById("prev-day");
    const nextDayButton = document.getElementById("next-day");
    const forecastDayNameEl = document.getElementById("forecast-day-name");
    const forecastTempEl = document.getElementById("forecast-temp");
    const forecastConditionEl = document.getElementById("forecast-condition");

    let forecastData = [];
    let forecastIndex = 0;

    const setDynamicBackground = (condition) => {
      condition = condition.toLowerCase();
      if(condition.includes("rain")) appBody.style.background = "linear-gradient(135deg, #1e3a8a, #2563eb)";
      else if(condition.includes("cloud")) appBody.style.background = "linear-gradient(135deg, #64748b, #94a3b8)";
      else if(condition.includes("clear")) appBody.style.background = "linear-gradient(135deg, #60a5fa, #fcd34d)";
      else if(condition.includes("snow")) appBody.style.background = "linear-gradient(135deg, #e0f2fe, #bae6fd)";
      else if(condition.includes("storm")) appBody.style.background = "linear-gradient(135deg, #1e293b, #334155)";
      else appBody.style.background = "linear-gradient(135deg, #4f46e5, #06b6d4)";
    };

    const showMessage = (text, color = "yellow") => {
      messageBox.textContent = text;
      messageBox.classList.remove("hidden");
      messageBox.style.backgroundColor = color === "red" ? "rgba(239,68,68,0.2)" : "rgba(234,179,8,0.2)";
      setTimeout(()=> messageBox.classList.add("hidden"), 3000);
    };

    const formatDateTime = ts => new Date(ts*1000).toLocaleString("en-US",{ weekday:"long", hour:"2-digit", minute:"2-digit" });

    const groupForecastByDay = (list) => {
      const days = {};
      list.forEach(item=>{
        const date = new Date(item.dt*1000).toISOString().split("T")[0];
        if(!days[date]) days[date]={temps:[], conditions:[], date:new Date(item.dt*1000)};
        days[date].temps.push(item.main.temp);
        days[date].conditions.push(item.weather[0].description);
      });
      return Object.keys(days).map(d=>{
        const x = days[d];
        const avg = x.temps.reduce((a,b)=>a+b,0)/x.temps.length;
        const cond = x.conditions.sort((a,b)=>x.conditions.filter(v=>v===a).length - x.conditions.filter(v=>v===b).length).pop();
        return {date:x.date, temp:avg, condition:cond};
      });
    };

    const updateForecast = () => {
      const d = forecastData[forecastIndex];
      forecastDayNameEl.textContent = forecastIndex===0?"Today":forecastIndex===1?"Tomorrow":d.date.toLocaleDateString("en-US",{weekday:"long"});
      forecastTempEl.textContent = `${Math.round(d.temp)}°C`;
      forecastConditionEl.textContent = d.condition;
      prevDayButton.disabled = forecastIndex===0;
      nextDayButton.disabled = forecastIndex===forecastData.length-1;
    };

    const displayWeather = (data) => {
      locationEl.textContent = `${data.name}, ${data.sys.country}`;
      dateTimeEl.textContent = formatDateTime(data.dt);
      temperatureEl.textContent = `${Math.round(data.main.temp)}°C`;
      humidityEl.textContent = `${data.main.humidity}%`;
      windSpeedEl.textContent = `${data.wind.speed} m/s`;
      minTempEl.textContent = `${Math.round(data.main.temp_min)}°C`;
      maxTempEl.textContent = `${Math.round(data.main.temp_max)}°C`;
      conditionEl.textContent = data.weather[0].description;
      setDynamicBackground(data.weather[0].description);
    };

    const fetchWeather = async (city)=>{
      if(!city) return showMessage("Enter a city name","yellow");
      try{
        const [curRes, foreRes] = await Promise.all([
          fetch(`${API_BASE_URL}/weather?q=${city}&appid=${API_KEY}&units=metric`),
          fetch(`${API_BASE_URL}/forecast?q=${city}&appid=${API_KEY}&units=metric`)
        ]);
        const cur = await curRes.json();
        const fore = await foreRes.json();
        if(cur.cod!==200) throw new Error("City not found");
        displayWeather(cur);
        forecastData = groupForecastByDay(fore.list);
        forecastIndex = 0;
        updateForecast();
        weatherDisplay.classList.remove("hidden");
      }catch{
        showMessage("Error fetching weather data","red");
      }
    };

    searchButton.onclick=()=>fetchWeather(cityInput.value.trim());
    cityInput.addEventListener("keypress",(e)=>e.key==="Enter"&&fetchWeather(cityInput.value.trim()));
    prevDayButton.onclick=()=>{if(forecastIndex>0) forecastIndex--; updateForecast();};
    nextDayButton.onclick=()=>{if(forecastIndex<forecastData.length-1) forecastIndex++; updateForecast();};
    window.onload=()=>fetchWeather("Dhaka");
  