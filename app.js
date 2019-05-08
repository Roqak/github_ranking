const express = require('express');
const app = express();
const rp = require('request-promise');
const hbs = require('express-handlebars');
const path = require('path');
const keys = require('./config/keys');
let accesscode = ""
const cookieParser = require('cookie-parser')
const bubble_Sort = require('./bubbleSort')
app.use(cookieParser());

app.engine('.hbs', hbs({ defaultLayout: 'main', extname: '.hbs' }));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', '.hbs');
app.set('trust proxy', 1) // trust first proxy
let getEvents = {
    method: 'GET',
    headers: {
        'User-Agent': 'Roqak',
        'Accept': 'application/json'
      },
}
let currentUser = {
    username: "",
    repo_url: ""
}
let options = {
    method: 'POST',
    uri: 'https://github.com/login/oauth/access_token',
    form: {
        allow_signup: true,
        client_id: keys.client_id,
        client_secret: keys.client_secret,
        state: "kdkdkddldldlkdkfd",
        scope: 'repo,public_repo'
    },
    headers: {
        'User-Agent': 'Roqak',
        'Accept': 'application/json'
      }
};
let sample = [
    {
        name:"a",
        age: 10
}
]
function modify(aa){
    aa[0].jj="kk"
    return aa
}
let myFollowers = [];
let finalUser = [];

app.get('/',(req,res)=>{
    res.redirect(`https://github.com/login/oauth/authorize?allow_signup=true&client_id=${keys.client_id}`);
    
})
app.get('/auth',(req,res)=>{
    // console.log(req.query);
    if(!req.query.code){
        res.redirect('/')
    }
    res.cookie('code',req.query.code, { maxAge: 900000, httpOnly: true });
    // req.session.code = req.query.code
    options.form.code=  req.cookies.code
    // getUsers.form.code=  req.cookies.code
    res.render('index')
    // res.redirect('/dashboard')
})
app.get("/dashboard",(req,res)=>{
    myFollowers=[]
    console.log(`Your code is: ${options.form.code}`)
     (async function(){
        try{
            let user = await rp(options)
            accesscode = JSON.parse(user).access_token
            // console.log(`Your result: ${accesscode}`)
            options.form.code=  req.cookies.code
            getUsers.headers.Authorization = `token ${accesscode}`
            let getAllFollowers = await rp(getUsers)
            getAllFollowers = JSON.parse(getAllFollowers)
            res.send(getAllFollowers)
        }
        catch(error){
            res.send(error)
        }
    })
    
})

app.listen(9500,()=>{
    console.log("Listening on port 3000")
})