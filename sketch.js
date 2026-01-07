let capture;
let posenet;
let singlePose;
let noseX, noseY;

// Ball variables
let ball = { x: 400, y: 50, size: 30, speedX: 5, speedY: 5 };

// Score and misses
let score = 0;
let misses = 0;

// Game control
let isRunning = true;
let stopButton, restartButton;

function setup() {
    createCanvas(800, 500);
    capture = createCapture(VIDEO);
    capture.size(800, 500);
    capture.hide();

    // PoseNet
    posenet = ml5.poseNet(capture, () => {
        console.log("PoseNet loaded!");
    });
    posenet.on('pose', (poses) => {
        if (poses.length > 0) {
            singlePose = poses[0].pose;
            noseX = singlePose.nose.x;
            noseY = singlePose.nose.y;
        }
    });

    // Stop button
    stopButton = createButton('Stop');
    stopButton.position(width/2 - 30, height + 150);
    stopButton.style('background-color', '#e74c3c');
    stopButton.style('color', 'white');
    stopButton.style('font-size', '18px');
    stopButton.style('padding', '12px 25px');
    stopButton.style('border-radius', '10px');
    stopButton.style('box-shadow', '0 0 10px #e74c3c');
    stopButton.mousePressed(() => {
        isRunning = false;
    });

    // Restart button
    restartButton = createButton('Restart');
    restartButton.position(width/2 + 600, height + 150);
    restartButton.style('background-color', '#27ae60');
    restartButton.style('color', 'white');
    restartButton.style('font-size', '18px');
    restartButton.style('padding', '12px 25px');
    restartButton.style('border-radius', '10px');
    restartButton.style('box-shadow', '0 0 10px #27ae60');
    restartButton.mousePressed(() => {
        isRunning = true;
        score = 0;
        misses = 0;
        resetBall();
    });
}

function draw() {

    
    // Gradient background
    for (let y = 0; y < height; y++) {
        let inter = map(y, 0, height, 0, 1);
        let c = lerpColor(color(20, 30, 70), color(50, 0, 100), inter);
        stroke(c);
        line(0, y, width, y);
    }

    // Flip video horizontally
    translate(width, 0);
    scale(-1, 1);
    tint(255, 150); // slight transparency to blend with background
    image(capture, 0, 0, width, height);
    noTint();

    if (isRunning) {
        // Glowing Ball
        push();
        noStroke();
        for (let i = 5; i > 0; i--) {
            fill(255, 255, 0, 50);
            ellipse(ball.x, ball.y, ball.size + i*10);
        }
        fill(255, 255, 0);
        ellipse(ball.x, ball.y, ball.size);
        pop();

        ball.x += ball.speedX;
        ball.y += ball.speedY;

        // Bounce on walls
        if (ball.x < ball.size / 2 || ball.x > width - ball.size / 2) ball.speedX *= -1;
        if (ball.y < ball.size / 2) ball.speedY *= -1;

        // Bounce on nose + add score
        if (noseX && noseY) {
            let d = dist(ball.x, ball.y, noseX, noseY);
            if (d < ball.size / 2 + 30) {
                ball.speedY *= -1;
                ball.y = noseY - (ball.size / 2 + 30);
                score += 1;
            }
        }

        // Check if ball missed
        if (ball.y > height) {
            misses += 1;
            resetBall();
        }

        // Reset game if missed 10 times
        if (misses >= 10) {
            score = 0;
            misses = 0;
            resetBall();
        }
    }

    // Draw nose badminton racket with glow
    if (noseX && noseY) {
        resetMatrix();
        push();
        stroke(200, 0, 255);
        strokeWeight(3);
        fill(150, 0, 255, 150);
        // racket handle
        rect(noseX - 5, noseY, 10, 40, 5);
        // racket head
        ellipse(noseX, noseY, 40, 40);
        pop();
    }

    // Display score and misses with shadow
    resetMatrix();
    fill(255);
    textSize(28);
    textAlign(LEFT, TOP);
    drawingContext.shadowOffsetX = 2;
    drawingContext.shadowOffsetY = 2;
    drawingContext.shadowBlur = 5;
    drawingContext.shadowColor = 'rgba(0,0,0,0.5)';
    text("Score: " + score, 20, 20);
    text("Misses: " + misses, 20, 60);

   

}
  
// Function to reset ball position
function resetBall() {
    ball.x = width / 2;
    ball.y = 50;
    ball.speedY = 7;
    ball.speedX = random(-8, 8);
}


