var canvas = document.getElementById("mapCanvas")
var ctx = canvas.getContext("2d");

var currentWorld = "world"

var chunkOffsetX = 0
var chunkOffsetZ = 0
var zoom = 6


var cooled = false

render()

function render(){
    ctx.fillStyle = "#000000"
    ctx.rect(0, 0, 512, 512)
    ctx.fill();
    
    ctx.beginPath();
    for(var i = 0; i < 32/zoom; i++){
        for(var y = 0; y < 32/zoom; y++){
            sendReq(i+chunkOffsetX,y+chunkOffsetZ)   
            if(i == 32/zoom-1){
                cooled = false
            }
        }
    }

}

function loadShop(){
    var shopName = document.getElementById("shopName").value

    let xhr = new XMLHttpRequest();
    xhr.open("POST", "http://localhost:3000/getShopByName")
    
    xhr.setRequestHeader("Accept", "application/json");
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.onload = function(){
        if (xhr.readyState === xhr.DONE && xhr.status === 200) {
            console.log(xhr.response)
            if(xhr.response != "error"){
                var data = JSON.parse(xhr.response)
                var builtString = `${data.name}: owned by ${data.user}. they are a`

                for(let x in data.sellable){
                    if(data.sellable[x]){
                        if(x != "gear"){
                            builtString = builtString.concat(" and ", x)
                        }else{
                            builtString = builtString.concat(" ", x)
                        }
                    }
                }

                builtString = builtString.concat(" store, they take '"+data.takes+"' check em out at " + data.cords.x + " " + data.cords.z + " (as chunk coordinates)")

                document.getElementById("dataShop").innerHTML = builtString
            }
        }
    }

    let data = '{"name":"'+shopName+'"}'
    dataJSON = JSON.parse(JSON.stringify(data))
    //console.log(dataJSON)
    xhr.send(dataJSON)
}

function gotoChunk(){
    var xNum = document.getElementById("gotoX").value
    var zNum = document.getElementById("gotoZ").value
    console.log("FUCK")
    if(typeof parseFloat(xNum) == "number"){
        console.log("SHIT")
        if(typeof parseFloat(zNum) == "number"){
            console.log("BITCH")
            chunkOffsetX = parseFloat(xNum)
            chunkOffsetZ = parseFloat(zNum)
            document.getElementById("positions").innerHTML = chunkOffsetX +" "+ chunkOffsetZ
            render()
        }
    }
}

function loadSquare(x,y,z,type,world){

    if(world == currentWorld){
        ctx.fillStyle = makeColor(y,type)
        ctx.rect(x, z, zoom, zoom)
        ctx.fill();
        ctx.rect(x, z, zoom, zoom)
        ctx.strokeStyle = "white"
        //ctx.stroke();
        ctx.beginPath();
    }
}

function loadPoint(x,y,z,world){
    if(world == currentWorld){
        ctx.fillStyle = "blue"
        ctx.rect(x,z,zoom,zoom)
        ctx.globalAlpha = 0.35;
        ctx.fill();
        ctx.beginPath();
        ctx.globalAlpha = 1.0;
    }
}

function loadText(x,z,world,text,accepted){
    if(world == currentWorld){
        ctx.font= zoom*2.5+"px Comic Sans MS";
        ctx.fillStyle = "red";
        ctx.textAlign = "left";
        ctx.fillText(text, x, z + ((32/zoom)*zoom));
        var builtString = ""
        var latestString = ""
        for(let x in accepted){
            if(accepted[x]){
                builtString = latestString.concat("|", x.charAt(0),"|")
                latestString = builtString
            }
        }
        ctx.fillText(builtString, x, z + ((32/zoom)*zoom+25))
    }
}

//just RIPPED from stack overflow
function shadeColor(color, percent) {

    var R = parseInt(color.substring(1,3),16);
    var G = parseInt(color.substring(3,5),16);
    var B = parseInt(color.substring(5,7),16);

    R = parseInt(R * (100 + percent) / 100);
    G = parseInt(G * (100 + percent) / 100);
    B = parseInt(B * (100 + percent) / 100);

    R = (R<255)?R:255;  
    G = (G<255)?G:255;  
    B = (B<255)?B:255;  

    var RR = ((R.toString(16).length==1)?"0"+R.toString(16):R.toString(16));
    var GG = ((G.toString(16).length==1)?"0"+G.toString(16):G.toString(16));
    var BB = ((B.toString(16).length==1)?"0"+B.toString(16):B.toString(16));

    return "#"+RR+GG+BB;
}

