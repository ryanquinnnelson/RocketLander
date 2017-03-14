//=================================================================================//
//                                   Variables                                     //
//=================================================================================//
//SpaceX Falcon 9 first stage rocket data
const DRY_MASS = 26500; //kg
const RESIDUAL_PROPELLANT = 1000; //kg
const MOMENT_OF_INERTIA = 3.06 * Math.pow(10,6);    //kg * m^3
const PIXELS_PER_METER = 496 / 52;  //height in pixels / height in meters


var gravity = 9.81; // m/s/svar gravity = 9.81; //m/s/s




var stage, queue, rocket_sheet, fire_sheet, thruster_sheet;
var rocket;
var forceSummary, resultant;
var fsText;






//=================================================================================//
//                                   Startup                                       //
//=================================================================================//
function init(){
    queue = new createjs.LoadQueue(false);
    queue.addEventListener("complete", load);
    queue.loadManifest([
        {id: "falcon9", src: "Assets/Falcon9.png"},
        {id: "falcon9fire", src: "Assets/Falcon9Fire.png"},
        {id: "falcon9thrusters", src: "Assets/Falcon9Thrusters2.png"}
    ]);
}

function load(){
    stage = new createjs.Stage("canvas");
    
    //game objects
    buildSpriteSheets();
    buildRocket(400,400,90);
    //buildRect(0,0,575,400,"red");
    
    //ticker
    createjs.Ticker.framerate = 60;
    createjs.Ticker.addEventListener("tick", run);
    
    //forces
    setDefaultForces(rocket);
    sumForces(rocket);
    displayResultant(rocket, "green");
    
    //GUI
    displayForceSummary(rocket, "white");
}


//=================================================================================//
//                                Game Mechanics                                   //
//=================================================================================//
function run(e){
    
    stage.update();
}

//=================================================================================//
//                                      Physics                                    //
//=================================================================================//

/*
    Adding two forces due to gravity, one acting in the upper section and the second acting in the lower section. This results in a more natural rotation if the rocket is angled, rather than if a single gravity force was acting through the center of mass (resulting in no rotation).
 
 //distances are from the top of the target, downward
 */
function setDefaultForces(target){
    
    resetForceSummary();

    var gravityTop, gravityBottom, ratio;
    var topDistance, bottomDistance, remainder;
    
    //top gravitational force
    gravity1 = gravity * target.mass * 0.25;     //percent of gravity force for top
    length1 = target.center_of_mass / 2;        //middle of upper section
    
    //bottom gravitational force
    gravity2 = gravity * target.mass * 0.75; //percent for bottom
    remainder = (target.height - target.center_of_mass);
    length2 = remainder/2 + target.center_of_mass; //middle of lower section
    
    //add forces to target
    addForce(0, length1, gravity1, 270, target); //straight down
    addForce(0, length2, gravity2, 270, target); //straight down
}




/*
        x:      x-coordinate where force acts, relative to target
        y:      y-coordinate where force acts, relative to target
        m:      magnitude in kilonewtons (kN)
        dir:    direction of force vector in degrees, with 0 degrees according to standard geometry convention (horizontal). Degrees increase in counterclockwise fashion according to geometry convention as well.
 
        Note: location of 0 degrees differs from CreateJS (CreateJS has 0 degrees starting vertically). CreateJS follows the same convention for degree increase (counterclockwise).
 
        Note: moment arm is the perpendicular distance between the target's center of mass and the force vector acting on the target.
        Note: length of the moment arm in pixels
 */
function addForce(x,y, magnitude, direction, target){ //alert("addForce()");
    
    var force;
    
    //generic object
    force = new createjs.Shape();
    
    //createjs properties
    force.x = x;
    force.y = y;
    force.name = "force";
    force.graphics.beginFill("blue").drawCircle(0,0,2);
    
    //dynamically injected properties
    force.magnitude = magnitude;
    force.direction = direction;
    
    //add to container
    target.addChild(force);
}


function sumForces(target){
    
    var xTotal, yTotal, mTotal, current, xForce, yForce, xMoment, yMoment;
    
    //set initial values
    xTotal = yTotal = mTotal = 0;
    
    for(i = 0; i < target.children.length; i++){ //for each child in target
        
        current = target.children[i];
        
        if(current.name !== "force"){   //child is not a force
            continue;   //skip this iteration
        }
        
        //force
        //x component
        xForce = calcForceComponent(current, "x");
        xTotal += xForce;
        
        //y component
        yForce = calcForceComponent(current, "y");
        yTotal += yForce;
        
        //moment
        //x component
        xMoment = calcMomentComponent(current, "x", {x: xForce, y: yForce});
        mTotal += xMoment;
        
        //y component
        yMoment = calcMomentComponent(current, "y", {x: xForce, y: yForce});
        mTotal += yMoment;
    } //end for
    
    
    //simplify if close to zero
    if(Math.abs(xTotal) < 1){ //value is extremely small
        xTotal = 0;
    }
    if(Math.abs(yTotal) < 1){ //value is extremely small
        yTotal = 0;
    }
    if(Math.abs(mTotal) < 1){ //value is extremely small
        mTotal = 0;
    }
    
    //store values
    forceSummary.xComponent = xTotal;
    forceSummary.yComponent = yTotal;
    forceSummary.moment = mTotal;
}

