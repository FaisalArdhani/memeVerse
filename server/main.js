const express = require('express')
const dotenv = require('dotenv')
const connection = require('./config/db.js');
const usersRoute = require('./routes/usersRoute')
const memeRoute = require('../server/routes/memeRoute.js')
const session = require('express-session')

dotenv.config()

const app = express()

// connection DataBase
connection.connect((err) => {
    if (err) {
        console.error('Database connection failed: ', err.stack);
    } else {
        console.log('Connected to the database successfully.');
    }
});

// endpoint
app.get('/', (req, res) => {
    res.send("Hello world")
})

app.use(express.json());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));



// Menggunakan register routes
app.use('/api', usersRoute, memeRoute);

// Middleware
app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`)
})