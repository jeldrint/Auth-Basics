const express = require('express');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bcrypt = require('bcryptjs')

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

//Putting LocalStrategy here, before the app.use().
// Function One: Setting up the LocalStrategy
passport.use(
    new LocalStrategy(async (username, password, done) => {
        try{
            const user = await User.findOne({ username: username})
            if (!user) {
                return done(null, false, { message: 'Incorrect username'})
            }
            //Inside your LocalStrategy function we need to replace the
            //user.password !== password expression with the bcrypt.compare() function.
            const match = await bcrypt.compare(password, user.password);
            if (!match){
                //passwords do not match!
                return done(null, false, {message: "Incorrect Password"})
            }
            return done(null,user);
        }catch(err) {
            return done(err);
        }
    })
)

//Function Two and Three: Sessions and Serialization
passport.serializeUser((user,done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id,done) => {
    try {
        const user = await User.findById(id);
        done(null,user);
    }catch(err){
        done(err);
    }
})

// MIDDLEWARES
app.use(session({ secret: 'cats', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));

//DECLARING LOCAL VARIABLE
app.use((req,res,next)=>{
    res.locals.currentUser = req.user;
    next();
});


app.get('/', (req,res) => {
    res.render('index', {user: req.user});
});

// SIGN UP
app.get('/sign-up',(req,res) => res.render("sign-up-form"));

app.post('/sign-up', async (req,res,next) =>{
    bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
        if (err){
            console.log(err);
        }else{
            try {
                const user = new User ({
                    username: req.body.username,
                    password: hashedPassword
                });
                const result = await user.save();
                res.redirect("/");
            } catch(err) {
                return next(err);
            };        
        }
    })
});

app.post('/log-in',
    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/",
    })
)

app.get('/log-out', (req,res,next) => {
    req.logout((err) => {
        if(err){
            return next(err)
        }
        res.redirect('/');
    })
})

app.listen(3000, () => console.log('app listening on port 3000!'));