function calcMomentComponent(force, type, components){
    var parent, momentArm, moment;
    
    //get container of force
    parent = force.parent;

    //get current x,y of parent center of mass, relative to stage
    centerPt = parent.localToGlobal(parent.regX, parent.regY);
    
    //get force x,y relative to stage
    forcePt = force.localToGlobal(force.regX,force.regY);

    switch(type){
        case "x":
            //calculate moment arm as difference in the y's of target, child
            //convert from pixels into meters
            momentArm = (centerPt.y - forcePt.y) / PIXELS_PER_METER;
            moment = components.x * momentArm;
            break;
            
        case "y":
            //calculate moment arm as difference in the x's of target, child
            //convert from pixels into meters
            momentArm = (forcePt.x - centerPt.x) / PIXELS_PER_METER;
            moment = components.y * momentArm;
            break;
    }
    return moment;
}


function calcForceComponent(force,type){

    var radians, component;
    
    radians = degreesToRadians(force.direction);
    
    switch(type){
        case "x":
            component = Math.cos(radians) * force.magnitude;
            break;
        case "y":
            component = Math.sin(radians) * force.magnitude;
            break;
    }
    
    return component;
}



function degreesToRadians(degrees){
    
    return degrees * Math.PI / 180;
}

function radiansToDegrees(radians){
    
    return radians * 180 / Math.PI;
}

function resetForceSummary(){
    
    forceSummary = {xComponent: 0, yComponent: 0, moment: 0};
}


//=================================================================================//
//                                   Game Objects                                  //
//=================================================================================//

function buildRocket(regX, regY, angle){ //alert("buildRocket()");
    
    //Container
    rocket = new createjs.Container();
    
    //dynamically injected properties
    rocket.landing_width = 151;     //distance in pixels between landing leg tips
    rocket.body_width = 39;         //width in pixels of rocket body
    rocket.center_of_mass = 351;    //distance in pixels from top of rocket to C.O.M.
    rocket.height = 496;            //distance from top of rocket to bottom of engines
    //rocket.forces = [];             //forces acting on rocket
    rocket.mass = DRY_MASS + RESIDUAL_PROPELLANT;
    
    //CreateJS properties
    rocket.regY = rocket.center_of_mass;    //vertical registration point
    rocket.x = regX;
    rocket.y = regY;
    rocket.rotation = angle;
    rocket.name = "rocket";
    
    //children for container
    buildBody();
    buildLegs();
    buildFire();
    buildThrusters();
    buildCenterOfMass(rocket, "red", 10);
    
    //add to stage
    stage.addChild(rocket);
    stage.update();
}

function buildBody(){ //alert("buildBody()");
    
    var body;
    
    //Sprite
    body = new createjs.Sprite(rocket_sheet, "deployFins");
    
    //properties
    body.x = -184/2;
    body.name = "body";
    
    //add to container
    rocket.addChild(body);
}

function buildLegs(){//alert("buildLegs()");
    
    var legs;
    
    //Sprite
    legs = new createjs.Sprite(rocket_sheet, "deployLegs");
    
    //properties
    legs.x = -184/2;
    legs.name = "legs";
    
    //add to container
    rocket.addChild(legs);
}


function buildFire(){//alert("buildFire()");
    
    var fire;
    
    //Sprite
    fire = new createjs.Sprite(fire_sheet, "mediumFire");
    
    //properties
    fire.y = rocket.height - 5;
    fire.name = "fire";
    fire.regX = 25;
    
    //add to container behind other children
    rocket.addChildAt(fire,0);
}

function buildThrusters(){ //alert("buildThrusters()");
    var thrusterL, thrusterR;
    
    //Sprite
    thrusterL = new createjs.Sprite(thruster_sheet, "thrust");
    
    //properties
    thrusterL.y = 60;
    thrusterL.x = -10;
    thrusterL.name = "thrusterL";
    thrusterL.rotation = 90;
    
    
    //Sprite
    thrusterR = new createjs.Sprite(thruster_sheet, "thrust");
    
    //properties
    thrusterR.y = 110;
    thrusterR.x = 10;
    thrusterR.name = "thrusterR";
    thrusterR.rotation = -90;
    
    //add to container behind other children
    rocket.addChildAt(thrusterL,thrusterR,0);
    
}

