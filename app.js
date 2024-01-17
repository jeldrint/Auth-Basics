const express = require('express');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const mongoDb = 'mongodb+srv://johneldrintolentino:FKd7G2B8cU7DQUPr@cluster0.twtpwoc.mongodb.net/auth_basics?retryWrites=true&w=majority';
mongoose.connect(mongoDb);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'mongo connection error'));

const User = mongoose.model(
    "User",
    new Schema({
        username: {type: String, required: true},
        password: {type: String, required: true }
    })
)

const app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//Putting LocalStrategy here, before the app.use(). Why though?

app.use(session({ secret: 'cats', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));

app.get('/', (req,res) => res.render('index'));

// SIGN UP
app.get('/sign-up',(req,res) => res.render("sign-up-form"));

app.post('/sign-up', async (req,res,next) =>{
    try {
        const user = new User ({
            username: req.body.username,
            password: req.body.password
        });
        const result = await user.save();
        res.redirect("/");
    } catch(err) {
        return next(err);
    };
});

app.listen(3000, () => console.log('app listening on port 3000!'));