// --- SCENE SETUP ---
let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
let renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// --- FIELD ---
let field = new THREE.Mesh(
    new THREE.PlaneGeometry(60,35),
    new THREE.MeshBasicMaterial({color:0x1f7a1f})
);
field.rotation.x = -Math.PI/2;
scene.add(field);

// Walls
function createWall(x,y,z,w,h,d){
    let wall = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), new THREE.MeshBasicMaterial({color:0x555555}));
    wall.position.set(x,y,z);
    scene.add(wall);
}
createWall(0,2.5,-17,50,5,1); // top
createWall(0,2.5,17,50,5,1);  // bottom
createWall(-30,2.5,0,1,5,35); // left
createWall(30,2.5,0,1,5,35);  // right

// --- BALL ---
let ball = new THREE.Mesh(
    new THREE.SphereGeometry(0.5,32,32),
    new THREE.MeshBasicMaterial({color:0xffffff})
);
ball.position.set(0,0.5,0);
scene.add(ball);
let ballVelocity = new THREE.Vector3(0,0,0);

// --- CARS ---
function createCar(color,x,z){
    let car = new THREE.Mesh(
        new THREE.BoxGeometry(1,1,2),
        new THREE.MeshBasicMaterial({color:color})
    );
    car.position.set(x,0.5,z);
    scene.add(car);
    return car;
}
let car1 = createCar(0x0000ff, -10, 0);
let car2 = createCar(0xff0000, 10, 0);

let car1Velocity = new THREE.Vector3();
let car2Velocity = new THREE.Vector3();

// --- BOOST PADS ---
let boosts = [];
function createBoost(x,z){
    let b = new THREE.Mesh(
        new THREE.CylinderGeometry(0.5,0.5,0.2,32),
        new THREE.MeshBasicMaterial({color:0xffff00})
    );
    b.position.set(x,0.1,z);
    scene.add(b);
    boosts.push({mesh:b, active:true});
}
createBoost(-15,0);
createBoost(15,0);
createBoost(0,10);
createBoost(0,-10);

// --- INPUT HANDLING ---
let keys = {};
window.addEventListener('keydown', e => keys[e.key.toLowerCase()] = true);
window.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);

// --- SCORING ---
let score1 = 0, score2 = 0;

// --- PHYSICS & CONTROLS ---
function updatePhysics(){
    const speed = 0.25;
    const jump = 0.2;

    // Car1 Controls WASD, Space jump, Shift boost
    if(keys['w']) car1.position.z -= speed;
    if(keys['s']) car1.position.z += speed;
    if(keys['a']) car1.position.x -= speed;
    if(keys['d']) car1.position.x += speed;
    if(keys[' ']) car1.position.y += jump;
    if(keys['shift']) car1.position.z -= speed*2;

    // Car2 Controls Arrow keys, Up jump, Right boost
    if(keys['arrowup']) car2.position.z -= speed;
    if(keys['arrowdown']) car2.position.z += speed;
    if(keys['arrowleft']) car2.position.x -= speed;
    if(keys['arrowright']) car2.position.z -= speed*2;
    if(keys['enter']) car2.position.y += jump;

    // Car-ball collision
    [car1, car2].forEach(car=>{
        let dist = car.position.distanceTo(ball.position);
        if(dist < 1.5){
            let dir = new THREE.Vector3().subVectors(ball.position, car.position).normalize();
            ballVelocity.add(dir.multiplyScalar(0.35));
        }
    });

    // Ball physics
    ball.position.add(ballVelocity);
    ballVelocity.multiplyScalar(0.95);
    if(ball.position.y > 0.5) ballVelocity.y -= 0.01; // gravity
    if(ball.position.y < 0.5) ball.position.y = 0.5;

    // Wall collision
    if(ball.position.x>29 || ball.position.x<-29) ballVelocity.x *= -1;
    if(ball.position.z>16 || ball.position.z<-16) ballVelocity.z *= -1;

    // Boost pad collision
    boosts.forEach(b=>{
        if(b.active && car1.position.distanceTo(b.mesh.position)<2){
            car1Velocity.z -= 0.5; b.active=false;
        }
        if(b.active && car2.position.distanceTo(b.mesh.position)<2){
            car2Velocity.z += 0.5; b.active=false;
        }
    });

    // Goal detection
    if(ball.position.z>16 && Math.abs(ball.position.x)<5){
        score1++; resetBall();
    }
    if(ball.position.z<-16 && Math.abs(ball.position.x)<5){
        score2++; resetBall();
    }
    document.getElementById('score').innerText = score1 + " : " + score2;
}

function resetBall(){
    ball.position.set(0,0.5,0);
    ballVelocity.set(0,0,0);
}

// --- CAMERA ---
function updateCamera(){
    camera.position.x = car1.position.x;
    camera.position.z = car1.position.z + 15;
    camera.position.y = car1.position.y + 10;
    camera.lookAt(car1.position);
}

// --- ANIMATION LOOP ---
function animate(){
    requestAnimationFrame(animate);
    updatePhysics();
    updateCamera();
    renderer.render(scene,camera);
}
animate();
