import './style.css'
import Phaser from 'phaser'

// Constant variable object, sizes:
const sizes = {
  width: 500,
  height: 500
}

// Physics Constants
const speedDown = 300

const gameStartDiv = document.querySelector("#gameStartDiv")
const gameStartBtn = document.querySelector("#gameStartBtn")
const gameEndDiv = document.querySelector("#gameEndDiv")
const gameWinLoseSpan = document.querySelector("#gameWinLoseSpan")
const gameEndScoreSpan = document.querySelector("#gameEndScoreSpan")


class GameScene extends Phaser.Scene{
  constructor(){
    super("scene-game");
    this.player; // character
    this.cursor; // use for character controls via keyboard input
    this.playerSpeed = speedDown + 50;
    this.target; // falling objects
    this.points = 0; // Point counter (overlaps detected)
    this.textScore
    this.textTime
    this.timedEvent
    this.remainingTime
    this.bkgMusic
    this.raindropSound
    this.emitter
  }

  // Preload assets
  preload(){
    // Images
    this.load.image("bkg","/assets/background.png");
    this.load.image("character","/assets/duck_front.png");
    this.load.image("fallobj","/assets/rain.png");
    this.load.image("title","/assets/title.png");
    this.load.image("leftFacing","/assets/duck_side.png");
    this.load.image("rightFacing","/assets/duck_side2.png");
    this.load.image("particle", "/assets/rain.png");
    // Audio
    this.load.audio("bkgMusic", "/assets/lofiMusic.mp3");
    this.load.audio("raindrop","/assets/raindropSFX.mp3");
  }

  // Accept loaded assets & handle them accordingly
  create(){

    // Pause game until start button is clicked
    this.scene.pause("scene-game");

    // Music
    this.bkgMusic = this.sound.add("bkgMusic");
    this.raindropSound = this.sound.add("raindrop");
    this.bkgMusic.play();

    // Player
    this.add.image(0,0,"bkg").setOrigin(0,0).setScale(.5,.5);
    this.player = this.physics.add
      .image(0, sizes.height - 100,"character")
      .setOrigin(0,0).setScale(.35,.35)
    this.player.setImmovable(true);
    this.player.body.allowGravity = false;
    this.player.setCollideWorldBounds(true);
          // Adjust player's hitbox
          this.player.setSize(this.player.width - this.player.width/4, this.player.height/6)
          .setOffset(this.player.width/10, this.player.height - this.player.height/10 -20 );
                  // Alternative option: this.player.setSize(80,15).setOffset(10,70);

    // Falling Objects
    this.target = this.physics.add
      .image(0,0, "fallobj")
      .setScale(.15,.15)
      .setOrigin(0,0);
      this.target.setMaxVelocity(0, speedDown);

    // Detect Overlap between falling object and player
    this.physics.add.overlap(this.target, this.player, this.targetHit, null, this)

    // Keyboard Input
    this.cursor = this.input.keyboard.createCursorKeys()
  
    // Score counter, text. UI
    this.textScore = this.add.text(sizes.width - 120, 10, "Score: 0", {
      font: "25px Arial",
      fill: "#000513",
    });

    // Timer, text. UI
    this.textTime = this.add.text(10, 10, "Time: 0", {
      font: "25px Arial",
      fill: "000513",
    });
    
    // Particle emitter
    this.emitter = this.add.particles(0, 0, "particle", {
      speed:100,
      gravityY: speedDown - 200,
      scale: 0.04,
      duration: 100,
      emitting: false
    });
    this.emitter.startFollow (this.player, this.player.width /2, this.player.height /2, true);

    // Set remaining time until gameOver function is called
    this.timedEvent = this.time.delayedCall(30000, this.gameOver, [], this); // Game lasts 30 seconds

    // Title Logo
    this.add.image(230,1,"title").setOrigin(0,0).setScale(.15,.15);
  }


  // Run continuosly
  update(){

    // Update timer with remaining seconds
    this.remainingTime = this.timedEvent.getRemainingSeconds();
    this.textTime.setText("Remaining Time: " + Math.round(this.remainingTime).toString());

    // Check for falling object
    if (this.target.y > sizes.height){
      this.target.setY(0);
      this.target.setX(this.getRandomX());
    }

    const {left, right} = this.cursor

    // Conditional logic for keyboard controls
    if (left.isDown){
      this.player.setVelocityX(-this.playerSpeed)
      .setTexture("leftFacing"); // Image faces left
    } else if (right.isDown) {
      this.player.setVelocityX(this.playerSpeed)
      .setTexture("rightFacing"); // Image faces right
    } else {
      this.player.setVelocityX(0)
      .setTexture("character"); // Image faces forward
    }
  }

// Function to generate random x value for falling objects
getRandomX() {
  return Math.floor(Math.random() * 480);
}

// Function that occurs when targets are hit
targetHit() {

  this.raindropSound.play(); // SFX

  this.emitter.start(); // Emitter
  this.target.setY(0);
  this.target.setX(this.getRandomX());
  this.points++;
  // Update Score text
  this.textScore.setText('Score: ' + this.points);
}

// Function to end game, Game Over
gameOver() {
  this.sys.game.destroy(true);

    // End screen content based on points
    if(this.points >= 10){
      gameEndScoreSpan.textContent = this.points;
      gameWinLoseSpan.textContent = "Win! :)";
    } else {
      gameEndScoreSpan.textContent = this.points;
      gameWinLoseSpan.textContent = "Lose...";
    }
    gameEndDiv.style.display = "flex";
  }
}


const config = {
  type: Phaser.WEBGL,
  width: sizes.width,
  height: sizes.height,
  canvas: gameCanvas,
  physics:{
    default: "arcade",
    arcade:{
      gravity:{y:speedDown},
      debug: true
    }
  },
  scene:[GameScene]
}

const game = new Phaser.Game(config);


// Event listener for start button
gameStartBtn.addEventListener("click", ()=>{
  gameStartDiv.style.display = "none";
  game.scene.resume("scene-game"); // resume, since game is paused until start button is clicked
})