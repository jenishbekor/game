/*
var canvas = document.getElementById("gamespace");
var context = canvas.getContext("2d");
*/

score = 0, gscore = 0, nghost=10, restart=true;

var player = {
	x:50,
	y:50,
	pacmouth:352,
	pacdir:0,
	psize:32,
	speed:5
};

var enemies =[];

for(let i=0; i<nghost; i++){
	let enemy = {
		x: 150,
		y: 50,
		ghostNum : 0,
		actNum : 0,
		size:32,
		moving: 1,
		dirx: 0,
		diry: 0,
		speed: 5,
		flash: 0,
		countblink: 10,
		active: true
	};

	enemies.push(enemy);
}

var powerdot = {
	x: 150,
	y: 50,
	powerup: false,
	pcountdown: 0,
	ghostNum : 0,
	ghosteat: false
};

var canvas = document.createElement("canvas");
var context = canvas.getContext("2d");
canvas.width = 600;
canvas.height = 400;
document.body.appendChild(canvas);

context.fillText("Starting", 10, 10);

mainImage = new Image();
mainImage.ready = false;
mainImage.onload = checkReady;
mainImage.src = "pac.png";

var keyclick = {};
document.addEventListener("keydown", function(event){
	keyclick[event.keyCode]=true;
	//console.log(keyclick);
	move(keyclick);
}, false); 

document.addEventListener("keyup", function(event){
	delete keyclick[event.keyCode];
}, false); 


function move(keyclick){

	if( (37 in keyclick) || (65 in keyclick)){
		player.x -= player.speed;
		player.pacdir = 64;
	}
	if((39 in keyclick) || (68 in keyclick)){
		player.x += player.speed;
		player.pacdir = 0;
	}
	if((38 in keyclick) || (87 in keyclick)){
		player.y -= player.speed;
		player.pacdir = 96;
	}
	if((40 in keyclick) || (83 in keyclick)){
		player.y += player.speed;
		player.pacdir = 32;
	}

	if( player.x >= canvas.width - player.psize) { player.x=0; }
	if( player.x <0 ) { player.x=canvas.width-player.psize; }
	if( player.y >= canvas.height - player.psize) { player.y=0; }
	if( player.y <0 ) { player.y=canvas.height-player.psize; }

	if( player.pacmouth == 320) {player.pacmouth=352;} else {player.pacmouth=320;}


	render();
}

function checkReady(){
	this.ready = true;
	playgame();
}

function playgame(){
	render();
	requestAnimationFrame(playgame);
}

function myNum(n){
	return Math.floor(Math.random()*n);
}

function render(){
	context.fillStyle = "white";
	context.fillRect(0,0, canvas.width, canvas.height);

	if(!powerdot.powerup && powerdot.pcountdown<5){
		powerdot.x = myNum(canvas.width-64)+32;
		powerdot.y = myNum(canvas.height-64)+32;
		powerdot.powerup = true;
	}

	if(restart){
		for(let enemy of enemies){
			enemy.ghostNum = myNum(5) * 64;
			enemy.actNum = enemy.ghostNum;
			enemy.x = myNum(canvas.width-enemy.size);
			enemy.y = myNum(canvas.height-enemy.size);
		}
		powerdot.ghosteat=false;
		powerdot.pcountdown=0;

		player.speed=5;
		player.x=50;
		player.y=50;
		
		restart=false;
	}

	for(let enemy of enemies){
		if(enemy.active){
			if(enemy.moving<0){
				enemy.moving = myNum(10)*3 + 10 + myNum(1);
				enemy.speed = myNum(3);
				enemy.dirx = 0;
				enemy.diry = 0; 

				if(powerdot.ghosteat){ enemy.speed = enemy.speed*-1;}

				if(enemy.moving%2){
					if(player.x < enemy.x){enemy.dirx = -enemy.speed;} else {enemy.dirx = enemy.speed;}
				}
				else{
					if(player.y < enemy.y){enemy.diry = -enemy.speed;} else {enemy.diry = enemy.speed;}
				}

			}
			enemy.moving--;
			enemy.x = enemy.x + enemy.dirx;
			enemy.y = enemy.y + enemy.diry;

			if( enemy.x >= canvas.width - enemy.size) { enemy.x=0; }
			if( enemy.x <0 ) { enemy.x=canvas.width-enemy.size; }
			if( enemy.y >= canvas.height - enemy.size) { enemy.y=0; }
			if( enemy.y <0 ) { enemy.y=canvas.height-enemy.size; }


			//enemy collusion detection
			if( Math.abs(player.x-enemy.x)<=10 
				&& Math.abs(player.y-enemy.y)<=10 ){
				console.log("ghost");

				if(powerdot.ghosteat){ 
					score++; 
					enemy.active = false;
				} else{ gscore++; restart=true; }

				
				
			}

			if(enemy.countblink>0){
				enemy.countblink--;
			}
			else{
				if(enemy.flash == 0){ enemy.flash=32;} else { enemy.flash=0;}
				enemy.countblink=myNum(10)+10;
			}
		}
	}
	

	if(powerdot.ghosteat){
		powerdot.pcountdown--;
		if(powerdot.pcountdown<=0){
			powerdot.ghosteat=false;
			for(let enemy of enemies){
				enemy.ghostNum = enemy.actNum;	
			}
			player.speed=5;
		}
	}

	//powerdot collusion detection
	if(powerdot.powerup 
		&& Math.abs(player.x+16-powerdot.x)<=5 
		&& Math.abs(player.y+16 - powerdot.y)<=5 ){
		//console.log("hit");
		powerdot.powerup=false;
		powerdot.pcountdown = 500;

		for(let enemy of enemies){
			enemy.ghostNum = 384;
		}
		powerdot.x=0;
		powerdot.y=0;
		powerdot.ghosteat = true;
		player.speed=10;
	}


	if(powerdot.powerup){
		context.fillStyle = "green";
		context.beginPath();
		context.arc(powerdot.x, powerdot.y, 10, 0, Math.PI*2, true);
		context.closePath();
		context.fill();
	}

	context.font = "20px verdana";
	context.fillStyle = "black";
	context.fillText("Pacman: " + score + " vs Ghost: "+ gscore, 10, 20);
	if(powerdot.pcountdown>0)
		context.fillText(" Timer: "+powerdot.pcountdown, 200, 20);

	for(let enemy of enemies){
		if(enemy.active){
			context.drawImage(mainImage, enemy.ghostNum, enemy.flash, 32, 32, enemy.x, enemy.y, 32,32);
		}
	}
	context.drawImage(mainImage, player.pacmouth, player.pacdir, 32, 32, player.x, player.y, 32,32);


}