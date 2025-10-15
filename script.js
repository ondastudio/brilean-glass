import * as THREE from 'three'
import GUI from 'lil-gui'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

//Debug
const gui = new GUI()

//Canvas
const canvas = document.querySelector('canvas.webgl')

//Scene
const scene = new THREE.Scene()

//Sizes
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

//Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height)
camera.position.z = 3
camera.position.y= 1
camera.position.x= 5
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * MeshPhysicalMaterial
 */

// // Base material 
// const material = new THREE.MeshPhysicalMaterial()
// material.metalness = 0
// material.roughness = 0.15


// gui.add(material, 'metalness').min(0).max(1).step(0.0001)
// gui.add(material, 'roughness').min(0).max(1).step(0.0001)


// // Transmission
// material.transmission = 1
// material.ior = 1.5
// material.thickness = 0.5

// gui.add(material, 'transmission').min(0).max(1).step(0.0001)
// gui.add(material, 'ior').min(1).max(10).step(0.0001)
// gui.add(material, 'thickness').min(0).max(1).step(0.0001)


/**
 * Adding light to the scene
 */
// // Ambient light
// const ambientLight = new THREE.AmbientLight(0xf0000, 1)
// scene.add(ambientLight)

// // Directional light
// const directionalLight = new THREE.DirectionalLight(0xffffff, 10)
// directionalLight.position.set(7, 7, 7)

// scene.add(directionalLight)


// // GUI controls
// const lightFolder = gui.addFolder('Lights')

// // Ambient controls
// lightFolder.add(ambientLight, 'intensity').min(0).max(5).step(0.01).name('Ambient intensity')
// lightFolder.addColor({ color: ambientLight.color.getHex() }, 'color').onChange((value) => {
//   ambientLight.color.set(value)
// })

// // Directional controls
// lightFolder.add(directionalLight, 'intensity').min(0).max(5).step(0.01).name('Directional intensity')
// lightFolder.add(directionalLight.position, 'x').min(-10).max(10).step(0.1).name('DirLight X')
// lightFolder.add(directionalLight.position, 'y').min(-10).max(10).step(0.1).name('DirLight Y')
// lightFolder.add(directionalLight.position, 'z').min(-10).max(10).step(0.1).name('DirLight Z')
// lightFolder.addColor({ color: directionalLight.color.getHex() }, 'color').onChange((value) => {
//   directionalLight.color.set(value)
// })


/**
 * HDR Image
 */

scene.background = new THREE.Color(0xf2f2f2) // default background color

// scene.background = new THREE.Color(0xF1FF66) // white

// const rgbeLoader = new RGBELoader()
// rgbeLoader.load('static/2k.hdr', (texture) => {
//     texture.mapping = THREE.EquirectangularReflectionMapping

//     // scene.environment = texture     // reflections
//     // scene.background = texture      // optional background

//     // Only used for reflections/lights
//     scene.environment = texture
// })

const rgbeLoader = new RGBELoader()
let hdrTexture = null

rgbeLoader.load('static/2k.hdr', (texture) => {
  texture.mapping = THREE.EquirectangularReflectionMapping
  scene.environment = texture // always used for reflections
  hdrTexture = texture
})


const material = new THREE.MeshPhysicalMaterial({
  transmission: 1,     // makes it transparent (newer alternative to opacity)
  thickness: 1,      // how thick the glass looks
  roughness: 0.05,     // smoother = clearer reflections
  metalness: 0,        // usually 0 for glass
  ior: 1.5,            // Index of Refraction (like Blender)
  envMapIntensity: 1.5, // boost reflections
  transparent: true,
  opacity: 0.6,
  //forceSinglePass: true 
})

material.transparent = true
material.opacity = 0.6

//Model -- load the star
const gltfLoader = new GLTFLoader();

gltfLoader.load(
    'static/star_simple_lights.glb', (gltf) => {
        gltf.scene.traverse((child) => {
            child.material = material
        })
        scene.add(gltf.scene);
    }
)

//Renderer
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
})
renderer.setSize(sizes.width, sizes.height)

/**
 * GUI Controls
 */
const options = {
  background: 'White',
  useHDRBackground: false
}

const backgroundColors = {
  White: 0xf2f2f2,
  Yellow: 0xF1FF66,
  Black: 0x1A1918
}

const envFolder = gui.addFolder('Environment')

envFolder
  .add(options, 'background', ['White', 'Yellow', 'Black'])
  .name('Background Color')
  .onChange((value) => {
    if (!options.useHDRBackground) {
      scene.background = new THREE.Color(backgroundColors[value])
    }
  })

envFolder
  .add(options, 'useHDRBackground')
  .name('Show HDR Background')
  .onChange((value) => {
    if (hdrTexture) {
      scene.background = value
        ? hdrTexture
        : new THREE.Color(backgroundColors[options.background])
    }
  })



// Animate -- interate with it 
const clock = new THREE.Clock()

const tick = () => {
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera) //so it waits until the object is loaded, otherwise i would have to add it inside the gltfLoader function

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()