const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let score1 = 0, score2 = 0;

// --- PLAYER & BALL DATA ---
const player1 = {x:100, y:canvas.height/2, radius:15, color:"blue", dx:0, dy:0};
const player2 = {x:700, y:canvas.height/2, radius:15, color:"red", dx:0, dy:0};
const ball = {x:canvas.width/2, y:canvas.height/2, radius:10, dx:0, dy:0};

// --- INPUT ---
const keys = {};
window.addEventListener("keydown", e=>keys[e.key.toLowerCase()]=true);
window.addEventListener("keyup", e=>keys[e.key.toLowerCase()]=false);

// --- GAME LOOP ---
function update(){
  // PLAYER 1 CONTROLS (WASD)
  player1.dy = player1.dx = 0;
  if(keys['w']) player1.dy=-3;
  if(keys['s']) player1.dy=3;
  if(keys['a']) player1.dx=-3;
  if(keys['d']) player1.dx=3;

  // PLAYER 2 CONTROLS (Arrow Keys)
  player2.dy = player2.dx = 0;
  if(keys['arrowup']) player2.dy=-3;
  if(keys['arrowdown']) player2.dy=3;
  if(keys['arrowleft']) player2.dx=-3;
  if(keys['arrowright']) player2.dx=3;

  // MOVE PLAYERS
  player1.x += player1.dx; player1.y += player1.dy;
  player2.x += player2.dx; player2.y += player2.dy;

  // BOUNDARIES
  [player1,player2].forEach(p=>{
    if(p.x<p.radius) p.x=p.radius;
    if(p.x>canvas.width-p.radius) p.x=canvas.width-p.radius;
    if(p.y<p.radius) p.y=p.radius;
    if(p.y>canvas.height-p.radius) p.y=canvas.height-p.radius;
  });

  // BALL MOVEMENT
  ball.x += ball.dx; ball.y += ball.dy;
  ball.dx *= 0.98; ball.dy *= 0.98; // friction

  // BALL COLLISION WITH PLAYERS
  [player1,player2].forEach(p=>{
    const dist = Math.hypot(ball.x-p.x, ball.y-p.y);
    if(dist < ball.radius+p.radius){
      const angle = Math.atan2(ball.y-p.y, ball.x-p.x);
      const speed = 5;
      ball.dx = Math.cos(angle)*speed;
      ball.dy = Math.sin(angle)*speed;
    }
  });

  // BALL COLLISION WITH WALLS
  if(ball.x<ball.radius){ ball.x=ball.radius; ball.dx*=-1; }
  if(ball.x>canvas.width-ball.radius){ ball.x=canvas.width-ball.radius; ball.dx*=-1; }
  if(ball.y<ball.radius){ ball.y=ball.radius; ball.dy*=-1; }
  if(ball.y>canvas.height-ball.radius){ ball.y=canvas.height-ball.radius; ball.dy*=-1; }

  // GOAL CHECK
  if(ball.x<0 && ball.y>canvas.height/2-50 && ball.y<canvas.height/2+50){
    score2++; resetBall();
  }
  if(ball.x>canvas.width && ball.y>canvas.height/2-50 && ball.y<canvas.height/2+50){
    score1++; resetBall();
  }

  document.getElementById("score").innerText = score1 + " : " + score2;
}

// --- DRAW ---
function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);

  // FIELD LINE
  ctx.strokeStyle="white";
  ctx.lineWidth=4;
  ctx.strokeRect(0,0,canvas.width,canvas.height);

  // GOALS
  ctx.fillStyle="white";
  ctx.fillRect(0,canvas.height/2-50,10,100);
  ctx.fillRect(canvas.width-10,canvas.height/2-50,10,100);

  // PLAYERS
  [player1,player2].forEach(p=>{
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x,p.y,p.radius,0,Math.PI*2);
    ctx.fill();
  });

  // BALL
  ctx.fillStyle="white";
  ctx.beginPath();
  ctx.arc(ball.x,ball.y,ball.radius,0,Math.PI*2);
  ctx.fill();
}

// --- RESET BALL ---
function resetBall(){
  ball.x = canvas.width/2;
  ball.y = canvas.height/2;
  ball.dx = ball.dy = 0;
}

// --- MAIN LOOP ---
function loop(){
  update();
  draw();
  requestAnimationFrame(loop);
}
loop();
