import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { MeshSurfaceSampler } from "three/examples/jsm/math/MeshSurfaceSampler";
import * as TWEEN from '@tweenjs/tween.js';

let buttonsCtn = document.getElementById('buttons');
for (let i = 0; i < buttonsCtn.children.length; i++) {
  buttonsCtn.children[i].addEventListener('click', changeGeometry);
}

function changeGeometry(e) {
  let newGeometry = e.srcElement.getAttribute('data-geometry');

  switch (newGeometry) {
    case 'box':
      instStart = instFinish;
      instFinish = instBox;
      tween.start();
      break;
    case 'sphere':
      instStart = instFinish;
      instFinish = instSphere;
      tween.start();
      break;
    case 'torusknot':
      instStart = instFinish;
      instFinish = instTorusKnot;
      tween.start();
      break;
    default:
      console.log('default');
      break;
  }
}

let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 100);
camera.position.set(2, -1.5, 3).setLength(3);
camera.lookAt(scene.position)
let renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);

let controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

let light = new THREE.DirectionalLight(0xffffff, 0.5);
light.position.setScalar(1);
scene.add(light, new THREE.AmbientLight(0xffffff, 0.5));

let instStart = [];
let instFinish = [];
let instancedMesh;
let instBox = [];
let instSphere = [];
let instTorusKnot = [];

let samplerSphere = new MeshSurfaceSampler(new THREE.Mesh(new THREE.SphereGeometry(1))).build();
let samplerBox = new MeshSurfaceSampler(new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2))).build();
let samplerTorusKnot = new MeshSurfaceSampler(new THREE.Mesh(new THREE.TorusKnotGeometry(0.5, 0.2))).build();

let MAX_COUNT = 10000;
instancedMesh = new THREE.InstancedMesh(
  new THREE.BoxGeometry(0.01, 0.01, 0.01),
  new THREE.MeshStandardMaterial({
    color: 0xff88cc,
  }), MAX_COUNT);

let v = new THREE.Vector3();
let d = new THREE.Object3D();
const instObj = new Array(MAX_COUNT).fill(new THREE.Object3D());

for (let idx = 0; idx < MAX_COUNT; idx++) {
  samplerBox.sample(v);
  instBox.push(v.clone());

  samplerSphere.sample(v);
  instSphere.push(v.clone());

  samplerTorusKnot.sample(v);
  instTorusKnot.push(v.clone());

  // default
  d.position.copy(v.clone());
  d.updateMatrix();
  instancedMesh.setMatrixAt(idx, d.matrix);
};

instStart = instTorusKnot;
instFinish = instTorusKnot;
scene.add(instancedMesh);

let tween = new TWEEN.Tween({ val: 0 }).to({ val: 1 }, 1300)
  .onUpdate(val => {
    instObj.forEach((o, idx) => {
      o.position.lerpVectors(instStart[idx], instFinish[idx], val.val);
      o.updateMatrix();
      instancedMesh.setMatrixAt(idx, o.matrix);
    })
    instancedMesh.instanceMatrix.needsUpdate = true;
  });

renderer.setAnimationLoop(() => {
  controls.update();
  TWEEN.update();
  if (instancedMesh) instancedMesh.instanceMatrix.needsUpdate = true;
  renderer.render(scene, camera);
})

