const express = require('express')
const fs = require('fs');
var bodyParser = require("body-parser");
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
const port = 3000;

const cors = require("cors");
const { json } = require('express');
const { syncBuiltinESMExports } = require('module');
const e = require('express');
app.use(cors())

app.use(express.static('public'));

app.get('/fartnutsmc', (req, res) => {
    fs.readFile('public/minecraft/index.html', 'utf8', (err, data) => {
    if (err) {
        console.error(err);
        return;
    }
    res.send(data);
    });
})

app.get('/fartnutsmc/shops', (req, res) => {
    fs.readFile('public/minecraft/shop.html', 'utf8', (err, data) => {
    if (err) {
        console.error(err);
        return;
    }
    res.send(data);
    });
})

app.get('/fartnutsmc/lock', (req, res) => {
    fs.readFile('public/minecraft/lock.html', 'utf8', (err, data) => {
    if (err) {
        console.error(err);
        return;
    }
    res.send(data);
    });
})

app.get('/fartnutsmc/map', (req, res) => {
    fs.readFile('public/minecraft/fartmap.html', 'utf8', (err, data) => {
    if (err) {
        console.error(err);
        return;
    }
    res.send(data);
    });
})


//testing clan creation

app.post("/testMC", function(req,res){
    var body = req.body
    message = "error"
    fs.readdir("./clans", function(err,files){
        var alreadyExists = false;
        if(err){return console.error("Could not list the directory.", err);}

        files.forEach(function (file, index) {
            //var fileData = JSON.parse(data)
            var fileData;
            if(alreadyExists){return;}
            fs.readFile('./clans/' + file, 'utf8', (err, data) => {

                if (err) {
                    console.error(err);
                    return;
                }

                fileData = JSON.parse(data)

                for(let x in fileData.members){
                    if(fileData.members[x]["name"] == body.user){
                        alreadyExists = true;
                        message = "user_already_in_clan"
                        return
                    }
                }
                if(fileData.name == body.name){
                    alreadyExists = true;
                    message = "clan_already_exists"
                    return
                }     
                if(fileData.user == body.user){
                    alreadyExists = true;
                    message = "user_already_has_clan"
                    return
                }
            });
        })   


        clearCheck = setInterval(CheckForRes,50)
        function CheckForRes(){
            if(!alreadyExists){
                message = "success"
            }
            if(message != "error"){
                clearInterval(clearCheck);
                if(!alreadyExists){
                    let data = JSON.stringify(body);
                    fs.writeFileSync("./clans/"+body.user+".json", data)      
                }
            }
            res.send(message)
        }
    })

})

app.post("/makeKey", function(req,res){
    var body = req.body
    
    var ProbKey = Math.random().toString(36).slice(2, 7);

    function checkExistence(){
        fs.readdir("./keys", function(err,files){
            if(err){return console.error("Could not list the directory.", err);}
    
            files.forEach(function (file, index) {
                var fileData;
                fs.readFile('./keys/' + file, 'utf8', (err, data) => {
                    fileData = JSON.parse(data)
                    if(fileData.key == ProbKey){
                        ProbKey = Math.random().toString(36).slice(2, 7);
                        checkExistence();
                        return;
                    }
                })
            })
    
        })       
    }
    
    checkExistence()

    var key = ProbKey

    let newJson = {"user":body.user, "key":key}
    fs.writeFileSync("./keys/"+body.user+".json", JSON.stringify(newJson))

    res.send(key)

});


app.post("/getUser", function(req,res){
    var body = req.body

    message = "error"
    user = ""

    fs.readdir("./keys", function(err,files){
        if(err){return console.error("Could not list the directory.", err);}
        var dontExist = true
        files.forEach(function (file, index) {
            var fileData;
            fs.readFile('./keys/' + file, 'utf8', (err, data) => {
                fileData = JSON.parse(data)
                if(fileData.key == body.key){
                    user = fileData.user
                    dontExist = false
                    return
                }
            })

        }) 


        clearCheck = setInterval(CheckForRes,50)
        function CheckForRes(){
            if(!dontExist){
                message = user
                clearInterval(clearCheck);
            }else{
                clearInterval(clearCheck);
            }
            res.send(message)
        }
        
    })
    



})

