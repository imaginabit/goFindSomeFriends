var pub;
var time;
var loaded;
var score=0;

window.onload = function () {
	ancho= 16;
	alto = 16;
	celres= 32;
	altomundo=30
	anchomundo=30;
	w= celres*ancho;
	h=celres*alto
    Crafty.init(w, h);
    //Crafty.canvas.init();

    Crafty.sprite(celres, "sprites.png", {
        player: [0, 0],
        mood0: [5, 0],
        mood1: [6, 0],
        mood3: [7, 0],
        mood4: [8, 0],
        suelo0: [0, 1],
        suelo1: [1, 1],
        suelo2: [2, 1],
        bar: [0,2],
        pelo1: [0,3],
        pelo2: [1,3],
        pelo3: [2,3],
        pelo4: [3,3],
        ropa1: [0,4],
        ropa2: [1,4],
        ropa3: [2,4],
        ropa4: [3,4],
        friend: [3,0]
    });

   	//preload all assets
   	/*
	Crafty.load(["sprites.png","add.wav","del.wav"], function() {
		console.log("loaded");
	});
	*/

	auNew = Crafty.audio.add("auNewFriend", "add.wav");
    auDel = Crafty.audio.add("auDelFriend", "del.wav");

	Crafty.load(["sprites.png,add.wav,del.wav"], function () {
		console.log("sprites loaded");
		loaded=true;
	});


	Crafty.scene("loading", function (){
		console.log("in loading");
		var time = Date.now();
		var loaded=false;

		Crafty.background("#000");
		Crafty.e("2D, DOM, Text").attr({ w: 100, h: 20, x: 400-50, y: 470 })
				.text("Presents")
				.css({ "text-align": "center" });

		Crafty.e("2D, DOM, Image").image("logo.png")
		.attr({w:256,h:256,x:400-128,y:celres});

		change=false;

		Crafty.bind("EnterFrame", function(){
			if (loaded==true && time+2000<Date.now() && !change){
				console.log(time);
				change= true;
				Crafty.scene("game");
			}
		});
	});

	Crafty.scene("main",function(){
		time = Date.now();
		Crafty.background("#000");
		i=0;
		Crafty.bind("EnterFrame", function(){
			if ( time+500<Date.now()){
				d=Math.floor(i/10);
				e = i%10;
				Crafty.background("#"+d+e+d+e+d+e);
				console.log("in"+ (time-Date.now()) + "#"+d+e+d+e+d+e +" i:"+i  );
				i++;
				if (i==100)i=0;
				time = Date.now();
			}
		});
		//Crafty.scene("main");
	});

	function generateWorld() {
		//tamaño del mapa
		var alto= altomundo;
		var ancho= anchomundo;
		for (var i = 0; i<ancho; i++) {
		    for (var j = 0; j < alto; j++) {
		        sType = Crafty.randRange(1, 2);

		        Crafty.e("2D, DOM, suelo" + sType)
		            .attr({ x: i * celres, y: j * celres, z:1, alpha: 0.2 })
		            ;
		        if (Crafty.randRange(0,100)<5)
		        	Crafty.e("2D, DOM, solid, suelo" + sType)
					.attr({ x: i * celres, y: j * celres,  z:2});

            	if(i === 0 || i === ancho-1 || j === 0 || j === alto-1)
					Crafty.e("2D, DOM, solid, suelo1")
					.attr({ x: i * celres, y: j * celres,  z:2});

			}
	   	}
	}

	function generateFriends(num){
		for( var i=0;i<num;i++){
			at= {
				x: celres*Crafty.randRange(1,anchomundo-2),
				y: celres*Crafty.randRange(1,altomundo-2),
				z: 2+i,
				_flipX :Crafty.randRange(0,1)
				}
			Crafty.e("2D,DOM, friend, friendA,Collision" )
				.attr(at)
				.collision([-8,-8],[40,-8],[-8,40],[40,40]);
		}
	}

	Crafty.c("friendA",{
		init: function(){
			ropa = Crafty.randRange(1,4);
			pelo = Crafty.randRange(1,4);
			var at = { x: this.x, y: this.y,z: this.z+1,
					   _flipX: this._flipX };
			this.pelo= Crafty.e("2D,DOM,pelo"+ pelo).attr(at);
			this.ropa= Crafty.e("2D,DOM,ropa"+ ropa).attr(at);

			this.isfollow = false;

			this.bind("Change",function(){
				this.pelo.x = this.x;
				this.pelo.y = this.y;
				this.pelo.z = this.z+1;
				this.ropa.x = this.x;
				this.ropa.y = this.y;
				this.ropa.z = this.z+1;
				this.ropa._flipX = this.pelo._flipX = this._flipX;
			});

            return this;
		},
		follow: function(obj){
			var time = Date.now();
			if (!this.isFollow){
				this.isFollow=true;
				obj.friends+=1;
				obj.mood_up();
				this.bind("EnterFrame",function(){
					if (time+100<Date.now()){
						var from= {x:0,y:0};
						from.x = this.x;
						from.y = this.y

						velocidad= Crafty.randRange(1,4);
						if( this.x+celres-obj.x<0 ){
						 this.x+=velocidad;
						 this._flipX = false;
					 	}
						if( this.x-celres-obj.x>0 ){
						 this.x-=velocidad;
						 this._flipX = true;
					 	}
						if( this.y+celres-obj.y<0 ) this.y+=velocidad;
						if( this.y-celres-obj.y>0 ) this.y-=velocidad;
						a = Crafty.randRange(0,1000);
						//if (a<100)obj.mood_up(1);
						if (a<1)obj.mood_up(2);//3

						//distancia entre vectores
						dist = Math.floor(Math.sqrt(Math.pow(this.x-obj.x,2)+Math.pow(this.y-obj.y,2)));
						if (dist>celres*10){
							this.unbind("EnterFrame");
							obj.friends-=1;
							obj.mood_down();
							this.isFollow=false;
							//console.log("unbind "+dist+" friends "+obj.friends);
						}

						if(this.hit('solid')){
					        this.attr({x: from.x, y:from.y});
					    }

						time = Date.now();
					}
				});
			}
		}
	});



    Crafty.scene("game",function(){

	    Crafty.background("#000");
	    //initialplayer_x=ancho*celres/2-16;
	    //initialplayer_y=alto*celres/4*3-16;
	    initialplayer_x = Math.round(anchomundo*celres/2);
	    initialplayer_y = Math.round(altomundo*celres/2);
    	var player= Crafty.e("2D, DOM, player, Ape, RightControls, Collision, mood, moodFace")
    		.attr({
    			x: initialplayer_x,
    			y: initialplayer_y ,
    			w: celres,
    			h: celres,
    			z:1000
    		})
    		.rightControls(1).Ape()
			.onHit("friend", function(f) {
				//friend start follow player
				//f.obj.folow(this);
				fri=f[0].obj;
				fri.follow(this);
			})
			;
		barra_initial={x: ancho*celres-celres*4-10, y:9, w: celres*4,h: 16, z:100};

		var helptext_ini= { w: ancho*celres, h: celres, x: 0, y: (alto-1)*celres, z:100 };

		var helptext= Crafty.e("2D, DOM, Text")
				.attr(helptext_ini)
				.text("go find some friends")
				.css({ "text-align": "center",
						"text-shadow": "-1px 0 black, 0 1px black, 1px 0 black, 0 -1px black"
				});
		/*
		var friendsTxt= Crafty.e("2D, DOM, Text")
				.attr( {w: celres, h:celres, x:0,y:0, z: 100})
				.text("0")
				.css({ "text-align": "center",
						"text-shadow": "-1px 0 black, 0 1px black, 1px 0 black, 0 -1px black"
				});
		*/
		generateFriends(10);
		generateWorld();

		var vpx = 0;
		var vpy = 0;
		var text_instruction=0;
		var texts= new Array("go find some friends", "fell really sad",
							"im so empty" , "im my best friend", "sob sob sob" );
		var txtAnsiedad= new Array("too many people", "I think is time to go home",
							"can you, please, leave me alone" , "go away!", "a lot of noise" );


		var time= Date.now();
		var j = 0;
		Crafty.bind("EnterFrame",function(){
			Crafty.viewport.x=  -player.x+(ancho*celres)/2;
			player.barra.x= barra_initial.x -Crafty.viewport.x;
			player.status.x= barra_initial.x -Crafty.viewport.x;
			helptext.x= helptext_ini.x-Crafty.viewport.x;

			//friendsTxt.x = -Crafty.viewport.x
			//friendsTxt.y = -Crafty.viewport.y //?

			Crafty.viewport.y = -player.y+(alto*celres)/2;
			player.barra.y= barra_initial.y -Crafty.viewport.y;
			player.status.y= barra_initial.y -Crafty.viewport.y;
			helptext.y= helptext_ini.y-Crafty.viewport.y;

			if (time+1000<Date.now()){
				helptext.text(texts[Crafty.randRange(0,texts.length-1)] +
						" &nbsp; &nbsp; "+player.friends+
						" &nbsp; &nbsp; "+score
						);
				if (player.friends==0)
					player.mood_down(5);
				score+=1;

				player.faceChange(Math.ceil(5*player.status.w/player.barra.w));

				time= Date.now();
			}

		});
    });

	Crafty.c('mood',{
		init: function(){
			this.barra_initial={
				 x: (ancho*celres)-(celres*4),
				 y:1,
				 w: celres*4,h: 16, z:100};

			this.barra= Crafty.e("2D, DOM, Color")
				.attr(this.barra_initial)
				.color("red");
			this.status= Crafty.e("2D, DOM, Color")
				.attr(this.barra_initial)
				.color("green");
			this.status.attr({w: Math.round(this.barra.w/2)});
			this.friends=0;
		},
		mood_up:function(num){
			num = num || 10;
			if (this.status.w < this.barra.w){
				if (this.status.w+num>this.barra_initial.w)
					this.status.w = this.barra_initial.w;
				else
					this.status.w +=num;
				//Crafty.audio.play("auNewFriend");
			}
		},
		mood_down:function(num){
			num = num || 10;
			if (this.status.w > 0){
				if (this.status.w-num<0) this.status.x = 0
				else this.status.w -=num;
				//Crafty.audio.play("auDelFriend");
				//auDel.play();
			}
		}
	});

    Crafty.c('Ape', {
		Ape: function() {
		    //setup animations
		    this.requires("SpriteAnimation, Collision, Grid")
    		.animate("pasito", 0, 0, 3) //define animation
            .bind("NewDirection",
                function (direction) {
                    if (direction.x < 0) {
                        this.flip("X");
                        this.animate("pasito", 16, -1);
                    }
                    if (direction.x > 0) {
                        this._flipX=false;
                        this.animate("pasito", 16, -1);

                    }
                    if(!direction.x && !direction.y) {
                        this.stop();
                    }
            })
    	    .bind('Moved', function(from) {
                if(this.hit('solid')){
                    this.attr({x: from.x, y:from.y});
                }
            })

           	return this;
        }
    });

    Crafty.c('moodFace',{
    	init: function(){

		    //this.requires("")

		   	console.log("----moodface: "+ this.barra.w/this.status.w);
		   	at = {x: this.x,y: this.y,z: this.z+1,w : celres, h:celres};

		   	cara=1;
    		this.face= Crafty.e("2D,DOM, SpriteAnimation, mood"+cara ).attr(at);


			this.bind("Change",function(){
				this.face.x = this.x;
				this.face.y = this.y;
				this.face.z = this.z+1;
				this.face._flipX = this._flipX;
			});
/*
			this.face.animate("cface1", 6, 0, 1);
			this.face.animate("cface2", 7, 0, 1);
			this.face.animate("cface3", 4, 0, 1);
			this.face.animate("cface4", 5, 0, 1);*/
    		return this;
    	},
    	faceChange: function(n) {
    		//this.face.animate("cface"+n);

    	}

    });


    Crafty.c("RightControls", {
        init: function() {
            this.requires('Multiway');
        },
       rightControls: function(speed) {
            //this.multiway(speed, {UP_ARROW: -90, DOWN_ARROW: 90, RIGHT_ARROW: 0, LEFT_ARROW: 180});
            this.multiway(speed, {W: -90, S: 90, D: 0, A: 180});
            return this;
        }
    });

    Crafty.scene("game");

}
