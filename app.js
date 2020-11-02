const express = require('express');
const mongoose = require('mongoose');
const os = require('os');
const port = process.env.PORT || 3010;
const authRoutes = require('./routes/authRoutes');
const cookieParser = require('cookie-parser');
const { requireAuth, checkUser } = require('./middleware/authMiddleware');

const app = express();

// middleware
app.use(express.static('public'));
app.use(express.json());
app.use(cookieParser());

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
app.get('*', checkUser);
app.get('/', (req, res) => res.render('home'));
app.get('/profile', requireAuth, (req, res) => res.render('profile'));
app.use(authRoutes);

/*/cookies
app.get('/set-cookies', (req, res) => {
    
    //res.setHeader('Set-Cookie', 'newUser=true');
    
    res.cookie('newUser', false);
    res.cookie('isEmployee', true, {maxAge: 1000*60*60*24, httpOnly: true})
    
    res.send('you got the cookies!');
    
});

app.get('/read-cookies', (req, res) => {
    
    const cookies = req.cookies;
    console.log(cookies);
    
    res.json(cookies);
    
})*/

process.on("SIGINT", () => {
    console.log('\ndb is closed'); 
    mongoose.disconnect();
    process.exit();
});
