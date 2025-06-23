import express from 'express';
import axios from 'axios';
import bodyParser from 'body-parser';

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

const port = 3000;
const apiKey = "4b9861f7a2bc42470dd1c5f29804d835";

app.get("/", async (req, res) => {
  const city = req.query.city;

  if (city) {
    try {
      const georest = await axios.get(
        `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`
      );

      if (georest.data.length) {
        const { lat, lon } = georest.data[0];

        const forecast = await axios.get(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`
        );

        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        const year = tomorrow.getFullYear();
        const month = String(tomorrow.getMonth() + 1).padStart(2, "0");
        const day = String(tomorrow.getDate()).padStart(2, "0");
        const DateStr = `${year}-${month}-${day}`;

        const tomorrowForecast = forecast.data.list.filter(entry =>
          entry.dt_txt.startsWith(DateStr)
        );

        let Rain = false;
        for (let entry of tomorrowForecast) {
          const weather = entry.weather[0].main.toLowerCase();
          if (weather.includes("rain")) {
            Rain = true;
            break;
          }
        }

        if (Rain) {
          return res.render("index.ejs", {message:`Yes, it will rain in ${city} tomorrow. ☔`});
        } else {
          return res.render("index.ejs", {message:`No, it will not rain in ${city} tomorrow. 🌞`});
        }
      } else {
        return res.render("index.ejs", { message: "City not found. Try again." });
      }

    } catch (error) {
      console.log(error.response?.data);
      return res.render("index.ejs", {message: "Something went wrong. Try again later."});
    }

  } else {
    return res.render("index.ejs", { message: "" });
  }
});

app.listen(port, () => {
  console.log("Server is up and running!");
});
