const express = require('express');
const mongoose = require('mongoose');
const os = require('os');
const port = process.env.PORT || 3010;
const authRoutes = require('./routes/authRoutes');

const app = express();

// middleware
app.use(express.static('public'));
app.use(express.json());

// view engine
app.set('view engine', 'ejs');

// database connection
const dbURI = 'mongodb+srv://jwtnodeuser:48FPKq8fUiF2brtl@cluster0.wz4dw.mongodb.net/jwtdb';
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex:true })
  .then((result) => app.listen(3010))
  .then(() => {
        let userName = os.userInfo().username;
        console.log(`Hi ${userName}! 
            System is started on ${os.platform()} ${os.hostname()} ${os.release()}. cpu count: ${os.cpus().length}, port: ${port}`);})
  .catch((err) => console.log(err));

// routes
app.get('/', (req, res) => res.render('home'));
app.get('/smoothies', (req, res) => res.render('smoothies'));
app.use(authRoutes);


process.on("SIGINT", () => {
    console.log('\ndb is closed'); 
    mongoose.disconnect();
    process.exit();
});
