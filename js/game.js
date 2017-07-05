
//对象模板 ↓↓↓↓
/**
 *
 * @param x 坦克左上角的x坐标
 * @param y 坦克右上角的x坐标
 * @param life 坦克的生命值
 * @param armor 坦克的护甲
 * @param attack 坦克的攻击力
 * @param moveSpeed 坦克的移动速度
 * @param direction 坦克的面向 0：上 ，1：右 ，2：下，3：左
 * @param imgSrc 坦克的图片路径
 */
var Tank = function (x,y,life,armor,attack,moveSpeed,direction,imgSrc){
    this.x = x || 0;
    this.y = y || 0;
    this.width = 58;
    this.height = 58;
    this.life = life || 10;
    this.armor = armor || 2;
    this.attack = attack || 5;
    this.moveSpeed = moveSpeed || 160;
    this.direction = direction || 0;
    this.attackSpeed = 320;
    this.attackReady = 0;
    this.img = new Image();
    this.img.src = imgSrc || "img/tank-up.png";
    this.isReady = false;
    var t = this;
    this.img.onload = function (){
        t.isReady = true;
    };
    this.shoot = function (callback){
        callback && callback();
    };
    this.move = function (callback){
        callback && callback();
    };
    this.destroy = function (callback){
        callback && callback();
    };
    this.render = function(ctx){
        if (this.isReady){
            ctx.drawImage(this.img,this.x,this.y,this.width+5,this.height+5);
        }
    }
};

var BackGround = function (x,y,imgSrc){
    this.x = x || 0;
    this.y = y || 0;
    this.width = 780;
    this.height = 600;
    this.img = new Image();
    this.isReady = false;
    var t = this;
    this.img.src = imgSrc || "img/ground.png";
    this.img.onload = function (){
        t.isReady = true;
    };
    this.render = function(ctx){
        if (this.isReady){
            ctx.drawImage(this.img,this.x,this.y,this.width,this.height);
        }
    }
};

var Bullet = function (tank,moveSpeed,imgSrc){
    if (!tank) {
        return;
    }
    this.tank = tank || null;
    this.width = 12;
    this.height = 12;
    this.x =  this.tank.x + (this.tank.width - this.width) / 2;
    this.y =  this.tank.y + (this.tank.height - this.height) / 2;
    this.attack = this.tank.attack || 5;
    this.moveSpeed = moveSpeed || 340;
    this.direction = this.tank.direction || 0;
    this.img = new Image();
    this.img.src = imgSrc || "img/bullet.png";
    this.isReady = false;
    var t = this;
    this.img.onload = function (){
        t.isReady = true;
    };
    this.move = function (callback){
        callback && callback();
    };
    this.destroy = function (callback){
        callback && callback();
    };
    this.onCollision = function (callback){
        callback && callback();
    };
    this.render = function(ctx){
        if (this.isReady){
            ctx.drawImage(this.img,this.x,this.y,this.width,this.height);
        }
    }
};

var Wall = function (x,y,width,height,life,imgSrc){
    this.x = x || 0;
    this.y = y || 0;
    this.width = width || 58;
    this.height = height || 58;
    this.life = life || 20;
    this.img = new Image();
    this.isReady = false;
    var t = this;
    this.img.src = imgSrc || "img/wall.png";
    this.img.onload = function (){
        t.isReady = true;
    };
    this.render = function(ctx){
        if (this.isReady){
            ctx.drawImage(this.img,this.x,this.y,this.width+5,this.height+5);
        }
    }
}

//对象模板 ↑↑↑↑

//工具函数 ↓↓↓↓
function random(min,max){
    var temp = max - min;
    var r = Math.random() * temp;
    return min + Math.floor(r);
}
function isPosInRange(pos,range){
    if (pos.x >= range.x && pos.x <= range.x + range.width && pos.y >= range.y && pos.y <= range.y + range.height){
        return true;
    }
    return false;
}
//是否碰撞
function isCollition(a1,a2){
    var p11 = {x:a1.x,y:a1.y};
    var p12 = {x:a1.x+a1.width,y:a1.y};
    var p21 = {x:a1.x,y:a1.y+a1.height};
    var p22 = {x:a1.x+a1.width,y:a1.y+a1.height};
    if (isPosInRange(p11,a2)){
        return true;
    }
    if (isPosInRange(p12,a2)){
        return true;
    }
    if(isPosInRange(p21,a2)){
        return true;
    }
    if(isPosInRange(p22,a2)){
        return true;
    }
    return false;
}

