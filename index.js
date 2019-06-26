var express = require('express');
const morgan = require('morgan');
var bodyParser = require('body-parser');
var port = 8000;
var app = express();
var bds = require('./routers/bds.router');
var ccq = require('./routers/ccq.router');
var trader = require('./routers/trader.router');
var auth = require('./routers/auth.router');

if (process.env.NODE_ENV === "test") {
    // use morgan to log at command line
    app.use(morgan('combined')); //'combined' outputs the Apache style LOGs
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

app.use('/api/bds', bds);
app.use('/api/ccq', ccq);
app.use('/api/trader', trader);
app.use('/api/auth', auth);

module.exports = app;
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
