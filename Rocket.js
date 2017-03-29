//Rocket.js

(function () {
 
     //constants
     const THRUST = 35;       //force rocket generates at full power, in kN
     const START_FUEL = 500;  //starting rocket fuel level for each attempt
     const START_MONO = 100;  //starting monopropellant level for each attempt
     const START_VX = 0;      //starting horizontal velocity for each attempt
     const START_VY = 10;     //starting vertical velocity for each attempt
     const START_VA = 0;      //starting angular velocity for each attempt
 
 
     //create namespace
     window.objects = window.containers || {};
     
     //constructor
     function Rocket(rocket_sheet, fire_sheet, thruster_sheet){
 
        this.Container_constructor(); //superclass constructor

        this.regY = r.center_of_mass;
        this.name = "rocket";

         this.buildBody(rocket_sheet);
         this.buildLegs(rocket_sheet);
         this.buildFire(fire_sheet);
         this.buildThrusters(thruster_sheet);
         this.buildFirePts();
         this.buildThrusterPts();
    }
 
     //extend Container and return prototype of new class
     var r = createjs.extend(Rocket, createjs.Container);
 
 
 
     //inject attributes (properties and methods)
     //==========================================================================//
     //                                Properties                                //
     //==========================================================================//
     //dimensions
     r.landing_width = 151;
     r.body_width = 39;
     r.center_of_mass = 351;
     r.height = 496;
     r.landingHeight = 529;
 
     //position
     r.nextX = 0;
     r.nextY = 0;
     r.nextA = 0;
 
     //fuel
     r.fuel = START_FUEL;
     r.mono = START_MONO;
     r.thrustLevel = 0;
 
     //velocity
     r.velocityX = START_VX;
     r.velocityY = START_VY;
     r.velocityA = START_VA;
 
     //event listeners
     r.onThrustLevelChanged = [];    //store functions to call
     r.onThrustersFiring = [];  //store functions to call
     r.onEngineFiring = []; //store functions to call
 
 
 
     //==========================================================================//
     //                                Child Functions                           //
     //==========================================================================//
 
     //children
     r.buildBody = function(spritesheet){
         var body;
         
         //Sprite
         body = new createjs.Sprite(spritesheet, "deployFins");
         
         //properties
         body.x = -184/2;    //relative to rocket container
         body.name = "body";
         
         //add to container
         this.addChild(body);
     }
 
     r.buildLegs = function(spritesheet){
         var legs;
         
         //Sprite
         legs = new createjs.Sprite(spritesheet, "deployLegs");
         
         //properties
         legs.x = -184/2;    //relative to rocket container
         legs.name = "legs";
         
         //add to container
         this.addChild(legs);
     }
 
     r.buildFire = function(spritesheet){
         var fire;
         
         //Sprite
         fire = new createjs.Sprite(spritesheet, "noFire");
         
         //properties
         fire.y = r.height - 5; //relative to rocket container
         fire.name = "fire";
         fire.regX = 25;
         
         //add to container behind other children
         this.addChildAt(fire,0);
     }
 
 
     r.buildThrusters = function(spritesheet){
         var thrusterL, thrusterR;
         
         //Sprite
         thrusterL = new createjs.Sprite(spritesheet, "noThrust");
         
         //properties
         thrusterL.y = 60;   //relative to rocket container
         thrusterL.x = -10;
         thrusterL.name = "thrusterL";
         thrusterL.rotation = 90;    //rotate spritesheet graphic
         
         
         //Sprite
         thrusterR = new createjs.Sprite(spritesheet, "noThrust");
         
         //properties
         thrusterR.y = 110; //relative to rocket container
         thrusterR.x = 10;
         thrusterR.name = "thrusterR";
         thrusterR.rotation = -90;   //rotate spritesheet graphic
         
         //add to container behind other children
         this.addChildAt(thrusterL,thrusterR,0);
     }
 
     r.buildFirePts = function(){
     
         var largePt, mediumPt, smallPt, tinyPt;
         
         //large flame
         largePt = new createjs.Shape();
         largePt.x = this.regX;
         largePt.y = this.regY + 65;
         largePt.name = "largePt";
         //largePt.graphics.beginFill("red").drawCircle(largePt.x, largePt.y, 5);
         
         //medium flame
         mediumPt = new createjs.Shape();
         mediumPt.x = this.regX;
         mediumPt.y = this.regY - 20;
         mediumPt.name = "mediumPt";
         //mediumPt.graphics.beginFill("blue").drawCircle(mediumPt.x, mediumPt.y, 5);
         
         //small flame
         smallPt = new createjs.Shape();
         smallPt.x = this.regX;
         smallPt.y = this.regY - 65;
         smallPt.name = "smallPt";
         //smallPt.graphics.beginFill("green").drawCircle(smallPt.x, smallPt.y, 5);
         
         //tiny flame
         tinyPt = new createjs.Shape();
         tinyPt.x = this.regX;
         tinyPt.y = this.regY - 75;
         tinyPt.name = "tinyPt";
         //tinyPt.graphics.beginFill("orange").drawCircle(tinyPt.x, tinyPt.y, 5);
         
         this.addChild(largePt, mediumPt, smallPt, tinyPt);
     }
 
     r.buildThrusterPts = function(){
     
         var right, left;
     
         //right thruster
         //Shape
         right = new createjs.Shape();
         right.x = this.regX+25; //relative to rocket container
         right.y = 42;
         right.name = "thrusterRPt";
         //right.graphics.beginFill("red").drawCircle(right.x, right.y, 5);
         
         //left thruster
         //Shape
         left = new createjs.Shape();
         left.x = this.regX-25; //relative to rocket container
         left.y = 42;
         left.name = "thrusterLPt";
         //left.graphics.beginFill("green").drawCircle(left.x, left.y, 5);
         
         this.addChild(right, left);
     }
 
     //==========================================================================//
     //                          Rocket Property Functions                       //
     //==========================================================================//
     //velocity
     r.getVX = function(){
         return r.velocityX;
     }
     
     r.getVY = function(){
         return r.velocityY;
     }
     
     r.setVX = function(vX){
         r.velocityX = vX;
     }
     
     r.setVY = function(vY){
         r.velocityY = vY;
     }
 
     //thrustLevel
     r.getThrustLevel = function(){
        return r.thrustLevel;
     }
     
     r.setThrustLevel = function(n){
     
         if(n <= 4 && n >= 0){
             r.thrustLevel = n;
         }
     }
 
     r.increaseThrustLevel = function(){
         if(r.thrustLevel < 4){    //can't exceed 4
             r.thrustLevel++;
             this.thrustLevelChanged();
         }
     }
     
     r.decreaseThrustLevel = function(){
         if(r.thrustLevel > 0){    //can't be lower than 0
             r.thrustLevel--;
             this.thrustLevelChanged();
         }
     }
 
     //fuels
     r.getMono = function(){
         return r.mono;
     }
     
     r.getFuel = function(){
         return r.fuel;
     }
     
     r.setMono = function(n){
         r.mono = n;
     }
     
     r.setFuel = function(n){
         r.fuel = n;
     }
     
     r.decreaseMono = function(){
         if(r.mono >= 1){  //fuel remaining
             r.mono -= 1;
         }
     }
     
     r.decreaseFuel = function(){
         if(r.fuel > 0){   //fuel remaining
             r.fuel -= r.thrustLevel;
         }
         if(r.fuel < 0){   //to reset value if high thrust level brought fuel below 0
             r.fuel = 0;
         }
     }
  }
     //==========================================================================//
     //                             Movement Functions                           //
     //==========================================================================//
     //position
     r.position = function(x, y, angle){
         this.x = x;
         this.y = y;
         this.rotation = angle;
     }
 
 
 
 /*
    r.thrustLeft = function(){
        var isThrusting, child;

        child = this.getChildByName("thrusterL");

        //flags
        isThrusting = child.currentAnimation === "thrust";

        //left thruster
        if(!isThrusting){  //so change is made only once
            child.gotoAndPlay("thrust");
            r.thrustersFiring();
        }
        if(isThrusting){ //so change is made only once
            child.gotoAndPlay("noThrust");
        }
    }
 
     r.thrustRight = function(){
         var isThrusting, child;
         
         child = this.getChildByName("thrusterR");
         
         //flags
         isThrusting = child.currentAnimation === "thrust";
         
         //left thruster
         if(!isThrusting){  //so change is made only once
             child.gotoAndPlay("thrust");
         }
         if(isThrusting){ //so change is made only once
             child.gotoAndPlay("noThrust");
         }
     }
 
 
     //==========================================================================//
     //                             Listener Functions                           //
     //==========================================================================//
     //add function definition to a particular Rocket event
     r.addToListener = function(event, func){
         switch(event){
             case "thrustLevelChanged":
                 r.onThrustLevelChange.push(func);
                 break;
             case "thrusterFiring":
                 r.onThrustersFiring.push(func);
                 break;
             case "engineFiring":
                 r.onEngineFiring.push(func);
                 break;
         }
     }
 
     r.thrustersFiring = function(){
         for(i = 0; i < r.onThrustersFiring.length; i++){
             r.onThrustersFiring[i](); //call function stored
         }
     }
 
     r.engineFiring = function(){
         for(i = 0; i < r.onEngineFiring.length; i++){
             r.onEngineFiring[i](); //call function stored
         }
     }
 
 
     //events
     r.thrustLevelChanged = function(){
 
         var i;
         r.updateFireAnimation();
 
 
         //to call other functions stored with listener
         for(i = 0; i < r.onThrustLevelChange.length; i++){
             r.onThrustLevelChange[i](); //call function stored
         }//end for
     }//end r.thrustChanged
 
 
 

 
 
 //==========================================================================//
 //                         Rocket Animation Functions                       //
 //==========================================================================//
 
 r.updateFireAnimation = function(){
 var child, engineFiring;
 
 child = this.getChildByName("fire");
 //flag for engine firing
 engineFiring =  child.currentAnimation === "tinyFire" ||
 child.currentAnimation === "smallFire" ||
 child.currentAnimation === "mediumFire" ||
 child.currentAnimation === "largeFire";
 
 if(engineFiring){
 
 }switch(r.thrustLevel){
 case 0:
 child.gotoAndPlay("noFire");
 break;
 case 1:
 child.gotoAndPlay("tinyFire");
 break;
 case 2:
 child.gotoAndPlay("smallFire");
 break;
 case 3:
 child.gotoAndPlay("mediumFire");
 break;
 case 4:
 child.gotoAndPlay("largeFire");
 break;
 } //end switch

  */
 
     //promote overridden attributes and add new class to namespace
     window.objects.Rocket = createjs.promote(Rocket, "Container");
 
 }());
