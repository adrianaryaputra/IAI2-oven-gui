const Config = require('./config');

const express = require('express');
const app = express();

app.use(express.static('public'))
app.listen(Config.PORT, () => {
  console.log(`listening on port ${Config.PORT}`);
});