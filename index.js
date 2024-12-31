/* const dotenv = require('dotenv').config()
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const PORT = process.env.PORT || 3000;
const passport = require("passport");
const session = require("express-session");
const { sequelize } = require('./models');
const adminRoutes = require('./routes/admin');
const staffRoutes = require('./routes/staff');
const apaleoRoutes = require('./routes/apaleo');

const app = express();
const fs = require('fs');
const https = require('https');

// CONFIG EXPRESS SERVER
app.use(cors());
app.use(express.json());
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: true,
        saveUninitialized: true,
    })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));



// INITIAL ROUTES
app.use('/admin/v0', adminRoutes);
app.use('/staff/v0', staffRoutes);
app.use('/apaleo/v0', apaleoRoutes);

// SERVER CONFIG
//const privateKey = fs.readFileSync("./keys/key.pem", "utf8");
//const certificate = fs.readFileSync("./keys/cert.pem", "utf8");
const credentials = { key: privateKey, cert: certificate };
const httpsServer = https.createServer(credentials, app);
httpsServer.listen(PORT, () => {
    console.log(`HTTPS Server is running on port ${PORT}`);
});
 */


require('dotenv').config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const PORT = process.env.PORT || 3000;
const passport = require("passport");
const session = require("express-session");
const { sequelize } = require('./models');
const adminRoutes = require('./routes/admin');
const staffRoutes = require('./routes/staff');
const apaleoRoutes = require('./routes/apaleo');

const app = express();

// CONFIG EXPRESS SERVER
app.use(cors());
app.use(express.json());
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: true,
        saveUninitialized: true,
    })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// INITIAL ROUTES
app.use('/admin/v0', adminRoutes);
app.use('/staff/v0', staffRoutes);
app.use('/apaleo/v0', apaleoRoutes);

// SERVER CONFIG
app.listen(80, () => {
    console.log(`HTTP Server is running on port ${PORT}`);
});