//工具函数 ↑↑↑↑

//地图数据 ↓↓↓↓
var wallQueue = [];//墙壁

function initWalls(){
    var wallCount = random(30,60);
    while(wallQueue.length < wallCount){
        var x = random(0,13);
        var y = random(0,13);
        if ((x==0 && y==0) || (x==12 && y==0) || (x==4 && y ==9)){
            continue;
        }
        var flag = false;
        for(var i = 0;i < wallQueue.length;i++){
            var tx = wallQueue[i].x/60;
            var ty = wallQueue[i].y/60;
            if (x == tx && y == ty){
                flag = true;
                break;
            }
        }
        if (flag){
            continue;
        }
        var wall = new Wall(x*60,y*60);
        wallQueue.push(wall);
    }
};

//地图数据 ↑↑↑↑

//全局变量区 ↓↓↓↓
var enemyQueue = []; //敌人数组
var enemyBulletQueue = [];
var playerBulletQueue = []; //玩家子弹数组
var player = null; //玩家坦克
var ground = null; //地面
var timer = null; //定时器
var context = null; //画布上下文
var perTick = 200; //
var tick = 1000 / perTick;  //计时器执行间隔
var keyDown = {};//按键记录
var moveKeys = [87,83,65,68];//移动按钮
var enemyTick = 10000;  //产生敌人的间隔
var enemyTime = 5000;      //敌人产生间隔计时
var gameOver = false;  // 游戏是否结束
var score = 0;

//全局变量区 ↑↑↑↑