app.post("/getClan", function(req,res){
    var body = req.body

    message = "error"
    var clan = {}

    fs.readdir("./clans", function(err,files){
        if(err){return console.error("Could not list the directory.", err);}
        var dontExist = true
        files.forEach(function (file, index) {
            var fileData;
            fs.readFile('./clans/' + file, 'utf8', (err, data) => {
                fileData = JSON.parse(data)
                if(fileData.user == body.user){
                    clan = fileData
                    dontExist = false
                    return
                }
            })

        }) 


        clearCheck = setInterval(CheckForRes,50)
        function CheckForRes(){
            if(!dontExist){
                message = clan
                clearInterval(clearCheck);
            }else{
                clearInterval(clearCheck);
            }
            res.send(message)
        }
        
    })
    



})

app.post("/joinClan", function(req,res){

    var body = req.body

    message = "error"
    var clan = {}
    fs.readdir("./clans", function(err,files){
        if(err){return console.error("Could not list the directory.", err);}
        //find the right clan to add too(and if it exists)
        var dontExist = true
        files.forEach(function (file, index) {
            var fileData;
            fs.readFile('./clans/' + file, 'utf8', (err, data) => {

                fileData = JSON.parse(data)

                for(let x in fileData.members){
                    if(fileData.members[x].name == body.user){
                        dontExist = true
                        return
                    }
                }

                if(fileData.name == body.name){
                    clan = fileData
                    dontExist = false
                    return
                }
            })

        })


        clearCheck = setInterval(CheckForRes,50)
        function CheckForRes(){
            if(!dontExist){
                message = "success"
                addToClan(clan,body.user)
                clearInterval(clearCheck);
            }else{
                clearInterval(clearCheck);
            }
            res.send(message)
        }
        function addToClan(data,name){
            var BiggestID = 0
            console.log("bruh")
            for(let x in data.members){
                BiggestID = BiggestID + 1
            }
            var idAdd = BiggestID

            data.members[idAdd] = {"id":BiggestID+1,"name":name}
            fs.writeFileSync("./clans/"+data.user+".json", JSON.stringify(data))
            console.log(data)
        }
    })

})


app.post("/getClanFromMember", function(req, res){
    var body = req.body

    message = "error"

    fs.readdir("./clans", function(err,files){
        if(err){return console.error("Could not list the directory.", err);}
        var isInClan = false;
        files.forEach(function (file, index) {
            var fileData;
            fs.readFile('./clans/' + file, 'utf8', (err, data) => {
                fileData = JSON.parse(data)
                for(let x in fileData.members){
                    if(fileData.members[x].name == body.name){
                        isInClan = true
                        message = fileData
                        return
                    }
                }
            })
        })

        clearCheck = setInterval(CheckForRes,50)
        function CheckForRes(){
            if(isInClan){
                clearInterval(clearCheck);
            }else{
                clearInterval(clearCheck);
            }
            res.send(message)
        }


    })
});



app.post("/makeShop", function(req, res){
    var body = req.body
    fs.readdir("./shop", function(err,files){
        if(err){return console.error("Could not list the directory.", err);}
        var hasShop = false;
        files.forEach(function (file, index) {
            fs.readFile('./shop/' + file, 'utf8', (err, data) => {
                fileData = JSON.parse(data)
                if(fileData.user == body.user){
                    hasShop = true
                    return
                }
            })
        })
        var message = "error"
        clearCheck = setInterval(CheckForRes,50)
        function CheckForRes(){
            if(hasShop){
                clearInterval(clearCheck);
                message = "already has shop, shop has been replaced(make sure to /set_shop again) "
                fs.writeFileSync("./shop/"+body.user+".json", JSON.stringify(body))
            }else{
                clearInterval(clearCheck);
                message = "success"
                fs.writeFileSync("./shop/"+body.user+".json", JSON.stringify(body))
            }
            res.send(message)
        }

    })
})

