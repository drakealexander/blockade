var canvas = document.getElementById("game-canvas");
var ctx = canvas.getContext("2d");

var level = 1;
var insane = false;

function start() {
  initializeBricks();
  resetBall();
  setInterval(draw, 10);
  $('#game-canvas').toggleClass('normal');
}

function insaneStart() {
  initializeBricks();
  insane = true;
  resetBall();
  setInterval(draw, 10);
  $('#game-canvas').toggleClass('insane');
  // $('canvas').css('background-color', "red");
}

function drawLevel() {
  ctx.font = "16px Arial";
  ctx.fillStyle = "#000";
  ctx.fillText("Level: " + level, canvas.width / 2 - 35, 20);
}

// Paddle
var paddleHeight = 10;
var paddleWidth = 75;
var paddleX = (canvas.width - paddleWidth) / 2;


function drawPaddle() {
  ctx.beginPath();
  ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
  ctx.fillStyle = "#999967";
  ctx.fill();
  ctx.closePath();
}


// Ball

var ballRadius = 10;
var x;
var y;
var dx;
var dy;

function resetBall() {
  if (insane) {
    dx = 4 + level / 2;
    dy = -4 - level / 2;
  } else {
    dx = 2 + level / 2;
    dy = -2 - level / 2;
  }
  x = canvas.width / 2;
  y = canvas.height - 30;

}

function drawBall() {
  ctx.beginPath();
  ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
  ctx.fillStyle = insane ? "#000" : "#266A2E";
  ctx.fill();
  ctx.closePath();
}

// Brick
var brickRowCount = 3;
var brickColumnCount = 5;
var brickWidth = 75;
var brickHeight = 20;
var brickPadding = 10;
var brickOffsetTop = 30;
var brickOffsetLeft = 30;
var bricks = [];

function initializeBricks() {
  for (c = 0; c < brickColumnCount; c++) {
    bricks[c] = [];
    for (r = 0; r < Math.min(brickRowCount + level, 7); r++) {
      bricks[c][r] = {
        x: 0,
        y: 0,
        status: 1
      };
    }
  }
}

function drawBricks() {
  for (c = 0; c < brickColumnCount; c++) {
    for (r = 0; r < brickRowCount; r++) {
      if (bricks[c][r].status == 1) {
        var brickX = (c * (brickWidth + brickPadding)) + brickOffsetLeft;
        var brickY = (r * (brickHeight + brickPadding)) + brickOffsetTop;
        bricks[c][r].x = brickX;
        bricks[c][r].y = brickY;
        ctx.beginPath();
        ctx.rect(brickX, brickY, brickWidth, brickHeight);
        ctx.fillStyle = insane ? "#000" : "#CCCC9A";
        ctx.fill();
        ctx.closePath();
      }
    }
  }
}

var prevScore = 0;

function collisionDetection() {
  for (c = 0; c < brickColumnCount; c++) {
    for (r = 0; r < brickRowCount; r++) {
      var b = bricks[c][r];
      if (b.status == 1) {
        if (x + ballRadius/2 > b.x && x - ballRadius/2 < b.x + brickWidth && y + ballRadius/2 > b.y && y - ballRadius/2 < b.y + brickHeight) {
          dy = -dy;
          b.status = 0;
          score++;
          if (score == (brickRowCount * brickColumnCount + prevScore)) {
            prevScore = score;
            level++;
            initializeBricks();
            x = canvas.width / 2;
            y = canvas.height - 30;
            brickRowCount = 2 + level;
            resetBall();
            // alert("Congrats! You won!");
            // document.location.reload();
          }
        }
      }

    }
  }
}

// Score
var score = 0;

function drawScore() {
  ctx.font = "16px Arial";
  ctx.fillStyle = "#000";
  ctx.fillText("Score: " + score, 8, 20);
}

// Lives
var lives = 3;

function drawLives() {
  ctx.font = "16px Arial";
  ctx.fillStyle = "#000";
  ctx.fillText("Lives: " + lives, canvas.width - 65, 20);
}

// Level

// Main

var rightPressed = false;
var leftPressed = false;
var paused = false;

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (insane) {

  }
  drawBricks();
  drawBall();
  drawPaddle();
  drawLevel();
  drawLives();
  drawScore();
  collisionDetection();
  if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
    dx = -dx;
  }

  if (y + dy < ballRadius) {
    dy = -dy;
  } else if (y > canvas.height - paddleHeight - ballRadius) {
    if (x > paddleX - ballRadius && x < paddleX + paddleWidth + ballRadius) {
      dy = -dy;
    } else if (y > canvas.height - paddleHeight){
      lives--;

      if (lives < 1) {
        gameOverAction();
        document.location.reload();
      } else {
        resetBall();
        paddleX = (canvas.width - paddleWidth) / 2;
      }
    }
  }

  if (rightPressed && paddleX < canvas.width - paddleWidth) {
    paddleX += 10;
  } else if (leftPressed && paddleX > 0) {
    paddleX -= 10;
  }
  x += dx;
  y += dy;
}

function gameOverAction() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  $('#game-canvas').toggleClass('insane');
  $('#game-over-message').css("visibility", "visible");
  var prevHighScore = localStorage.getItem("highScore") || 0;
  if (score > prevHighScore) {
    $('#new-high-score').css("visibility", "visible");
    localStorage.setItem("highScore", score);
  }
  sleep(6000);
}

function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}

function keyDownHandler(e) {
  if (e.keyCode == 39) {
    rightPressed = true;
  } else if (e.keyCode == 37) {
    leftPressed = true;
  }
}

function keyUpHandler(e) {
  if (e.keyCode == 39) {
    rightPressed = false;
  } else if (e.keyCode == 37) {
    leftPressed = false;
  }
}

function mouseMoveHandler(e) {
  var relativeX = e.clientX - canvas.offsetLeft;
  if (relativeX > 0 && relativeX < canvas.width) {
    paddleX = relativeX - paddleWidth / 2;
  }

}
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
document.addEventListener("mousemove", mouseMoveHandler, false);
