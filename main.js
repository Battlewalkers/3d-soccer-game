// Scene, camera, renderer
let scene, camera, renderer;
let car1, car2, ball;
let car1Velocity = new THREE.Vector3();
let car2Velocity = new THREE.Vector3();
let ballVelocity = new THREE.Vector3();
let keys = {};
let score1 = 0, score2 = 0;

function init(){
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
    camera.position.set(0,20,25);

    renderer = new THREE.WebGLRenderer({antialias:true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Field
    let field = new THREE.Mesh(new THREE.PlaneGeometry(50,30), new THREE.MeshBasicMaterial({color:0x1f7a1f}));
    field.rotation.x = -Math.PI/2;
    scene.add(field);

    // Walls
    createWall(0,2.5,-15,50,5,1); // top
    createWall(0,2.5,15,50,5,1);  // bottom
    createWall(-25,2.5,0,1,5,30); // left
    createWall(25,2.5,0,1,5,30);  // right

    // Cars
    car1 = createCar(0x0000ff, -10, 0);
    car2 = createCar(0xff0000, 10, 0);

    // Ball
    ball = new THREE.Mesh(new THREE.SphereGeometry(0.5,32,32), new THREE.MeshBasicMaterial({color:0xffffff}));
    ball.position.set(0,0.5,0);
    scene.add(ball);

    // Keyboard events
    window.addEventListener('keydown', e => keys[e.key.toLowerCase()] = true);
    window.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);

    animate();
}

function createWall(x,y,z,w,h,d){
    let wall = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), new THREE.MeshBasicMaterial({color:0x555555}));
    wall.position.set(x,y,z);
    scene.add(wall);
    return wall;
}

function createCar(color,x,z){
    let car = new THREE.Mesh(new THREE.BoxGeometry(1,1,2), new THREE.MeshBasicMaterial({color:color}));
    car.position.set(x,0.5,z);
    scene.add(car);
    return car;
}

function updatePhysics(){
    let speed = 0.2;
    // Car 1 WASD, jump: space, boost: shift
    if(keys['w']) car1.position.z -= speed;
    if(keys['s']) car1.position.z += speed;
    if(keys['a']) car1.position.x -= speed;
    if(keys['d']) car1.position.x += speed;
    if(keys[' ']) car1.position.y += 0.15;
    if(keys['shift']) car1.position.z -= speed*2;

    // Car 2 arrow keys, jump: arrow up, boost: arrow right
    if(keys['arrowup']) car2.position.z -= speed;
    if(keys['arrowdown']) car2.position.z += speed;
    if(keys['arrowleft']) car2.position.x -= speed;
    if(keys['arrowright']) car2.position.z -= speed*2;

    // Ball collision
    for(let c of [car1, car2]){
        let dist = c.position.distanceTo(ball.position);
        if(dist < 1.5){
            let dir = new THREE.Vector3().subVectors(ball.position, c.position).normalize();
            ballVelocity.add(dir.multiplyScalar(0.3));
        }
    }

    // Ball physics
    ball.position.add(ballVelocity);
    ballVelocity.multiplyScalar(0.95);

    // Ball-wall collisions
    if(ball.position.x>24 || ball.position.x<-24) ballVelocity.x *= -1;
    if(ball.position.z>14 || ball.position.z<-14) ballVelocity.z *= -1;

    // Goals
    if(ball.position.z>14 && Math.abs(ball.position.x)<5){
        score1 += 1;
        document.getElementById('score').innerText = score1 + " : " + score2;
        ball.position.set(0,0.5,0);
        ballVelocity.set(0,0,0);
    }
    if(ball.position.z<-14 && Math.abs(ball.position.x)<5){
        score2 += 1;
        document.getElementById('score').innerText = score1 + " : " + score2;
        ball.position.set(0,0.5,0);
        ballVelocity.set(0,0,0);
    }
}

// Camera follow car1
function updateCamera(){
    camera.position.x = car1.position.x;
    camera.position.z = car1.position.z + 15;
    camera.lookAt(car1.position);
}

// Animate
function animate(){
    requestAnimationFrame(animate);
    updatePhysics();
    updateCamera();
    renderer.render(scene,camera);
}

init();
