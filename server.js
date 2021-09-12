const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
const axios = require('axios');
const { response } = require("express");

const app = express();

// OpenWeather DATA
const apiKeyOpenWeather = "a155afeb5257381947fea91631337691";
var city = "Mendoza, AR"

// Dolar DATA
var dolar_oficial_buy = 0;
var dolar_oficial_sell = 0;
var dolar_blue_buy = 0;
var dolar_blue_sell = 0;
var euro_oficial_buy = 0;
var euro_oficial_sell = 0;

// COVID DATA
var covid_confirmed_daily = 0;
var covid_death_daily = 0;
var covid_active = 0;

var covid_confirmed_total = 0;
var covid_recovered_total = 0;
var covid_death_total = 0;

// var today = new Date();
// var dd = String(today.getDate()).padStart(2, '0');
// var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
// var yyyy = today.getFullYear();
// today = yyyy + '/' + mm + '/' + dd;

// NEWS DATA
const apiKeyNews = "bfc611e9f0aa4ee7a389121fd7704076"
var news_data = [];


app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");


app.get("/", (req, res) =>  {

    axios.all([
      axios.get('https://api.bluelytics.com.ar/v2/latest'),
      axios.get(
        `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&lang=es&appid=${apiKeyOpenWeather}`),
      axios.get(
        'https://covid-193.p.rapidapi.com/statistics',
        {
          params: {country: 'Argentina'},
          headers: {
            'x-rapidapi-host': 'covid-193.p.rapidapi.com',
            'x-rapidapi-key': '01bd746841mshdd8087279d8e13ep16808cjsnc6581bea947b'
          }
      }),
      axios.get(
        `https://newsapi.org/v2/top-headlines?&apiKey=${apiKeyNews}`,
        {
          params: {country: 'AR', pageSize: '5', page: '1'}
        }),
    ])
      .then(axios.spread((dolar,weather,covid,news) => {

        // DOLAR API
        dolar_oficial_buy = dolar.data.oficial.value_buy;
        dolar_oficial_sell = dolar.data.oficial.value_sell;
        dolar_blue_buy = dolar.data.blue.value_buy;
        dolar_blue_sell = dolar.data.blue.value_sell;
        euro_oficial_buy = dolar.data.oficial_euro.value_buy;
        euro_oficial_sell = dolar.data.oficial_euro.value_sell;

        // OPENWEATHER DATA
        let place = `${weather.data.name}, ${weather.data.sys.country}`;
        let weatherTemp = `${weather.data.main.temp}`,
          weatherIcon = `http://openweathermap.org/img/wn/${weather.data.weather[0].icon}@2x.png`,
          weatherDescription = `${weather.data.weather[0].description}`,
          humidity = `${weather.data.main.humidity}`,
          feels_like = `${weather.data.main.feels_like}`
          clouds = `${weather.data.clouds.all}`,
          visibility = `${weather.data.visibility}`,
          main = `${weather.data.weather[0].main}`;

        // COVID DATA
        covid_confirmed_daily = covid.data.response[0].cases.new;
        covid_active = covid.data.response[0].cases.active;
        covid_death_daily = covid.data.response[0].deaths.new;

        covid_confirmed_total = covid.data.response[0].cases.total;
        covid_recovered_total = covid.data.response[0].cases.recovered;        
        covid_death_total = covid.data.response[0].deaths.total;


        // NEWS API

        for (const post in news.data.articles){
          let report = {
            'source': news.data.articles[post].source.name,
            'title': news.data.articles[post].title,
            'description': news.data.articles[post].description,
            'url': news.data.articles[post].url,
            'urlToImage': news.data.articles[post].urlToImage,
          }

          news_data.push(report);
        }
          
        res.render("index", {
          // DOLAR
          dolar_oficial_buy : dolar_oficial_buy,
          dolar_oficial_sell: dolar_oficial_sell,
          dolar_blue_buy: dolar_blue_buy,
          dolar_blue_sell: dolar_blue_sell,
          euro_oficial_buy: euro_oficial_buy,
          euro_oficial_sell: euro_oficial_sell,

          // WEATHER
          weather: weather,
          place: place,
          temp: weatherTemp,
          icon: weatherIcon,
          description: weatherDescription,
          humidity: humidity,
          feelslike: feels_like,
          clouds: clouds,
          visibility: visibility,
          main: main,
          error: null,

          // COVID
          covid_confirmed_daily: covid_confirmed_daily,
          covid_death_daily: covid_death_daily,
          covid_active: covid_active,

          covid_confirmed_total: covid_confirmed_total,
          covid_recovered_total: covid_recovered_total,
          covid_death_total: covid_death_total,

          // NEWS
          news_data: news_data,
        });
        
      }))
      .catch(error => {
        console.log(error);
      })
      
  });

app.post('/', function(req, res) {

    city = req.body.city;

    axios.all([
      axios.get(`http://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&lang=es&appid=${apiKeyOpenWeather}`)
    ])
      .then(axios.spread((weather) => {

        // OPENWEATHER DATA
        let place = `${weather.data.name}, ${weather.data.sys.country}`;
        let weatherTemp = `${weather.data.main.temp}`,
          weatherIcon = `http://openweathermap.org/img/wn/${weather.data.weather[0].icon}@2x.png`,
          weatherDescription = `${weather.data.weather[0].description}`,
          humidity = `${weather.data.main.humidity}`,
          feels_like = `${weather.data.main.feels_like}`
          clouds = `${weather.data.clouds.all}`,
          visibility = `${weather.data.visibility}`,
          main = `${weather.data.weather[0].main}`;


        // NEWS API

        res.render("index", {
          dolar_oficial_buy : dolar_oficial_buy,
          dolar_oficial_sell: dolar_oficial_sell,
          dolar_blue_buy: dolar_blue_buy,
          dolar_blue_sell: dolar_blue_sell,
          euro_oficial_buy: euro_oficial_buy,
          euro_oficial_sell: euro_oficial_sell,
          
          weather: weather,
          place: place,
          temp: weatherTemp,
          icon: weatherIcon,
          description: weatherDescription,
          humidity: humidity,
          feelslike: feels_like,
          clouds: clouds,
          visibility: visibility,
          main: main,
          error: null,

          // COVID
          covid_confirmed_daily: covid_confirmed_daily,
          covid_death_daily: covid_death_daily,
          covid_active: covid_active,

          covid_confirmed_total: covid_confirmed_total,
          covid_recovered_total: covid_recovered_total,
          covid_death_total: covid_death_total,

          // NEWS
          news_data: news_data,

        });
        
        }))

        .catch(error => {
          console.log(error);
          res.render("index", {
            // DOLAR
            dolar_oficial_buy : dolar_oficial_buy,
            dolar_oficial_sell: dolar_oficial_sell,
            dolar_blue_buy: dolar_blue_buy,
            dolar_blue_sell: dolar_blue_sell,
            euro_oficial_buy: euro_oficial_buy,
            euro_oficial_sell: euro_oficial_sell,
            
            // WEATHER
            weather: null,
            error: "Error, ingrese una ciudad válida. Por ejemplo 'Buenos Aires, AR'",

            // COVID
            covid_confirmed_daily: covid_confirmed_daily,
            covid_death_daily: covid_death_daily,
            covid_active: covid_active,

            covid_confirmed_total: covid_confirmed_total,
            covid_recovered_total: covid_recovered_total,
            covid_death_total: covid_death_total,

            // NEWS
          news_data: news_data,
  
          })});
  });

app.listen(8000, function () {
    console.log("App corriendo en el puerto 8000!");
  });