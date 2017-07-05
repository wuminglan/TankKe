//对象模板 ↓↓↓↓
//坦克
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
//背景
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
//子弹
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
    this.moveSpeed = moveSpeed || this.tank.moveSpeed * 1.5;
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
//墙壁
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

// 获取随机数
function random(min,max){
    var temp = max - min;
    var r = Math.random() * temp;
    return min + Math.floor(r);
}
// 判断点是否位于区域之内
function isPosInRange(pos,range){
    if (pos.x >= range.x && pos.x <= range.x + range.width && pos.y >= range.y && pos.y <= range.y + range.height){
        return true;
    }
    return false;
}
//是否碰撞，小的区域要写在大的区域前面
function isCollition(a1,a2){
    if (!a1 || !a2){
        return false;
    }
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

//全局变量区 ↓↓↓↓
var player = null; //玩家坦克
var ground = null; //地面
var timer = null; //控制游戏进程的定时器
var context = null; //画布上下文
var keyDown = {};//按键记录
var score = 0;
var gameConfig = {};
var gameMgr = {};
//全局变量区 ↑↑↑↑

//函数区 ↓↓↓↓

//渲染函数
function render() {
    if (ground.isReady){
        ground.render(context);
    }
    if(gameMgr.wallQueue.length > 0){
        for(var i = 0;i<gameMgr.wallQueue.length;i++){
            if (gameMgr.wallQueue[i].isReady){
                gameMgr.wallQueue[i].render(context);
            }
        }
    }
    if(player.isReady){
        player.render(context);
    }
    if (gameMgr.enemyQueue.length > 0){
        for (var i = 0; i < gameMgr.enemyQueue.length ; i++){
            if(gameMgr.enemyQueue[i].isReady){
                gameMgr.enemyQueue[i].render(context);
            }
        }
    }
    if(gameMgr.playerBulletQueue.length > 0){
        for(var i = 0; i < gameMgr.playerBulletQueue.length ; i++){
            if(gameMgr.playerBulletQueue[i].isReady){
                gameMgr.playerBulletQueue[i].render(context);
            }
        }
    }
    if (gameMgr.enemyBulletQueue.length > 0){
        for(var i = 0; i < gameMgr.enemyBulletQueue.length ; i++){
            if(gameMgr.enemyBulletQueue[i].isReady){
                gameMgr.enemyBulletQueue[i].render(context);
            }
        }
    }
    // 最后渲染文字信息
    context.fillText("moveSpeed:"+player.moveSpeed,10,590);
    var at = String(1000/player.attackSpeed).substring(0,4);
    context.fillText("attackSpeed:"+at,10,570);
    context.fillText("armor:"+player.armor,10,550);
    context.fillText("life:"+player.life,10,530);
    context.fillText("attack:"+player.attack,10,510);
    context.fillText("score:"+score,10,490);
};

// 游戏按键按下
function GameKeyDown(){
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
// 玩家设计
function PlayerShoot(){
        player.attackReady += gameConfig.tick;
        if(player.attackReady >= player.attackSpeed + 10){
            player.attackReady = player.attackSpeed + 10;
        }
        //spance
        if (32 == keyDown.shoot){
            if(player.attackReady >= player.attackSpeed){
                player.attackReady = 0;
                player.shoot(function (){
                    var bullet = new Bullet(player);
                    gameMgr.playerBulletQueue.push(bullet);
                });
            }
        }
}
//玩家的移动
function PlayerMove(){
    player.move(function (){
        if(!keyDown.direction){
            return;
        }
        var distance = player.moveSpeed / gameConfig.perTick;
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
        if (gameMgr.wallQueue.length >0){
            for (var i = 0; i < gameMgr.wallQueue.length; i++){
                var wall = gameMgr.wallQueue[i];
                if (isCollition(pos,wall)){
                    canMove = false;
                }
            }
        }
        if(canMove){
            //是否碰到敌军
            for (var i = 0 ; i < gameMgr.enemyQueue.length ; i++){
                var e = gameMgr.enemyQueue[i];
                if (isCollition(pos,e)){
                    canMove = false;
                    break;
                }
            }
        }
        if (canMove){
            player.x = tx;
            player.y = ty;
        }
    });
}
//玩家子弹移动
function PlayerBulletsMove(){
    if (gameMgr.playerBulletQueue.length > 0){
        for(var i =0;i<gameMgr.playerBulletQueue.length;i++){
            var bullet = gameMgr.playerBulletQueue[i];
            bullet.move(function (){
                var distance = bullet.moveSpeed / gameConfig.perTick;
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
                        var index = gameMgr.playerBulletQueue.indexOf(bullet);
                        gameMgr.playerBulletQueue.splice(index,1);
                        delete bullet;
                    });
                }
            });
        }
    }
}
// 敌人子弹移动
function EnemyBulletsMove(){
    if (gameMgr.enemyBulletQueue.length > 0){
        for (var i = 0; i < gameMgr.enemyBulletQueue.length; i++){
            var bullet = gameMgr.enemyBulletQueue[i];
            bullet.move(function () {
                var distance = bullet.moveSpeed / gameConfig.perTick;
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
                        var index = gameMgr.enemyBulletQueue.indexOf(bullet);
                        gameMgr.enemyBulletQueue.splice(index, 1);
                        delete bullet;
                    });
                }
            });
        }
    }
}
// 玩家子弹碰撞
function PlayerBulletsOnCollision(){
    if(gameMgr.playerBulletQueue.length > 0){
        //先比较是否碰撞到墙壁
        if ( gameMgr.wallQueue.length > 0){
            for (var i = 0; i < gameMgr.playerBulletQueue.length ; i++){
                for(var j =0 ; j < gameMgr.wallQueue.length ; j++){
                    var bullet = gameMgr.playerBulletQueue[i];
                    if(!bullet) {
                        break;
                    }
                    var wall = gameMgr.wallQueue[j];
                    if(isCollition(bullet,wall)){
                        wall.life -= bullet.attack;
                        bullet.destroy(function (){
                            var index = gameMgr.playerBulletQueue.indexOf(bullet);
                            gameMgr.playerBulletQueue.splice(index,1);
                            i--;
                            delete bullet;
                        });
                        if(wall.life <= 0){
                            var index = gameMgr.wallQueue.indexOf(wall);
                            gameMgr.wallQueue.splice(index,1);
                            delete wall;
                            j--;
                        }

                    }
                }
            }
        }
        //判断子弹碰到敌人
        if (gameMgr.enemyQueue.length > 0){
            for (var i = 0; i < gameMgr.playerBulletQueue.length;i++){
                for (var j = 0 ; j < gameMgr.enemyQueue.length ; j++){
                    var bullet = gameMgr.playerBulletQueue[i];
                    var enmey = gameMgr.enemyQueue[j];
                    if(isCollition(bullet,enmey)){
                        var rel = bullet.attack - enmey.armor;
                        console.log(rel);
                        enmey.life -= (rel < 0 ? 0 : rel);
                        bullet.destroy(function (){
                            var index = gameMgr.playerBulletQueue.indexOf(bullet);
                            gameMgr.playerBulletQueue.splice(index,1);
                            i--;
                            delete bullet;
                        });
                        if (enmey.life <= 0){
                            var index = gameMgr.enemyQueue.indexOf(enmey);
                            gameMgr.enemyQueue.splice(index,1);
                            delete enmey;
                            score++;
                        }
                    }
                }
            }
        }
        //判断子弹碰到敌人的子弹
        if (gameMgr.enemyBulletQueue.length> 0){
            for (var i = 0; i< gameMgr.playerBulletQueue.length; i++){
                for (var j = 0; j <gameMgr.enemyBulletQueue.length; j++){
                    var bp = gameMgr.playerBulletQueue[i];
                    var be = gameMgr.enemyBulletQueue[j];
                    if (isCollition(bp,be)){
                        var index = gameMgr.playerBulletQueue.indexOf(bp);
                        gameMgr.playerBulletQueue.splice(index,1);
                        i--;
                        delete bp;
                        index = gameMgr.enemyBulletQueue.indexOf(be);
                        gameMgr.enemyBulletQueue.splice(be);
                        j--;
                        delete bp;
                    }
                }
            }
        }
    }
}
// 敌人子弹的碰撞
function EnemyBulletsOnCollision(){
    if (gameMgr.enemyBulletQueue.length > 0){
        //撞墙
        if (gameMgr.wallQueue.length > 0){
            for (var i = 0; i < gameMgr.enemyBulletQueue.length; i++ ){
                for(var j = 0; j < gameMgr.wallQueue.length; j++){
                    var bullet = gameMgr.enemyBulletQueue[i];
                    var wall = gameMgr.wallQueue[j];
                    if(isCollition(bullet,wall)){
                        wall.life -= bullet.attack;
                        var index = gameMgr.enemyBulletQueue.indexOf(bullet);
                        gameMgr.enemyBulletQueue.splice(index,1);
                        i--;
                        delete bullet;
                        if (wall.life <=0){
                            var index = gameMgr.wallQueue.indexOf(wall);
                            gameMgr.wallQueue.splice(index,1);
                            j--;
                            delete wall;
                        }
                    }
                }
            }
        }

        //撞到玩家
        for (var i = 0; i < gameMgr.enemyBulletQueue.length; i++){
            var bullet = gameMgr.enemyBulletQueue[i];
            if(isCollition(bullet,player)){
                var index = gameMgr.enemyBulletQueue.indexOf(bullet);
                gameMgr.enemyBulletQueue.splice(index,1);
                i--;
                var rel = bullet.attack - player.armor;
                console.log(rel);
                player.life -= (rel < 0 ? 0 : rel);
                delete bullet;
                if (player.life <=0){
                //    游戏结束
                    gameConfig.isPlaying = false;
                }
            }
        }
    }
}
//随机初始化墙壁
function initWalls(queue){
    var wallCount = random(30,60);
    while(queue.length < wallCount){
        var x = random(0,13);
        var y = random(0,13);
        if ((x==0 && y==0) || (x==12 && y==0) || (x==4 && y ==9)){
            continue;
        }
        var flag = false;
        for(var i = 0;i < queue.length;i++){
            var tx = queue[i].x/60;
            var ty = queue[i].y/60;
            if (x == tx && y == ty){
                flag = true;
                break;
            }
        }
        if (flag){
            continue;
        }
        var wall = new Wall(x*60,y*60);
        queue.push(wall);
    }
};
//生产敌人
function productAEnemy(range){

    var tank = new Tank(range.x,range.y);
    tank.direction = 2;
    tank.attackSpeed = 1000;
    tank.attackReady = 800;
    tank.img.src = "img/tank-down.png";
    tank.turnTime = 0;
    tank.autoRun = function (){
        this.turnTime += gameConfig.tick;
        if (this.turnTime >= 1500){
            this.turnTime = 0;
            var rate = random(0,100);
            //40%几率向下移动，25%几率左右移动，10%几率向上移动
            if (rate < 40){
                this.direction = 2;
                this.img.src = "img/tank-down.png";
        }else if ( rate >=40 && rate <50){
                this.direction = 0;
                this.img.src = "img/tank-up.png";
        }else if ( rate >=50 && rate <75){
                this.direction = 1;
                this.img.src = "img/tank-right.png";
            }else {
                this.direction = 3;
                this.img.src = "img/tank-left.png";
            }
        }
        this.move(function (){
            var distance = tank.moveSpeed / gameConfig.perTick;
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
            if (gameMgr.wallQueue.length >0){
                for (var i = 0; i < gameMgr.wallQueue.length; i++){
                    var wall = gameMgr.wallQueue[i];
                    if (isCollition(pos,wall)){
                        canMove = false;
                        break;
                    }
                }
            }
            //是否碰到AI坦克
            if (canMove){
                for (var i = 0 ; i < gameMgr.enemyQueue.length ; i++){
                    var tar = gameMgr.enemyQueue[i];
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
        //控制攻击
        this.attackReady += gameConfig.tick;
        if (this.attackReady >= this.attackSpeed){
            this.attackReady = this.attackSpeed + 10;
            var r = random(0,100);
        //     每次只有50%的攻击几率
            if(r < 50){
                this.shoot(function (){
                    tank.attackReady = 0;
                    var bullet = new Bullet(tank);
                    gameMgr.enemyBulletQueue.push(bullet);
                });
            }
        }
    };
    return tank;
}
// 生产敌人的函数
function enemyFactory(queue){
        // 第一个出生点
    var range1 = {x:0,y:0,width:60,height:60};
    // 第二个出生点
    var range2 = {x:720,y:0,width:60,height:60}
    var range1HasEnemy = false;
    var range2HasEnemy = false;
    for (var i = 0; i < queue.length ; i++){
        if(isCollition(queue[i],range1)){
            range1HasEnemy = true;
        }
        if(isCollition(queue[i],range2)){
            range2HasEnemy = true;
        }
    }
    if(isCollition(player,range1)){
        range1HasEnemy = false;
    }
    if(isCollition(player,range2)){
        range2HasEnemy = false;
    }
    // 当可以生产的时候生产图片
    if (!range1HasEnemy){
        var tank = productAEnemy(range1);
        queue.push(tank);
    }
    if (!range2HasEnemy){
        var tank = productAEnemy(range2);
        queue.push(tank);
    }
}
//自动产生敌军
function AutoSpawnEnemy(){
    gameConfig.enemyTime += gameConfig.tick;
    if (gameConfig.enemyTime >= gameConfig.enemyTick){
        enemyFactory(gameMgr.enemyQueue);
        gameConfig.enemyTime = 0;
    }
}

//敌军AI
function EnemyAutoRun(){
    if(gameMgr.enemyQueue.length > 0){
        for(var i = 0; i < gameMgr.enemyQueue.length ; i++){
            gameMgr.enemyQueue[i].autoRun();
        }
    }
}

//初始化函数
function init (){
    gameConfig.perTick = 200; //计时器执行间隔因数
    gameConfig.tick = 1000/gameConfig.perTick; //计时器执行间隔
    gameConfig.enemyTick = 10000;   //生产敌人坦克的时间间隔
    gameConfig.enemyTime = 5000;    //敌人生产计时
    gameConfig.isPlaying = true;    //是否在进行游戏
    gameConfig.moveKeys = [87,83,65,68];  //游戏中的移动按键

    gameMgr.wallQueue = []; //地图墙壁
    gameMgr.enemyQueue = []; //敌人数组
    gameMgr.enemyBulletQueue = []; //敌人子弹数组
    gameMgr.playerBulletQueue = []; //玩家子弹数组

    // 初始化数据
    ground = new BackGround();
    player = new Tank(240,540);
    initWalls(gameMgr.wallQueue);
    context.font = "italic 18px consoles";
    context.fillStyle = "rgb(187,240,20)";
    //监听键盘的按键事件
    addEventListener("keydown",function (event){
        if (gameConfig.moveKeys.indexOf(event.keyCode) >=0 ){
            keyDown.direction = event.keyCode;
        }
        if (32 == event.keyCode){
            keyDown.shoot = event.keyCode;
        }
    });
    addEventListener("keyup",function (event){
        if (gameConfig.moveKeys.indexOf(event.keyCode) >=0 ){
            delete keyDown.direction;
        }
        if (32 == event.keyCode){
            delete keyDown.shoot;
        }
    });
}

//更新状态函数
function update(){
    if(!gameConfig.isPlaying){
        //     当游戏结束时渲染游戏结束的文字
        context.fillStyle = "#DC2626";
        context.font = "110px microsoft yahei";
        context.fillText("Game Over",100,300);
        return;
    }

    GameKeyDown();
    PlayerShoot();
    PlayerMove();
    PlayerBulletsMove();
    EnemyBulletsMove();
    PlayerBulletsOnCollision();
    EnemyBulletsOnCollision();
    AutoSpawnEnemy();
    EnemyAutoRun();

    render();
};
//执行函数
function main(){
    init();
    timer = setInterval(update,gameConfig.tick);
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

    // 作弊函数
    addEventListener("keydown",function (e){
        if(e.keyCode ==  27){
            var tar = document.querySelector(".btns");
            var statu = tar.style.display;
            if (statu == "none"){
                statu = "block";
            }else {
                statu = "none";
            }
            tar.style.display = statu;
        }
    });
    test();
};

function test(){
    document.querySelector(".redatk").addEventListener("click",function (){
        player.attack -=3;
    });
    document.querySelector(".addatk").addEventListener("click",function (){
        player.attack +=3;
    });
    document.querySelector(".redatksp").addEventListener("click",function (){
        player.attackSpeed +=20;
    });
    document.querySelector(".addatksp").addEventListener("click",function (){
        player.attackSpeed -=20;
    });
    document.querySelector(".redarmor").addEventListener("click",function (){
        player.armor -=2;
    });
    document.querySelector(".addarmor").addEventListener("click",function (){
        player.armor +=2;
    });
    document.querySelector(".redms").addEventListener("click",function (){
        player.moveSpeed -=20;
    });
    document.querySelector(".addms").addEventListener("click",function (){
        player.moveSpeed +=20;
    });
    document.querySelector(".reset").addEventListener("click",function (){
        player.attack = 5;
        player.armor = 2;
        player.moveSpeed = 160;
        player.attackSpeed = 320;
    });
}