function buildCenterOfMass(target, color, radius){
    var com, add;
    
    //Shape
    com = new createjs.Shape();
    
    
    //properties
    com.x = target.regX;
    com.y = target.regY;
    com.name = "center of mass";
    com.visible = false;
    
    //graphics
    add = radius*1.5;
    com.graphics.beginStroke(color).drawCircle(0, 0, radius);
    com.graphics.moveTo(-add,0).lineTo(add, 0);
    com.graphics.moveTo(0,-add).lineTo(0,add);
    
    //add to container
    target.addChild(com);
}

//=================================================================================//
//                                       GUI                                       //
//=================================================================================//



//add arrowhead to vector
function displayResultant(target, color){ //alert("displayResultant()");

    var xLength, yLength, rLength, xDiff, Diff;
    var radians, degrees, angle;
    var globalPt, endPt;
    
    //Shape
    stage.removeChild(resultant);   //remove old version if it exists
    resultant = new createjs.Shape();
    
    
    //convert force components (kN) into pixel lengths
    xLength = forceSummary.xComponent / 1000;
    yLength = forceSummary.yComponent / 1000;

    //determine x,y of target center of mass, relative to stage
    globalPt = target.localToGlobal(target.regX, target.regY);
    
    //determine x,y of endpoint of line, relative to stage
    endPt = new createjs.Point(xLength, yLength*-1);
    
    //calculate rotation for arrowhead, based on these points
    xDiff = endPt.x - globalPt.x;
    yDiff = endPt.y - globalPt.y;
    radians = Math.atan(yDiff/xDiff);
    //alert(radiansToDegrees(radians));

    
    //properties
    resultant.x = globalPt.x;
    resultant.y = globalPt.y;
    resultant.name = "resultant";
    
    //graphics
    resultant.graphics.setStrokeStyle(6, "round").beginStroke(color);
    resultant.graphics.moveTo(0, 0);
    resultant.graphics.lineTo(endPt.x, endPt.y);

    
    stage.addChild(resultant);
}

function displayForceSummary(target, color){
    var m;
    
    m ="Force (x):  " + Math.round(forceSummary.xComponent)
     + " kN\n\nForce (y):  " + Math.round(forceSummary.yComponent)
     + " kN\n\nMoment:  " + Math.round(forceSummary.moment) + " kN*m";
    
    fsText = new createjs.Text( m, "24px Arial", color);
    fsText.x = stage.canvas.width - 350;
    fsText.y = 50;
    
    stage.addChild(fsText);
}

//=================================================================================//
//                                   Animations                                    //
//=================================================================================//
function buildSpriteSheets(){ //alert("buildSpriteSheets()");
    
    var image, data;
    
    //spritesheet for rocket
    //HTML Image Object
    image = queue.getResult("falcon9");
    
    //generic object
    data = {
        images: [image],
        frames:{width: 184, height: 861, spacing: 0, count: 27, margin: 0},
        animations: {
            closedFins: 0,
            deployFins: [0, 2, "deployedFins", 0.1],    //start, end, [next], [speed]
            deployedFins: 2,
            closeFins: {
                frames: [2,1,0],
                next: "closedFins",
                speed: 0.1
            },
            finsLeft: 3,
            finsRight: 5,
            closedLegs: 6,
            deployLegs: [6,10, "deployedLegs", 0.1],
            deployedLegs: 10,
        } //end animations
    }; //end data
    
    rocket_sheet = new createjs.SpriteSheet(data);
    
    
    //spritesheet for fire
    //HTML Image Object
    image = queue.getResult("falcon9fire");
    
    //generic object
    data = {
        images: [image],
        frames:{width: 50, height: 364, spacing: 0, count: 21, margin: 0},
        animations: {
            noFire: 20,
            tinyFire: [15,19, "tinyFire", 0.3],
            smallFire: [0,4, "smallFire", 0.3],
            mediumFire: [5,9, "mediumFire", 0.3],
            largeFire: [10,14, "largeFire", 0.3]
        } //end animations
    }; //end data
    
    fire_sheet = new createjs.SpriteSheet(data);
    
    //spritesheet for thruster
    //HTML Image Object
    image = queue.getResult("falcon9thrusters");
    
    //generic object
    data = {
        images: [image],
        frames:{width: 50, height: 75, spacing: 0, count: 6, margin: 0},
        animations: {
            noThrust: 5,
            thrust: [0,4, "thrust", 0.3]
        } //end animations
    }; //end data
    
    thruster_sheet = new createjs.SpriteSheet(data);
}

