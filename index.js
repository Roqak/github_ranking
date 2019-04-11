const express = require('express');
const app = express();
const rp = require('request-promise');
const session = require('express-session')
const hbs = require('express-handlebars');
const path = require('path');
const keys = require('./config/keys');
let accesscode = ""
const cookieParser = require('cookie-parser')

app.use(cookieParser());

app.engine('.hbs', hbs({ defaultLayout: 'main', extname: '.hbs' }));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', '.hbs');
app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'keyboardkitkitcat',
  resave: true,
  saveUninitialized: true,
  cookie: {}
}))
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
let getUsers = {
    method: 'get',
    uri: 'https://api.github.com/user',
    form: {
        // access_token: "",
        state: "kdkdkddldldlkdkfd"
    },
    headers: {
        'User-Agent': 'Roqak',
        'Accept': 'application/json'
      },
};
let getFollowers = {
    method: 'get',
    form: {
        state: "kdkdkddldldlkdkfd"
    },
    headers: {
        'User-Agent': 'Roqak',
        'Accept': 'application/json'
      },
};
// app.get('/',(req,res)=>{
//     rp('https://github.com/login/oauth/authorize?allow_signup=false&client_id=9de806a7d3435218ca41')
//     // rp(options)
//     .then(result=>{
//         // console.log(req.header)
//         res.send(result)
//     })
//     .catch(err=>{
//         console.log(`Error: ${err}`)
//     })
// })

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


app.get('/',(req,res)=>{
    // res.send(req.header)
    // rp('https://github.com/login/oauth/authorize?allow_signup=false&client_id=9de806a7d3435218ca41')
    res.redirect(`https://github.com/login/oauth/authorize?allow_signup=true&client_id=${keys.client_id}`);
})

app.get('/dashboard',(req,res)=>{
    console.log(`Your code is: ${options.form.code}`)
    rp(options)
    .then(result=>{
        // console.log(req.header)
        // accesscode = result
        // console.log(accesscode)
        // rp(`https://api.github.com/user?access_token=e14abebd03982e8fdf96c9dc66dcd7a11de3a732`)
        accesscode = JSON.parse(result).access_token
        console.log(`Your result: ${accesscode}`)
        options.form.code=  req.cookies.code
        // getUsers.form.access_token = accesscode
        getUsers.headers.Authorization = `token ${accesscode}`
        rp(getUsers)
        .then(user=>{
            let followers_url = JSON.parse(user).followers_url
            let authenticated_user= JSON.parse(user).login
            getFollowers.headers.Authorization = `token ${accesscode}`
            getFollowers.uri = `${followers_url}`
            // res.json(JSON.parse(user))
            // res.json(authenticated_user)
            rp(getFollowers)
            .then(followers=>{
                let myFollowers = [];
                let userData = JSON.parse(followers);
                let currentUser = {}
                for(let i =0; i<userData.length;i++){
                    currentUser.username = userData[i].login
                    currentUser.repo_url = userData[i].repos_url
                    myFollowers.push(currentUser)
                }
                res.json(myFollowers)
            })
            .catch(err=>{
                res.send(err)
            })
        })
        .catch(error=>{
            res.send(error)
        })

        // res.send(accesscode)
    })
    .catch(err=>{
        console.log(`Error: ${err}`)
    })
    // if(req.session.code){
    // console.log(`${req.cookies.code}`)
    // res.send(req.cookies.code)
    // }else{
    //     console.table(`${req.session}`)
    //     res.send('not found')
    // }
})

app.listen(3000,()=>{
    console.log("Listening on port 3000")
})