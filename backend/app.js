const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const placesRoutes = require('./routes/places-routes');
const usersRoures = require('./routes/users-routes');
const HttpError = require('./models/http-error');

const urlDB = `mongodb+srv://user:user@gettingstarted.ke44j.mongodb.net/places?retryWrites=true&w=majority`
const app = express();

app.use(bodyParser.json());

app.use('/api/places',placesRoutes);
app.use('/api/users', usersRoures);

app.use((req, res, next) => {
  throw new HttpError('Could not find this route', 404);
})

app.use((error, req,res, next) => {
  if (res.headerSent) {
    return next(error);
  }

  res.status(error.code || 500 );
  res.json({message: error.message || 'An unknown error occured! '});
});


mongoose.connect(urlDB, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true }).then(() => {
  console.log('Start App');
  app.listen(5000);
}).catch((error) => {
  console.log(error)
})
