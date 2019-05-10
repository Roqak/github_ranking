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
let options2 = {
    method: 'GET',
uri: 'https://api.github.com/search/commits?q=author:sainttobs&type=Commits',
form: {
q:"Roqak",
type:"commit",
// state: "kdkdkddldldlkdkfd",
// code: req.cookies.code
},
headers: {
'User-Agent': 'Roqak',
'Accept': 'application/vnd.github.cloak-preview'
// 'Accept': 'application/json'
}
};
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
let myFollowers = [];
let finalUser = [];

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
    console.log(`Your code is: ${options.form.code}`);
    async function main(){
            try {
                let user = await rp(options)
            accesscode = JSON.parse(user).access_token
            options.form.code=  req.cookies.code
            getUsers.headers.Authorization = `token ${accesscode}`
            let getAuthUser = await rp(getUsers)
            getAuthUser = JSON.parse(getAuthUser)
            myFollowers.push({
                username: getAuthUser.login
            })
            let username = getAuthUser.login;
            
            let followers_url = getAuthUser.url;
            let authenticated_user= getAuthUser.login
            getFollowers.headers.Authorization = `token ${accesscode}`
            getFollowers.uri = `${followers_url}/following`
            let allMyFollowers = await rp(getFollowers)
            let userData = JSON.parse(allMyFollowers);
            // let toba = await rp(options2)
            for(let i = 0; i < userData.length; i++){
                myFollowers[i+1] = {username: userData[i].login}
                // options2.uri = rp(`https://api.github.com/search/commits?q=author:${userData[i].login}&type=Commits`)
                // let totalCommitCounts = await rp(options2)
                // console.log(totalCommitCounts);
            }
            let i = 0;
            for(let follower of myFollowers){
                options2.form.code=  req.cookies.code
                options2.headers.Authorization = `token ${accesscode}`
                options2.form.client_id = keys.client_id
                options2.form.client_secret = keys.client_secret
                options2.uri = `https://api.github.com/search/commits?q=author:${follower.username}&type=Commits`
                let totalCommitCounts = await rp(options2)
                totalCommitCounts = JSON.parse(totalCommitCounts).total_count;
                myFollowers[i].total_count = totalCommitCounts;
                console.log(totalCommitCounts);
                i++
            // console.log(myFollowers[i].username)
            }
            // console.log(allMyFollowers)
            console.log(bubble_Sort(myFollowers))
            res.render("dashboard",{datas:bubble_Sort(myFollowers)});
            // res.redirect("destination")
            } catch (error) {
                res.send(error)
            }
    }
  
    main()
})


app.listen(9500,()=>{
    console.log("Listening on port 3000")
})