import './style.css';

import {lightController, emissionController, hexToRgb} from "./ligth"

import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';



/**
 * General THREE.JS Config:
 */

const threeCanvas = document.querySelector('canvas.three')
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
const scene = new THREE.Scene()
const renderer = new THREE.WebGLRenderer( { canvas: threeCanvas, antialias: true, alpha: true } )

renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setClearColor( 0x000000, 0.9 );  // transparent background
scene.add(camera)
camera.position.set(9, 5.5, 9)

const controls = new OrbitControls(camera, threeCanvas)
controls.enableDamping = true  // smooth movement
controls.enablePan = false  // disable movement by RMB
controls.dampingFactor = 0.01
controls.rotateSpeed = 0.5
controls.panSpeed = 0.5
controls.target.set(0, 0, 0)

const gltfLoader = new GLTFLoader()  // assets loader



/**
 * Important Event Listeners: 
 */

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

controls.addEventListener('change', function () {
    const minCameraY = 2;  // Minimum height the camera can go (in the Y-axis).
    const maxCameraDistance = 14;  // Maximum distance between the camera and the target point.
    if (camera.position.y < minCameraY) {
      camera.position.y = minCameraY;
    }
    // Calculate the vector from the camera's position to the controls' target point.
    const cameraToTarget = new THREE.Vector3().subVectors(camera.position, controls.target);
    if (cameraToTarget.length() > maxCameraDistance) {
        // If the distance is too large, move the camera closer to the target point while maintaining the same direction.
        camera.position.copy(controls.target).addScaledVector(cameraToTarget.normalize(), maxCameraDistance);
    }
});



/**
 * Some control functions:
 */

// Recursively generates a tree-like representation of a THREE.js scene (or group) and its children.
const getSceneTree = (scene, separator = "") => {
    let sceneTree = ""
    sceneTree += separator+scene.name
    separator += "  "
    scene.children.forEach((child) => {sceneTree += "\n"+getSceneTree(child, separator)})
    return sceneTree
}



/**
 * Load isometric:
 */

// Load gltf isometric from 'root/static/CoffeeHouse Isometric.glb'
const coffeeIsometricUrl = new URL('../static/CoffeeHouse Isometric.glb', import.meta.url)
const coffeeIsometricLoader = new Promise((resolve, reject) => gltfLoader.load(
    coffeeIsometricUrl.href,  // url
    gltf => resolve(gltf),  // onLoad
    event => console.log((event.loaded/event.loaded)*100 + "% of Isometric loaded"),  // onProcess
    error => reject(error)  // onError
));
const coffeeIsometricScene = (await coffeeIsometricLoader).scene  // synchronously wait for loading

// console.log(getSceneTree(coffeeIsometricScene))
// console.log(coffeeIsometricScene)
scene.add(coffeeIsometricScene)



/**
 * Add Lights:
 */

const lampLight = new THREE.PointLight( 0xFFD36C, 0.2)  // yellow light lamp 
const lampHelper = new THREE.PointLightHelper(lampLight, 1)
const spotLight1 = new THREE.SpotLight(0xA0FFFF, 1)  // red behind arealight
const spotHelper1 = new THREE.SpotLightHelper(spotLight1, 0xFFFFFF)
const spotLight2 = new THREE.SpotLight(0xA0FFFF, 1)  // red front arealight
const spotHelper2 = new THREE.SpotLightHelper(spotLight2, 0xFFFFFF)

lampLight.position.set(-2.8, 5, 2.6)
lampLight.scale.set(0.5,0.5,0.5)
spotLight1.position.set(-7,7,-7)
spotLight1.lookAt(0,0,0)
spotLight1.penumbra = 1
spotLight1.distance = 20
spotLight2.position.set(7,7,-7)
spotLight2.lookAt(0,0,0)
spotLight2.penumbra = 1
spotLight2.distance = 20


coffeeIsometricScene.add(lampLight)
coffeeIsometricScene.add(spotLight1)
coffeeIsometricScene.add(spotLight2)



/**
 * Add Light Controllers:
 */

const lampController = lightController([lampLight])  // light controller for lamp light
const lampEmission = emissionController([coffeeIsometricScene.children[7].children[1]])  // emissive controller
const lampColorPicker = document.querySelector('input#co-lamp')  // <input color> for Lamp Light
const lampIntensityPicker = document.querySelector('input#in-lamp')  // <input> for Lamp Light

const spotController = lightController([spotLight1, spotLight2])  // light controller for env light
const spotColorPicker = document.querySelector('input#co-env')  // <input color> for env Light 
const spotIntensityPicker = document.querySelector('input#in-env')  // <input> for env Light

const windowController = emissionController([coffeeIsometricScene.children[4].children[1]])  // emissive con. for windows and door
const windowColorPicker = document.querySelector('input#co-window')  // <input color> for window light
const windowIntensityPicker = document.querySelector('input#in-window')  // <input> for window light

lampColorPicker.addEventListener('input', lampController)
lampIntensityPicker.addEventListener('input', lampController)
lampColorPicker.addEventListener('input', lampEmission)
lampIntensityPicker.addEventListener('input', lampEmission)

spotColorPicker.addEventListener('input', spotController)
spotIntensityPicker.addEventListener('input', spotController)

windowColorPicker.addEventListener('input', windowController)
windowIntensityPicker.addEventListener('input', windowController)

coffeeIsometricScene.children[7].children[1].material.emissiveIntensity = 0.2
coffeeIsometricScene.children[4].children[1].material.emissiveIntensity = 0.5


 /**
 * Animate:
 */

 const clock = new THREE.Clock()
 let lastElapsedTime = 0
 
 const tick = () =>
 {
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - lastElapsedTime
    lastElapsedTime = elapsedTime
     // Update controls
    controls.update()

    coffeeIsometricScene.rotation.y += 0.005

     // Render
    renderer.render(scene, camera)
 
     // Call tick again on the next frame
    window.requestAnimationFrame(tick)
 }
 
 console.log("Start Render.")
 tick()