import * as THREE from "three";
import { images, titles } from "./constants";
import { Reflector } from "three/examples/jsm/Addons.js";
import { Tween, Easing, update as UpdateTween } from "tween";

const textureLoader = new THREE.TextureLoader();
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animate);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const rootNode = new THREE.Object3D();
scene.add(rootNode);

const leftArrowTexture = textureLoader.load("left.png");
const rightArrowTexture = textureLoader.load("right.png");

let count = images.length;
for (let i = 0; i < count; i++) {
  const texture = textureLoader.load(images[i]);
  
  texture.colorSpace = THREE.SRGBColorSpace;
  const baseNode = new THREE.Object3D();

  // Adjust the rotation so that images follow a circular path correctly
  baseNode.rotation.y = i * ((2 * Math.PI) / count);
  rootNode.add(baseNode);

  // Create the border mesh
  const border = new THREE.Mesh(
    new THREE.BoxGeometry(3.2, 2.2, 0.09),
    new THREE.MeshStandardMaterial({ color: 0x202020 })
  );
  border.name = `Border_${i}`;
  border.position.z = -4;
  baseNode.add(border);

  // Create the artwork mesh
  const artwork = new THREE.Mesh(
    new THREE.BoxGeometry(3, 2, 0.1),
    new THREE.MeshStandardMaterial({ map: texture })
  );

  artwork.name = `Art_${i}`;
  artwork.position.z = -4;
  baseNode.add(artwork);

  // Left arrow mesh
  const leftArrow = new THREE.Mesh(
    new THREE.BoxGeometry(0.3, 0.3, 0.01),
    new THREE.MeshStandardMaterial({ map: leftArrowTexture, transparent: true })
  );
  leftArrow.name = `LeftArrow`;
  leftArrow.position.set(-1.8, 0, -4);
  baseNode.add(leftArrow);

  // Right arrow mesh
  const rightArrow = new THREE.Mesh(
    new THREE.BoxGeometry(0.3, 0.3, 0.01),
    new THREE.MeshStandardMaterial({
      map: rightArrowTexture,
      transparent: true,
    })
  );
  rightArrow.name = `RightArrow`;
  rightArrow.position.set(1.8, 0, -4);
  baseNode.add(rightArrow);
}

const spotlight = new THREE.SpotLight(0xffffff, 100.0, 10.0, 0.7, 1);
spotlight.position.set(0, 5, 0);
spotlight.target.position.set(0, 1, -5);
scene.add(spotlight);
scene.add(spotlight.target);

const mirror = new Reflector(new THREE.CircleGeometry(10), {
  color: 0x303030,
  textureWidth: window.innerWidth,
  textureHeight: window.innerHeight,
});

mirror.position.y = -1.1;
mirror.rotateX(-Math.PI / 2);
scene.add(mirror);

let currentIndex = 0;
function rotateGallery(direction) {
  if (direction === 1) {
    currentIndex = currentIndex === 5 ? currentIndex + 1 : currentIndex + 1;
  } else if (direction === - 1) {
    currentIndex = currentIndex === 0 ? currentIndex - 1 : currentIndex - 1;
  }
  // Calculate the target angle for the next image
  const targetAngle = (currentIndex * (2 * Math.PI)) / count;

  console.log("Current visible image index:", currentIndex);

  // Animate the rotation to the next image smoothly
  new Tween(rootNode.rotation)
    .to({ y: targetAngle })
    .easing(Easing.Circular.InOut)
    .start();
}

function animate() {
  // Update any ongoing tweens
  UpdateTween();
  renderer.render(scene, camera);
}

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

window.addEventListener("click", (e) => {
  const raycaster = new THREE.Raycaster();

  // Convert mouse position to normalized device coordinates
  const mouseNDC = new THREE.Vector2(
    (e.clientX / window.innerWidth) * 2 - 1,
    -(e.clientY / window.innerHeight) * 2 + 1
  );

  // Set the raycaster direction from the camera's perspective
  raycaster.setFromCamera(mouseNDC, camera);

  // Find intersections with the rootNode (image carousel)
  const intersections = raycaster.intersectObject(rootNode, true);
  if (intersections.length > 0) {
    if (intersections[0].object.name === "LeftArrow") {
      rotateGallery(-1); // Move to the previous image
    } else if (intersections[0].object.name === "RightArrow") {
      rotateGallery(1); // Move to the next image
    }
  }
});
