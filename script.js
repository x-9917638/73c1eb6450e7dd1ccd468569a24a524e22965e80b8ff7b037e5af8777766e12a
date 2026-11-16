const background = document.getElementById("background");

const nasaUrl =
  "https://science.nasa.gov/wp-json/wp/v2/apod-basic/?api_key=qF2xtffJ6XiUgz0UcWsXzjLHo1UZQSK41EWMegeQ";
// Remember, be careful with what API keys you expose
// Expose private API keys at your own risk
//
// Ty for the API key niko :pf:
async function getBackground() {
  try {
    const response = await fetch(nasaUrl);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const list = await response.json();
    console.log(list);

    const result = list[0];

    if (result.media_type !== "image") {
      console.log("APOD returned a non-image media type.");
      return null;
    }

    return result.url;
  } catch (error) {
    console.log(error.message);
    return null;
  }
}

const weather = document.getElementById("weather");
const weatherUrl = new URL("https://api.open-meteo.com/v1/forecast");
async function getWeather() {
  let params = weatherUrl.searchParams;

  navigator.geolocation.getCurrentPosition(
    (geolocationPosition) => {
      let { latitude, longitude } = geolocationPosition.coords;
      params.set("latitude", latitude);
      params.set("longitude", longitude);
    },
    (e) => {
      console.error(e);
      setTimeout(getWeather, 1000 * 30); // Retry earlier than the 30mins
      return;
    },
  );

  params.set("current", "temperature_2m,apparent_temperature,precipitation");
  params.set("timezone", "auto");
  params.set("forecast_days", 1);

  try {
    const response = await fetch(weatherUrl);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const result = await response.json();
    console.debug(result);

    let temp = result.current.temperature_2m;
    let apparent = result.current.apparent_temperature;
    let precipitation = result.current.precipitation;

    let res = `Temperature: ${temp}\u00B0C<br/>Feels like: ${apparent}\u00B0C<br/>Rainfall: ${precipitation}mm`;
    weather.innerHTML = res;
  } catch (e) {
    console.error(e);
  }
}

const cat = document.getElementById("cat");
const catUrl = "https://cataas.com/cat?json=true";
const opts = {
  headers: {
    accept: "application/json",
  },
};
async function getCat() {
  try {
    const response = await fetch(catUrl, opts);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const result = await response.json();
    console.debug(result);

    let url = result.url;
    let img = document.createElement("img");
    img.src = url;
    img.draggable = true;
    img.addEventListener("mousedown", (event) => {
      event.preventDefault();
      let l = img.offsetLeft;
      let t = img.offsetTop;

      let startX = event.pageX;
      let startY = event.pageY;

      const drag = (event) => {
        event.preventDefault();

        img.style.left = l + (event.pageX - startX) + "px";
        img.style.top = t + (event.pageY - startY) + "px";
      };

      const mouseup = () => {
        document.removeEventListener("mousemove", drag);
        document.removeEventListener("mouseup", mouseup);
      };

      document.addEventListener("mousemove", drag);
      document.addEventListener("mouseup", mouseup);
    });
    let previous = cat.firstChild;
    if (previous) {
      img.style.left = previous.style.left;
      img.style.top = previous.style.top;
    }
    cat.replaceChildren(img);
  } catch (e) {
    console.error(e);
  }
}

const time = document.getElementById("time");
function clock() {
  const now = new Date();
  let h = now.getHours();
  let m = now.getMinutes();
  let s = now.getSeconds();
  m = checkTime(m);
  s = checkTime(s);

  time.innerHTML = h + ":" + m + ":" + s;
}

// Exists bcause javascript is incompetent and doesn't have
// printf formatting.
function checkTime(digit) {
  if (digit < 10) digit = "0" + digit; // Top 10 cursed javascript ops :sob:
  return digit;
}

window.onload = function () {
  setInterval(clock, 100);
  getWeather();
  setInterval(getWeather, 1000 * 60 * 10); // Update weather every 10 mins
  getCat();
  setInterval(getCat, 1000 * 60); // 1 min

  getBackground().then(function (imageUrl) {
    if (!imageUrl) return;

    console.log(imageUrl);

    if (background) {
      background.style["background-image"] = `url('${imageUrl}')`;
    }
  });
};
