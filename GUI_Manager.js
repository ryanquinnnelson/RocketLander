/**
 * Created by Jack on 4/25/2017.
 */
/**
 * Created by Jack on 4/16/2017.
 */

(function () {

    function GUI_Manager(){

        this.DisplayObject_constructor();

        // Physics Text
        this.physText = new createjs.Container();

        //Background box
        var g = new createjs.Graphics().beginFill("#646464").drawRoundRect(0,0,250, 175, 5);
        var textBox = new createjs.Shape(g);
        textBox.alpha = 0.7;
        textBox.x = 900;
        textBox.y = 170;

        //Displayed text
        var newText = new createjs.Text("", "30px Arial", "#000000");
        newText.name = "newText";
        newText.x = textBox.x + 10;
        newText.y = textBox.y + 10;
        this.physText.addChild(textBox, newText);

        //Pause screen
        this.pauseScreen = new createjs.Bitmap("Assets/PauseScreen2.png");
        this.pauseScreen.alpha = 0.8;
        this.pauseScreen.x = 200;
        this.pauseScreen.y = 250;
        this.pauseScreen.visible = false;

        //Fuel Bars
        this.bars = new createjs.Container();

        //Monopropellant bar
        var monoBar = new window.objects.FuelBar(750, 50, "#FA0A20", "#000000");
        monoBar.name = "monoBar";
        monoBar.setLabel("Monopropellant");

        //Main engine fuel bar
        var fuelBar = new window.objects.FuelBar(750, 110, "#0A6FB4", "#000000");
        fuelBar.name = "fuelBar";
        fuelBar.setLabel("rocket Fuel");
        this.bars.addChild(monoBar, fuelBar);

        //Text displayed after successful landing.
        this.landedText = new createjs.Text("LANDED!", "140px Impact", "#0204fa");
        this.landedText.set({regX:(225), regY:(100)});
        this.landedText.set({x:600, y:600});
        this.landedText.visible = false;

        //Pause hint
        var pauseHint = new createjs.Text("Press Spacebar to pause.", "30px Arial", "#000000");
        pauseHint.set({x:810, y:8});

        this.explosion = new createjs.Sprite(explosion_sheet, "boom");
        this.explosion.y = 1000;
        this.explosion.set({scaleX: 2, scaleY: 2});
        this.explosion.visible = false;

        this.crashedText = new createjs.Text("CRASHED!", "140px Impact", "#f00911");
        this.crashedText.set({regX:(275), regY:(100)});
        this.crashedText.set({x:600, y:600});
        this.crashedText.visible = false;



        stage.addChild(this.pauseScreen, this.landedText, this.crashedText, this.explosion, this.physText, this.bars, this.pauseScreen,  pauseHint);

    };

    var guim = createjs.extend(GUI_Manager, createjs.DisplayObject);

    window.objects.GUI_Manager = createjs.promote(GUI_Manager, "DisplayObject");



    guim.updatePhysText = function(input){
        this.physText.getChildByName("newText").text = input;
    };

    guim.updateBars = function(monoPercent, fuelPercent) {
        this.bars.getChildByName("monoBar").updateFill(monoPercent);
        this.bars.getChildByName("fuelBar").updateFill(fuelPercent);
    };

    guim.convertToMeters = function(altitude){
        const PIXELS_PER_METER = 496 / 52;
        return altitude / PIXELS_PER_METER;
    };

    guim.switchPauseScreen = function(){
        this.pauseScreen.visible = !this.pauseScreen.visible;
    };

    guim.showLandedText = function() {

        createjs.Ticker.paused = true;
        this.landedText.visible = true;

        createjs.Tween.get(this.landedText)
            .to({alpha:.6}, 300)
            .wait(100)
            .to({alpha:1}, 300)
            .to({alpha:.6}, 300)
            .wait(100)
            .to({alpha:1}, 300)
            .to({alpha:.6}, 300)
            .wait(100)
            .to({alpha:1}, 300)
            .to({visible:false}, 0)
            .wait(2000);

        createjs.Ticker.paused = false;
    };

    guim.explode = function(x) {

        this.explosion.x = x - 75;
        this.explosion.visible = true;

        this.explosion.gotoAndPlay("boom");
        createjs.Tween.get(this.explosion)
            .to({visible: false}, 2000);

        this.crashedText.visible = true;

        createjs.Tween.get(this.crashedText)
            .to({alpha:.6}, 300)
            .wait(100)
            .to({alpha:1}, 300)
            .to({alpha:.6}, 300)
            .wait(100)
            .to({alpha:1}, 300)
            .to({alpha:.6}, 300)
            .wait(100)
            .to({alpha:1}, 300)
            .to({visible:false}, 0)
            .wait(2000);
    };

    guim.removeExplosion = function() {
        this.explosion.visible = false;
    };

}());
