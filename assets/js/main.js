import * as THREE from './three.module.js';
import { OrbitControls } from './controls/OrbitControls.js';
import { TextureLoader } from './three.module.js';

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
var renderer = new THREE.WebGLRenderer({ alpha: true });

renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('solarSystem').appendChild(renderer.domElement);

var textureLoader = new TextureLoader();
var sunTexture = textureLoader.load("assets/img/sun-texture.jpg");

var sun = new THREE.Mesh(new THREE.SphereGeometry(5, 32, 32), new THREE.MeshBasicMaterial({ map: sunTexture }));
scene.add(sun);

camera.position.y = 30;
camera.position.z = 0;
camera.position.x = 50;
camera.lookAt(scene.position);

var planetData = [
  {name: 'Sun', color: 0xffff00, distance: 0, speed: 0, size: 5},
  {name: 'Mercury', color: 0x8a8a8a, distance: 10, speed: 0.415, size: 1},
  {name: 'Venus', color: 0xffa500, distance: 15, speed: 0.162, size: 1.5},
  {name: 'Earth', color: 0x0000ff, distance: 20, speed: 0.100, size: 1.3},
  {name: 'Mars', color: 0xff0000, distance: 30, speed: 0.053, size: 1},
  {name: 'Jupiter', color: 0xdaa520, distance: 50, speed: 0.0084, size: 2},
  {name: 'Saturn', color: 0xb8860b, distance: 80, speed: 0.00339, size: 1.5},
  {name: 'Uranus', color: 0x40e0d0, distance: 110, speed: 0.00119, size: 1.8},
  {name: 'Neptune', color: 0x000080, distance: 140, speed: 0.000607, size: 1},
];

var planets = [];

function redirectToPlanetPage(planetName) {
  const planetPageURL = `planets/${planetName}.html`;
  window.location.href = planetPageURL;
}

planetData.forEach(data => {
  var geometry = new THREE.SphereGeometry(data.size, 32, 32);
  var material = new THREE.MeshBasicMaterial({ color: data.color });
  var planet = new THREE.Mesh(geometry, material);
  planet.position.x = data.distance;

  var orbitGeometry = new THREE.RingGeometry(data.distance-0.05, data.distance+0.1, 64);
  var orbitMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, side: THREE.DoubleSide });
  var orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
  orbit.rotation.x = Math.PI / 2;

  scene.add(planet);
  scene.add(orbit);

  var canvas = document.createElement('canvas');
  var context = canvas.getContext('2d');
  context.font = '72px Arial';
  context.fillStyle = 'white';
  context.fillText(data.name, 10, 50);
  
  var texture = new THREE.Texture(canvas);
  texture.needsUpdate = true;
  
  var spriteMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true });
  var sprite = new THREE.Sprite(spriteMaterial);
  sprite.scale.set(5, 2.5, 1);
  sprite.position.set(data.distance, data.size + 2, 0);

  scene.add(sprite);

  planet.userData = { planetName: data.name };

  planets.push({
    mesh: planet,
    distance: data.distance,
    speed: data.speed,
    label: sprite
  });
});

document.addEventListener('click', (event) => {
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects(scene.children);

  if (intersects.length > 0) {
    const object = intersects[0].object;
    
    if (object.userData && object.userData.planetName) {
      const planetName = object.userData.planetName;
      redirectToPlanetPage(planetName);
    }
  }
});

var controls = new OrbitControls(camera, renderer.domElement);

var animate = function () {
  requestAnimationFrame(animate);

  sun.rotation.x += 0.005;
  sun.rotation.y += 0.005;

  planets.forEach(planet => {
    planet.mesh.position.x = planet.distance * Math.sin(planet.speed * performance.now() * 0.001);
    planet.mesh.position.z = planet.distance * Math.cos(planet.speed * performance.now() * 0.001);
    planet.label.position.x = planet.mesh.position.x;
    planet.label.position.z = planet.mesh.position.z;
    planet.label.position.y = planet.mesh.position.y + planet.mesh.geometry.parameters.radius + 2;
  });

  controls.update();
  renderer.render(scene, camera);
};

animate();

window.addEventListener('resize', function(){
  var width = window.innerWidth;
  var height = window.innerHeight;
  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
});