//=================================================================================//
//                                      Debug                                      //
//=================================================================================//

function buildRect(x, y, width, height, color){
    var rect;
    
    rect = new createjs.Shape();
    rect.graphics.beginStroke(color).drawRect(x,y,width,height);
    rect.x = rect.y = 0;
    
    stage.addChild(rect);
    stage.update();
}



/*
 Method takes each force currently acting on target and calculates a total moment in kiloNewton * meters.
 
 For each force acting on the target:
 -   Determine the direction of the force in standard geometric convention (SGC), relative to the target
 (i.e. if the target is pointing 90 degrees SGC and is acted on by a force with a direction of 180 degrees SGC, the direction of the force relative to the target is 180 degrees SGC.
 
 If the target is pointing 135 degrees SGC, and is acted on by a force with a direction of 225 degrees SGC, the direction of the force relative to the target is 180 degrees SGC.
 
 If the target is pointing 45 degrees SGC, and is acted on by a force with a direction of 225 degrees SGC, the direction of the force relative to the target is 270 degrees SGC.
 
 -   Determine the x,y point the force acts at, relative to target coordinate system
 
 -   Break the force into horizontal and vertical components
 
 -   Calculate the moment arm for each component
 
 -   Calculate the moment for each component and add to the total
 
 Once all individual forces have been processed, save the resulting total moment.
 
 Note:
 Negative moment indicates counterclockwise torque.
 
 Standard geometric convention (SGC) for angle:
 -  0 degrees is horizontal
 -  degrees increase in counterclockwise direction
 
 CreateJS convention (CJS) for rotation angle:
 -  0 degrees is vertical
 -  degrees increase in clockwise direction
 */
/*
 function sumMoments(target){
 
 var conversion, momentTotal, i, current;
 var relativeDirection, radians, localPt, xForce, yForce, moment_arm, moment;
 var reverse, targetPt, forcePt;
 
 //get number of pixels per meter based on image
 conversion = target.height / 52;    //actual first stage is 52.00 m tall
 
 
 //get target center of mass, relative to stage
 targetPt = target.localToGlobal(target.regX, target.regY);
 
 
 //set starting value
 momentTotal = 0;
 
 for(i = 0; i < target.children.length; i++){  //for each child in container
 
 current = target.children[i];
 //alert(current);
 
 if(current.name !== "force"){
 continue;
 }
 
 forcePt = current.localToGlobal(current.regX,current.regY);
 
 
 //determine direction of force, relative to target coordinate system
 relativeDirection = current.direction + target.rotation;
 radians = degreesToRadians(relativeDirection);
 //alert(radiansToDegrees(radians));
 
 //determine force x,y relative to target coordinate system
 localPt = target.globalToLocal(current.x, current.y);
 
 //determine x- and y-component forces relative to this new direction
 reverse = target.rotation < 0  ? 1 : -1;
 //alert(target.rotation);
 xForce = Math.sin(radians) * current.magnitude * reverse;
 yForce = Math.cos(radians) * current.magnitude;
 //alert(xForce + "," + yForce);
 
 //calculate horizontal moment in kiloNewton * meters
 moment_arm = Math.abs(target.regY - localPt.y) / conversion;
 moment = yForce * moment_arm;
 momentTotal += moment;
 //alert(moment);
 //calculate vertical moment in kiloNewton * meters
 moment_arm = Math.abs(target.regX - localPt.x) / conversion;
 moment = xForce * moment_arm;
 momentTotal += moment;
 //alert(moment);
 
 } //end for
 
 
 if(Math.abs(momentTotal) < 1){ //value is extremely small
 momentTotal = 0;
 }
 
 forceSummary.moment = momentTotal; //store value
 //alert(forceSummary.moment);
 }
 */


/*
 function sumForces2(target){ //alert("sumForces()");
 
 var i, xTotal, yTotal, xForce, yForce;
 
 
 xTotal = yTotal = 0;
 
 for(i = 0; i < target.forces.length; i++){
 
 current = target.forces[i];
 
 //x component
 xForce = getXComponent(current);
 xTotal += xForce;
 
 //y component
 yForce = getYComponent(current);
 yTotal += yForce;
 
 alert("xForce: " + xForce + ", yForce: " + yForce);
 }
 
 
 if(Math.abs(xTotal) < 1){ //value is extremely small
 xTotal = 0;
 }
 if(Math.abs(yTotal) < 1){ //value is extremely small
 yTotal = 0;
 }
 
 forceSummary.xComponent = xTotal;  //store value
 forceSummary.yComponent = yTotal;  //store value
 //alert(forceSummary.xComponent + "," + forceSummary.yComponent);
 }
 */