//函数区 ↓↓↓↓
//生产敌人
function productAEnemy(range){

    var tank = new Tank(range.x,range.y);
    tank.direction = 2;
    tank.attackSpeed = 1000;
    tank.attackReady = 800;
    tank.img.src = "img/tank-down.png";
    tank.turnTime = 0;
    tank.autoRun = function (){
        this.turnTime += tick;
        if (this.turnTime >= 1500){
            this.turnTime = 0;
            var rate = random(0,100);
            //50%几率向下移动，20%几率左右移动，10%几率向上移动
            if (rate < 50){
                this.direction = 2;
                this.img.src = "img/tank-down.png";
            }else if ( rate >=50 && rate <60){
                this.direction = 0;
                this.img.src = "img/tank-up.png";
            }else if ( rate >=60 && rate <80){
                this.direction = 1;
                this.img.src = "img/tank-right.png";
            }else {
                this.direction = 3;
                this.img.src = "img/tank-left.png";
            }
        }
        this.move(function (){
            var distance = tank.moveSpeed / perTick;
            var tx = tank.x;
            var ty = tank.y;
            switch (tank.direction){
                case 0:{
                    ty -= distance;
                    break;
                }
                case 1:{
                    tx += distance;
                    break;
                }
                case 2:{
                    ty += distance;
                    break;
                }
                case 3:{
                    tx -= distance;
                    break;
                }
            }
            //判断前方是否可以通行
            if(tx < 0 || tx + tank.width > ground.width || ty < 0 || ty+tank.height > ground.height){
                return;
            }
            var canMove = true;
            var pos = {x:tx,y:ty,width:tank.width,height:tank.height};
            //判断是否会碰到墙壁
            if (wallQueue.length >0){
                for (var i = 0; i < wallQueue.length; i++){
                    var wall = wallQueue[i];
                    if (isCollition(pos,wall)){
                        canMove = false;
                        break;
                    }
                }
            }
            //是否碰到AI坦克
            if (canMove){
                for (var i = 0 ; i < enemyQueue.length ; i++){
                    var tar = enemyQueue[i];
                    if (tar != tank){
                        if(isCollition(pos,tar)){
                            canMove = false;
                            break;
                        }
                    }
                }
            }
            //是否碰到玩家
            if (canMove){
                if (isCollition(pos,player)){
                    canMove = false;
                }
            }
            if (canMove){
                tank.x = tx;
                tank.y = ty;
            }
        });

        this.attackReady += tick;
        if (this.attackReady >= this.attackSpeed){
            this.attackReady = this.attackSpeed + 10;
            var r = random(0,100);
            if(r < 50){
                this.shoot(function (){
                    tank.attackReady = 0;
                    var bullet = new Bullet(tank);
                    enemyBulletQueue.push(bullet);
                });
            }
        }
    };
    return tank;
}
function enemyFactory(){
    var range1 = {x:0,y:0,width:60,height:60};
    var range2 = {x:720,y:0,width:60,height:60}
    var range1HasEnemy = false;
    var range2HasEnemy = false;
    for (var i = 0; i < enemyQueue.length ; i++){
        if(isCollition(enemyQueue[i],range1)){
            range1HasEnemy = true;
        }
        if(isCollition(enemyQueue[i],range2)){
            range2HasEnemy = true;
        }
    }
    if(isCollition(player,range1)){
        range1HasEnemy = false;
    }
    if(isCollition(player,rangew)){
        range2HasEnemy = false;
    }
    if (!range1HasEnemy){
        var tank = productAEnemy(range1);
        enemyQueue.push(tank);
    }
    if (!range2HasEnemy){
        var tank = productAEnemy(range2);
        enemyQueue.push(tank);
    }
}
//初始化函数
function init (){
    ground = new BackGround();
    player = new Tank(240,540);
    initWalls();

    context.font = "italic 22px consoles";
    context.fillStyle = "#ddc";


    //监听键盘的按键事件
    addEventListener("keydown",function (event){
        if (moveKeys.indexOf(event.keyCode) >=0 ){
            keyDown.direction = event.keyCode;
        }
        if (32 == event.keyCode){
            keyDown.shoot = event.keyCode;
        }
    });
    addEventListener("keyup",function (event){
        if (moveKeys.indexOf(event.keyCode) >=0 ){
            delete keyDown.direction;
        }
        if (32 == event.keyCode){
            delete keyDown.shoot;
        }
    });
}
//渲染函数
function render() {
    if (ground.isReady){
        ground.render(context);
    }
    if(wallQueue.length > 0){
        for(var i = 0;i<wallQueue.length;i++){
            if (wallQueue[i].isReady){
                wallQueue[i].render(context);
            }
        }
    }
    if(player.isReady){
        player.render(context);
    }
    if (enemyQueue.length > 0){
        for (var i = 0; i < enemyQueue.length ; i++){
            if(enemyQueue[i].isReady){
                enemyQueue[i].render(context);
            }
        }
    }
    if(playerBulletQueue.length > 0){
        for(var i = 0; i < playerBulletQueue.length ; i++){
            if(playerBulletQueue[i].isReady){
                playerBulletQueue[i].render(context);
            }
        }
    }
    if (enemyBulletQueue.length > 0){
        for(var i = 0; i < enemyBulletQueue.length ; i++){
            if(enemyBulletQueue[i].isReady){
                enemyBulletQueue[i].render(context);
            }
        }
    }

    context.fillText("life:"+player.life,10,560);
    context.fillText("armor:"+player.armor,10,590);
    context.fillText("score:"+score,10,530);
};
//更新状态函数
function update(){
    if(gameOver){
        context.fillStyle = "#DC2626";
        context.font = "110px microsoft yahei";
        context.fillText("Game Over",100,300);
        return;
    }

    {
        //w
        if (87 == keyDown.direction){
            player.img.src = "img/tank-up.png";
            player.direction = 0;
        }
        //a
        if (65 == keyDown.direction){
            player.img.src = "img/tank-left.png";
            player.direction = 3;
        }
        //s
        if (83 == keyDown.direction){
            player.img.src = "img/tank-down.png";
            player.direction = 2;
        }
        //d
        if (68 == keyDown.direction){
            player.img.src = "img/tank-right.png";
            player.direction = 1;
        }
    }
    player.attackReady += tick;
    if(player.attackReady >= player.attackSpeed + 10){
        player.attackReady = player.attackSpeed + 10;
    }
    //spance
    if (32 == keyDown.shoot){
        if(player.attackReady >= player.attackSpeed){
            player.attackReady = 0;
            player.shoot(function (){
                var bullet = new Bullet(player);
                playerBulletQueue.push(bullet);
            });
        }
    }
    //玩家的移动
    player.move(function (){

        if(!keyDown.direction){
            return;
        }
        var distance = player.moveSpeed / perTick;
        var tx = player.x;
        var ty = player.y;
        switch (player.direction){
            case 0:{
                ty -= distance;
                break;
            }
            case 1:{
                tx += distance;
                break;
            }
            case 2:{
                ty += distance;
                break;
            }
            case 3:{
                tx -= distance;
                break;
            }
        }
        //判断前方是否可以通行
        if(tx < 0 || tx + player.width > ground.width || ty < 0 || ty+player.height > ground.height){
            return;
        }
        var canMove = true;
        var pos = {x:tx,y:ty,width:player.width,height:player.height};
        //判断是否会碰到墙壁
        if (wallQueue.length >0){
            for (var i = 0; i < wallQueue.length; i++){
                var wall = wallQueue[i];
                if (isCollition(pos,wall)){
                    canMove = false;
                }
            }
        }
        if(canMove){
            //是否碰到敌军
            for (var i = 0 ; i < enemyQueue.length ; i++){
                var e = enemyQueue[i];
                if (isCollition(pos,e)){
                    canMove = false;
                }
            }
        }
        if (canMove){
            player.x = tx;
            player.y = ty;
        }
    });
    //子弹的移动
    if (playerBulletQueue.length > 0){
        for(var i =0;i<playerBulletQueue.length;i++){
            var bullet = playerBulletQueue[i];
            bullet.move(function (){
                var distance = bullet.moveSpeed / perTick;
                var tx = bullet.x;
                var ty = bullet.y;
                switch (bullet.direction){
                    case 0:{
                        ty -= distance;
                        break;
                    }
                    case 1:{
                        tx += distance;
                        break;
                    }
                    case 2:{
                        ty += distance;
                        break;
                    }
                    case 3:{
                        tx -= distance;
                        break;
                    }
                }
                bullet.x = tx;
                bullet.y = ty;

                if(tx < -bullet.width || tx > bullet.width + ground.width || ty < -bullet.height || ty > bullet.height + ground.height){
                    bullet.destroy(function (){
                        var index = playerBulletQueue.indexOf(bullet);
                        playerBulletQueue.splice(index,1);
                        delete bullet;
                    });
                }
            });
        }
    }
    //敌人子弹的移动
    if (enemyBulletQueue.length > 0){
        for (var i = 0; i < enemyBulletQueue.length; i++){
            var bullet = enemyBulletQueue[i];
            bullet.move(function () {
                var distance = bullet.moveSpeed / perTick;
                var tx = bullet.x;
                var ty = bullet.y;
                switch (bullet.direction) {
                    case 0:
                    {
                        ty -= distance;
                        break;
                    }
                    case 1:
                    {
                        tx += distance;
                        break;
                    }
                    case 2:
                    {
                        ty += distance;
                        break;
                    }
                    case 3:
                    {
                        tx -= distance;
                        break;
                    }
                }
                bullet.x = tx;
                bullet.y = ty;

                if (tx < -bullet.width || tx > bullet.width + ground.width || ty < -bullet.height || ty > bullet.height + ground.height) {
                    bullet.destroy(function () {
                        var index = enemyBulletQueue.indexOf(bullet);
                        enemyBulletQueue.splice(index, 1);
                        delete bullet;
                    });
                }
            });
        }
    }

    //判断子弹的碰撞
    if(playerBulletQueue.length > 0){
        //先比较是否碰撞到墙壁
        if ( wallQueue.length > 0){
            for (var i = 0; i < playerBulletQueue.length ; i++){
                for(var j =0 ; j < wallQueue.length ; j++){
                    var bullet = playerBulletQueue[i];
                    if(!bullet) {
                        break;
                    }
                    var wall = wallQueue[j];
                    if(isCollition(bullet,wall)){
                        wall.life -= bullet.attack;
                        bullet.destroy(function (){
                            var index = playerBulletQueue.indexOf(bullet);
                            playerBulletQueue.splice(index,1);
                            i--;
                            delete bullet;
                        });
                        if(wall.life <= 0){
                            var index = wallQueue.indexOf(wall);
                            wallQueue.splice(index,1);
                            delete wall;
                            j--;
                        }

                    }
                }
            }
        }
        //判断子弹碰到敌人
        if (enemyQueue.length > 0){
            for (var i = 0; i < playerBulletQueue.length;i++){
                for (var j = 0 ; j < enemyQueue.length ; j++){
                    var bullet = playerBulletQueue[i];
                    var enmey = enemyQueue[j];
                    if(isCollition(bullet,enmey)){
                        enmey.life -= (bullet.attack - enmey.armor);
                        bullet.destroy(function (){
                            var index = playerBulletQueue.indexOf(bullet);
                            playerBulletQueue.splice(index,1);
                            i--;
                            delete bullet;
                        });
                        if (enmey.life <= 0){
                            var index = enemyQueue.indexOf(enmey);
                            enemyQueue.splice(index,1);
                            delete enmey;
                            score++;
                        }
                    }
                }
            }
        }
        //判断子弹碰到敌人的子弹
        if (enemyBulletQueue.length> 0){
            for (var i = 0; i< playerBulletQueue.length; i++){
                for (var j = 0; j < enemyBulletQueue.length; j++){
                    var bp = playerBulletQueue[i];
                    var be = enemyBulletQueue[j];
                    if (isCollition(bp,be)){
                        var index = playerBulletQueue.indexOf(bp);
                        playerBulletQueue.splice(index,1);
                        i--;
                        delete bp;
                        index = enemyBulletQueue.indexOf(be);
                        enemyBulletQueue.splice(be);
                        j--;
                        delete bp;
                    }
                }
            }
        }
    }

    //判断敌人的子弹碰撞
    if (enemyBulletQueue.length > 0){
        //撞墙
        if (wallQueue.length > 0){
            for (var i = 0; i < enemyBulletQueue.length; i++ ){
                for(var j = 0; j < wallQueue.length; j++){
                    var bullet = enemyBulletQueue[i];
                    var wall = wallQueue[j];
                    if(isCollition(bullet,wall)){
                        wall.life -= bullet.attack;
                        var index = enemyBulletQueue.indexOf(bullet);
                        enemyBulletQueue.splice(index,1);
                        i--;
                        delete bullet;
                        if (wall.life <=0){
                            var index = wallQueue.indexOf(wall);
                            wallQueue.splice(index,1);
                            j--;
                            delete wall;
                        }
                    }
                }
            }
        }

        //撞到玩家
        for (var i = 0; i < enemyBulletQueue.length; i++){
            var bullet = enemyBulletQueue[i];
            if(isCollition(bullet,player)){
                var index = enemyBulletQueue.indexOf(bullet);
                enemyBulletQueue.splice(index,1);
                i--;
                player.life -= bullet.attack - player.armor;
                delete bullet;
                if (player.life <=0){
                //    游戏结束
                    gameOver = true;
                }
            }
        }
    }

    //产生敌军
    enemyTime += tick;
    if (enemyTime >= enemyTick){
        enemyFactory();
        enemyTime = 0;
    }
    //运行敌军AI
    if(enemyQueue.length > 0){
        for(var i = 0; i < enemyQueue.length ; i++){
            enemyQueue[i].autoRun();
        }
    }

    render();
};
//执行函数
function main(){
    init();
    timer = setInterval(update,tick);
};


//函数区 ↑↑↑↑

window.onload = function (){

    var container = document.querySelector(".container");
    var canvas = document.createElement("canvas");
    canvas.width = 780;
    canvas.height = 600;
    container.appendChild(canvas);

    context = canvas.getContext("2d");
    main();
};
