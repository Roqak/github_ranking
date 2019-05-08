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
function modify(aa){
    aa[0].jj="kk"
    return aa
}
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
            }
            // for(let i = 0; i<myFollowers.length; i++){
            //     options2.uri = rp(`https://api.github.com/search/commits?q=author:${myfollowers[i].username}&type=Commits`)
            //     let totalCommitCounts = await rp(options2)
            //     totalCommitCounts = JSON.parse(totalCommitCounts).total_count;
            //     console.log(totalCommitCounts);
            // }
            // console.log(allMyFollowers)
            // res.send(myFollowers);
            res.redirect("destination")
            } catch (error) {
                res.send(error)
            }
    }
  
    main()
})
app.get("/destination",(req,res)=>{
    async function finalstuff(){
        try{
        for(let i = 0; i<myFollowers.length; i++){
                options2.uri = rp(`https://api.github.com/search/commits?q=author:${myfollowers[i].username}&type=Commits`)
                let totalCommitCounts = await rp(options2)
                totalCommitCounts = JSON.parse(totalCommitCounts).total_count;
                console.log(totalCommitCounts);
            }
        }
        catch(error){
            res.send(error)
        }
    }
    finalstuff()
})

app.listen(9500,()=>{
    console.log("Listening on port 3000")
})