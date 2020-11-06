const express = require('express');
const mongoose = require('mongoose');
const os = require('os');
const port = process.env.PORT || 3010;
const authRoutes = require('./routes/authRoutes');
const cookieParser = require('cookie-parser');
const { requireAuth, checkUser } = require('./middleware/authMiddleware');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const app = express();
const corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200 
}
// middleware
app.use(express.static('public'));
app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));
app.use(fileUpload());

// view engine
app.set('view engine', 'ejs');

// database connection
const dbURI = 'mongodb+srv://jwtnodeuser:48FPKq8fUiF2brtl@cluster0.wz4dw.mongodb.net/jwtdb';
mongoose.connect(dbURI, { 
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex:true,
    useFindAndModify: false
  })
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


process.on("SIGINT", () => {
    console.log('\ndb is closed'); 
    mongoose.disconnect();
    process.exit();
});