app.post("/setShop", function(req, res){
    var body = req.body
    fs.readdir("./shop", function(err,files){
        var hasShop = false;
        if(err){return console.error("Could not list the directory.", err);}
        files.forEach(function (file, index) {
            fs.readFile('./shop/' + file, 'utf8', (err, data) => {
                fileData = JSON.parse(data)
                if(fileData.user == body.user){
                    hasShop = true
                    return
                }
            })
        })
        var message = "error"
        clearCheck = setInterval(CheckForRes,50)
        function CheckForRes(){
            if(hasShop){
                clearInterval(clearCheck);
                
                var newJson = JSON.parse(fs.readFileSync("./shop/"+body.user+".json"))
                newJson.cords.x = body.x
                newJson.cords.y = body.y
                newJson.cords.z = body.z
                newJson.cords.w = body.w
                
                fs.writeFileSync("./shop/"+body.user+".json", JSON.stringify(newJson))
                message = "success"
            }else{
                clearInterval(clearCheck);
                message = "you dont own a shop"
            }
            res.send(message)
        }

    })
})

app.post("/getShopByName",function(req, res){
    var body = req.body
    fs.readdir("./shop", function(err,files){
        var isReal = false
        var shop = "none"
        if(err){return console.error("Could not list the directory.", err);}
        files.forEach(function (file, index) {
            fs.readFile('./shop/' + file, 'utf8', (err, data) => {
                fileData = JSON.parse(data)
                if(fileData.name == body.name){
                    isReal = true
                    shop = fileData
                    return
                }
            })
        })
        var message = "error"
        clearCheck = setInterval(CheckForRes,50)
        function CheckForRes(){
            if(isReal){
                clearInterval(clearCheck);
                message = shop
            }else{
                clearInterval(clearCheck);
            }
            res.send(message)
        }
    })
})

function getShop(req){
    var body = req.body
    var exists = false
    var message = "error"
    fs.readdir("./shop", function(err,files){
        if(err){return console.error("Could not list the directory.", err);}
        files.forEach(function(file, index){
            if(exists == false){
                fs.readFile('./shop/' + file, 'utf8', (err, data) => {
                    if(err){return console.error(err);}
                    fileData = JSON.parse(data)
                    if(body.x == Math.round(fileData.cords.x)){
                        if(body.z == Math.round(fileData.cords.z)){
                            message = fileData
                            console.log(JSON.stringify(message) + ": RAHHHH")
                            exists = true
                        }
                    }
                })
            }
        })
    })
}

app.post("/addMap", function(req, res){
    var body = req.body
    if(typeof body.world == "string"){
        fs.readdir(`./map/${body.world}`, function(err,files){
            if(err){console.log(console.log(err)); res.send(err)}
            var newData = `{"pos":${body.pos}}`
            console.log(body)
            fs.writeFileSync(`./map/${body.world}/${body.x}-${body.z}.json`,JSON.stringify(body),function(err){
                if(err){console.log(err)}
            })
            res.send("yup")
        })
    }else{
        res.send("RAH")
    }
})

app.post("/getMap", function(req, res){
    fs.readdir("./shop", function(err,files){
        var body = req.body
        
        var data = "error"
    
        var shopData = '"error"'
        var exists = false

        var read;
        try {
            read = fs.readFileSync(`./map/${body.world}/${body.x}-${body.z}.json`,function(err){
                data = "file_error"
                console.log(err)
            })
    
            
            if(err){return console.error("Could not list the directory.", err);}
            files.forEach(function(file, index){
                if(exists == false){
                    fs.readFile('./shop/' + file, 'utf8', (err, data) => {
                        if(err){return console.error(err);}
                        fileData = JSON.parse(data)
                        if(body.x == fileData.cords.x){
                            if(body.z == fileData.cords.z){
                                shopData = fileData
                                //FUCK I HATE IT HERE, THIS SHIT JUST DONT WORK
                                //the shit do work nvm
                                exists = true
                            }
                        }
                    })
                }
            })

            } catch (err) {
                data = "file_not_loaded"
            }
            
            setTimeout(function () {
                //data = JSON.parse(read)
                if(data == "error"){
                    data = `{"map":${read},"shop":"none"}`
                    if(shopData != '"error"'){
                        data = `{"map":${read},"shop":${JSON.stringify(shopData)}}`
                    }
                }
                //console.log(shopData +JSON.stringify(body))
                res.send(data)
            },50)
    })
})


//stuff used to get data from the minecraft server

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
})
