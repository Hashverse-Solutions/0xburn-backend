process['env']['NODE_ENV'] = process['env']['NODE_ENV'] || 'development';
require('dotenv').config({ path: `./.env.${process['env']['NODE_ENV']}` });

const cors = require('cors');
const morgan = require('morgan');
const express = require('express');
const bodyParser = require('body-parser');
const config = require('./config/environment');
const database = require('./utils/connection');
const port_no = process.env.PORT || 4000;
const fileUpload = require('express-fileupload')

let app = express();
app.use(cors());
app.use(morgan('dev'));
app.use(config['assets']);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: '5000mb', verify: function (req, res, buf, encoding) { req.rawBody = buf.toString() } }));
app.use(fileUpload());

database.getConnection();
require('./routes')(app);

app.get('*', (req, res) => res.sendFile(config['view']));

let server = require('http').createServer(app);


server.listen(port_no, () => console.log(`0x Burn is serving on ${port_no}`));