//the idea here is that if the block has a lower y level, the color returned is darker
function makeColor(y,type){
    data = {
        "GRASS_BLOCK":"#004d04",
        "GRASS":"#004d04",
        "OAK_LEAVES":"#1f6b16",
        "BIRCH_LEAVES":"#43783d",
        "WATER":"#2f4591",
        "SAND":"#998843",
        "STONE":"#666666",
        "LILAC": "#8b638f",
        "DIRT":"#382f28",
        "PEONY": "#8b638f",
        "LILY_OF_THE_VALLEY": "#8b638f",
        "DANDELION": "#8b638f",
        "POPPY": "#8b638f",
        "ROSE_BUSH": "#8b638f",
        "GRAVEL":"#666666",
        "SUGAR_CANE":"#004d04",
        "SEAGRASS":"#2f4591",
        "TALL_SEAGRASS":"#2f4591",
        "GRANITE":"#ad7250",
        "TALL_GRASS":"#004d04",
        "OXEYE_DAISY": "#8b638f",
        "CORNFLOWER": "#8b638f",
        "AZURE_BLUET": "#8b638f",
        "COPPER_ORE":"#666666",
        "CAVE_AIR":"#666666",
        "COAL_ORE":"#666666",
        "ANDESITE":"#666666",
        "BUBBLE_COLUMN":"#2f4591",
        "DIORITE":"#666666",
        "SANDSTONE":"#998843",
        "KELP":"#2f4591",
        "FIRE":"#91481d",
        "OAK_PLANKS": "#8a7037",
        "OAK_LOG": "#2e230c",
        "DIRT_PATH":"#6b613e",
        "LAVA":"#91481d",
        "CARROTS":"#52ad39",
        "OAK_TRAPDOOR": "#8a7037",
        "WHEAT":"#52ad39",
        "OAK_STAIRS": "#8a7037",
        "POTATOES":"#52ad39",
        "BEETROOTS":"#52ad39",
        "COMPOSTER":"#2e230c",
        "PUMPKIN":"#85410d",
    }
    var colorExist = false

    for(let x in data){
        if(x == type){
            var percent = Math.round(y/10)
            return(shadeColor(data[x], (percent*10)))
            colorExist = true
        }
    }

    if(colorExist == false){
        console.log("ADD " + type + " NOW")
        return("#ff0800")
    }
    
}



function sendReq(x,z){
    let xhr = new XMLHttpRequest();
    xhr.open("POST", "http://localhost:3000/getMap")
    
    xhr.setRequestHeader("Accept", "application/json");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onload = function(){
        if (xhr.readyState === xhr.DONE && xhr.status === 200) {
            //console.log(xhr.response)
            if(xhr.response != "file_not_loaded"){
                var data = xhr.response
                fileData = JSON.parse(data)
                mapData = fileData.map
                console.log(fileData.shop)

                for(let index in mapData.pos){
                    //console.log(mapData.pos[index].x*zoom-(chunkOffsetX*(zoom*16)), mapData.pos[index].z*zoom-(chunkOffsetZ*(zoom*16)),index,mapData.pos[index].block)
                    
                    loadSquare(mapData.pos[index].x*zoom-(chunkOffsetX*(zoom*16)),mapData.pos[index].y, mapData.pos[index].z*zoom-(chunkOffsetZ*(zoom*16)),mapData.pos[index].block,currentWorld)
                    if(fileData.shop != "none"){
                        loadPoint(mapData.pos[index].x*zoom-(chunkOffsetX*(zoom*16)),mapData.pos[index].y, mapData.pos[index].z*zoom-(chunkOffsetZ*(zoom*16)),currentWorld)
                    }
                }
                if(fileData.shop != "none"){
                    loadText(mapData.pos[0].x*zoom-(chunkOffsetX*(zoom*16)), mapData.pos[0].z*zoom-(chunkOffsetZ*(zoom*16)),currentWorld,fileData.shop.name,fileData.shop.sellable)
                }
            }
        }
    }
    let data = '{"world":"'+currentWorld+'","x":'+x+',"z":'+z+'}'
    dataJSON = JSON.parse(JSON.stringify(data))
    //console.log(dataJSON)
    xhr.send(dataJSON)
}

function move(direction){
    if(cooled == false){
        if(direction == "up"){
            chunkOffsetZ -= 1
        }
        if(direction == "down"){
            chunkOffsetZ += 1
        }
        if(direction == "left"){
            chunkOffsetX -= 1
        }
        if(direction == "right"){
            chunkOffsetX += 1
        }
        document.getElementById("positions").innerHTML = chunkOffsetX +" "+ chunkOffsetZ
        render()
    }
}

