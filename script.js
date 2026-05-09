import * as THREE from 'three';

// Images for the frames
const images = [
  'image1.png', // Replace with your image
  'image2.png', // Replace with your image
  'image3.png'  // Replace with your image
];

// Setup Scene
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x0f0a10, 0.05);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 5);

const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.getElementById('canvas-container').appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

// Particles
const particlesGeometry = new THREE.BufferGeometry();
const particlesCount = 2000;
const posArray = new Float32Array(particlesCount * 3);

for(let i = 0; i < particlesCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 20;
}
particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
const particlesMaterial = new THREE.PointsMaterial({
    size: 0.02,
    color: 0xf8c8dc,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending
});
const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particlesMesh);

// Create Photo Frames
const frames = [];
const textureLoader = new THREE.TextureLoader();

const framePositions = [
  { x: -2, y: 0, z: -2 },
  { x: 2, y: -2, z: -4 },
  { x: -1.5, y: -4, z: -6 },
];

images.forEach((imgSrc, index) => {
  textureLoader.load(imgSrc, (texture) => {
    // Determine aspect ratio
    const aspect = texture.image.width / texture.image.height;
    let width = 2;
    let height = 2 / aspect;

    const geometry = new THREE.PlaneGeometry(width, height);
    const material = new THREE.MeshStandardMaterial({ 
      map: texture,
      side: THREE.DoubleSide,
      roughness: 0.4,
      metalness: 0.1
    });

    const mesh = new THREE.Mesh(geometry, material);
    
    // Add a border frame
    const borderGeo = new THREE.PlaneGeometry(width + 0.1, height + 0.1);
    const borderMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1, metalness: 0.8 });
    const borderMesh = new THREE.Mesh(borderGeo, borderMat);
    borderMesh.position.z = -0.01;
    mesh.add(borderMesh);

    const pos = framePositions[index % framePositions.length];
    mesh.position.set(pos.x, pos.y, pos.z);
    
    // Slight random rotation
    mesh.rotation.y = (Math.random() - 0.5) * 0.5;
    mesh.rotation.z = (Math.random() - 0.5) * 0.2;

    scene.add(mesh);
    frames.push(mesh);
  }, undefined, (err) => {
      console.warn("Could not load image: " + imgSrc + ". Using placeholder material.");
      const geometry = new THREE.PlaneGeometry(2, 2.5);
      const material = new THREE.MeshStandardMaterial({ color: 0x444444 });
      const mesh = new THREE.Mesh(geometry, material);
      
      const borderGeo = new THREE.PlaneGeometry(2.1, 2.6);
      const borderMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1, metalness: 0.8 });
      const borderMesh = new THREE.Mesh(borderGeo, borderMat);
      borderMesh.position.z = -0.01;
      mesh.add(borderMesh);

      const pos = framePositions[index % framePositions.length];
      mesh.position.set(pos.x, pos.y, pos.z);
      
      mesh.rotation.y = (Math.random() - 0.5) * 0.5;
      mesh.rotation.z = (Math.random() - 0.5) * 0.2;

      scene.add(mesh);
      frames.push(mesh);
  });
});

// Scroll Animation Setup
gsap.registerPlugin(ScrollTrigger);

// Animate text blocks
gsap.utils.toArray('.text-block').forEach(block => {
  gsap.to(block, {
    scrollTrigger: {
      trigger: block,
      start: "top 80%",
      end: "bottom 20%",
      toggleActions: "play reverse play reverse"
    },
    y: 0,
    opacity: 1,
    duration: 1,
    ease: "power3.out"
  });
});

// Animate camera and scene objects on scroll
const tl = gsap.timeline({
  scrollTrigger: {
    trigger: "body",
    start: "top top",
    end: "bottom bottom",
    scrub: 1
  }
});

tl.to(camera.position, {
  y: -6,
  z: -2,
  ease: "none"
}, 0);

tl.to(particlesMesh.rotation, {
  y: Math.PI * 0.5,
  ease: "none"
}, 0);

// Mouse movement effect (Parallax)
let mouseX = 0;
let mouseY = 0;
let targetX = 0;
let targetY = 0;

const windowHalfX = window.innerWidth / 2;
const windowHalfY = window.innerHeight / 2;

document.addEventListener('mousemove', (event) => {
  mouseX = (event.clientX - windowHalfX) * 0.001;
  mouseY = (event.clientY - windowHalfY) * 0.001;
});

// Animation Loop
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const elapsedTime = clock.getElapsedTime();

  targetX = mouseX * 0.5;
  targetY = mouseY * 0.5;

  camera.rotation.y += 0.05 * (targetX - camera.rotation.y);
  camera.rotation.x += 0.05 * (targetY - camera.rotation.x);

  // Gentle float for frames
  frames.forEach((frame, idx) => {
    frame.position.y += Math.sin(elapsedTime + idx) * 0.002;
    frame.rotation.z += Math.cos(elapsedTime + idx) * 0.0005;
  });

  particlesMesh.rotation.x += 0.0005;
  particlesMesh.rotation.y += 0.0005;

  renderer.render(scene, camera);
}

animate();

// Resize handler
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
