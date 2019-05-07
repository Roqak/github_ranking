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
test_array = [
    {
        a:"aa",
        b:2,
},
{
    a:"ab",
    b:1,
},
{
    a:"ac",
    b:3,
},
{
    a:"ac",
    b:3,
},
{
    a:"ac",
    b:10,
},
{
    a:"ac",
    b:5,
}
]
let myFollowers = [];
let finalUser = [];

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
            let followers_url = JSON.parse(user).url;
            let authenticated_user= JSON.parse(user).login
            getFollowers.headers.Authorization = `token ${accesscode}`
            getFollowers.uri = `${followers_url}/following`
            // res.json(JSON.parse(user))
            // res.json(authenticated_user)
            rp(getFollowers)
            .then(followers=>{
                let userData = JSON.parse(followers);
                
                for(let i =0; i<userData.length;i++){
                    currentUser.username = userData[i].login
                    currentUser.repo_url = userData[i].repos_url
                    let userevents = userData[i].url+"/events"
                    getEvents.uri = userevents
                    // rp(getEvents)
                    //         .then(my_events=>{
                    //             res.send(my_events)
                    //             })
                    //         .catch(error=>{
                    //             console.log(`Hey!! a critical error here: ${error}`)
                    //         })
                    // RENDER USER EVENTS LINK, USERNAME AND PASSWORD
                    myFollowers.push({
                        username: userData[i].login,
                        render: userData[i].repos_url,
                        events: userData[i].url+"/events",
                        commits: "",
                    })
                    // rp(userData[i].url+"/events")
                    // .then(user_events=>{
                    //     res.json({user_events})
                    // })
                    // .catch(user_error=>{
                    //     res.send(user_error)
                    // })
                }
                // res.json(myFollowers)
                // GET USER EVENTS
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
          }
                };
                // let totalcommits = []
                // for(let k = 0; k<myFollowers; k++){
                    // console.log(myFollowers)
                    console.log(req.cookies.code)
                    // options2.uri =`https://api.github.com/search/commits?q=author:${myFollowers[1].username}&type=Commits`
                    // options2.uri = `https://api.github.com/search/commits?q=author:Roqak&type=Commits`
                    // options2.form.code = req.cookies.code;
                    rp(options)
                    .then(user_events=>{
                        let all_user_events = JSON.parse(user_events);
                        // let pushEvents = all_user_events.filter(eventss=>eventss.type === "PushEvent")
                        // totalcommits.push(user_events)
                        // console.log(user_events)
                        // res.json(user_events)
                        res.redirect('/dd')
                    })
                    .catch(user_error=>{
                        res.send(user_error)
                    })
                // res.json(totalcommits)

                // }
                // req.headers['User-Agent'] = 'Roqak';
                // rp(options)
                //     .then(user_events=>{
                //         let all_user_events = JSON.parse(user_events);
                //         let pushEvents = all_user_events.filter(eventss=>eventss.type === "PushEvent")
                //         res.json(pushEvents)
                //     })
                //     .catch(user_error=>{
                //         res.send(user_error)
                //     })
                // res.json(totalcommits)
                })
            .catch(err=>{
                console.log(`Error level 1: ${err}`)
            })
        })
        .catch(error=>{
            console.log(`Error level 2: ${error}`)
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
    // res.end();
})
app.get('/dd',(req,res)=>{
    // res.headers.Accept ='application/vnd.github.cloak-preview';
    // res.headers['User-Agent'] = 'Roqak';
    // res.header('User-Agent') = 'Roqak'
    // console.log(myFollowers)
    let options = {
        method: 'GET',
        // uri: 'https://api.github.com/search/commits?q=author:sainttobs&type=Commits',
        form: {
            q:"Roqak",
            type:"commit",
            // state: "kdkdkddldldlkdkfd",
            // code: req.cookies.code
        },
        headers: {
            'User-Agent': 'Roqak',
            'Accept': 'application/vnd.github.cloak-preview'
          }
    };
    // for(let o = 0; o< myFollowers.length; o++){
    //     options.uri = `https://api.github.com/search/commits?q=author:Roqak&type=Commits`
    //     rp(options)
    // .then(result=>{
    //     let nnn = {
    //         username : myFollowers[o].username,
    //         render: myFollowers[o].render,
    //         events: myFollowers[o].events,
    //         commits: result.total_count,
    //     }
    //     // myFollowers[o]['username'] = result.total_count
    //     finalUser.push(nnn)
    //     // res.json(JSON.parse(result))
    //     console.log("///////////////////////////////////////////////")
    //     console.log(result.total_count)
    // })
    for(let index = 0; index < myFollowers.length; index++){
        options.headers.Accept = 'application/vnd.github.cloak-preview'
        options.headers["User-Agent"] = 'Roqak'
    options.uri = `https://api.github.com/search/commits?q=author:${myFollowers[index].username}&type=Commits`
        rp(options)
    .then(result=>{
        
        // myFollowers[o]['username'] = result.total_count
        // finalUser.push(nnn)
        console.log("/////////////////////////////////////////////")
        // console.log(result)
        user_json = JSON.parse(result)
        // let nnn = {
        //     username : myFollowers[index].username,
        //     render: myFollowers[index].render,
        //     events: myFollowers[index].events,
        //     commits: user_json.total_count,
        // }
        // res.json()
        // finalUser.push(user_json.total_count)
        finalUser[0]=myFollowers[index].username
        // finalUser.push(user_json)
        console.log("Your json:")
        console.log(user_json)
        // console.log(result.total_count)
        // res.json(user_json)
        // res.end()
    })
    .catch(err=>{
        res.send(err)
    })
    // }
    // res.json(finalUser)
// }
// res.json(finalUser)
res.end()
    }
    // res.json(finalUser)
    res.redirect('finalstuff')
})
let arr = ['Roqak','sainttobs','unicodeveloper','alexonozor']
app.get("/finalstuff",(req,res)=>{
    res.json(finalUser)
})
app.get('/dj',(req,res)=>{
    let i = 0;
    while(i < arr.length)
    {
        let options = {
            method: 'GET',
            form: {
                q:"Roqak",
                type:"commit",
            },
            headers: {
                'User-Agent': 'Roqak',
                'Accept': 'application/vnd.github.cloak-preview'
              }
        };
        options.headers.Accept = 'application/vnd.github.cloak-preview'
        options.headers["User-Agent"] = 'Roqak'
    options.uri = `https://api.github.com/search/commits?q=author:${arr[i]}&type=Commits`
    rp(options)
    .then(result=>{
        user_json = JSON.parse(result)
        console.log(user_json.total_count)
        i++
    })
    .catch(err=>{
        res.send(err)
    })
    }
    
})


console.log(bubble_Sort(test_array).reverse())
console.log(modify(sample))
app.listen(9500,()=>{
    console.log("Listening on port 3000")
})