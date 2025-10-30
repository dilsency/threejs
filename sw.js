// Change this to your repository name
// changed from '/threejs' to just ''
var GHPATH = '';
 
// Choose a different app prefix name
var APP_PREFIX = 'gppwa_';
 
// The version of the cache. Every time you change any of the files
// you need to change this version (version_01, version_02…). 
// If you don't change the version, the service worker will give your
// users the old files!
var VERSION = 'version_00';
 
// The files to make available for offline use. make sure to add 
// others to this list
var URLS = [    
  `${GHPATH}/`,
  `${GHPATH}/index.html`,
  `${GHPATH}/main.js`,

  `${GHPATH}/models/Dodecahedron.obj`,
  `${GHPATH}/models/Icosahedron.gltf`,
  `${GHPATH}/models/Icosahedron.obj`,

  `${GHPATH}/textures/bunny_thickness_2.jpg`,
  `${GHPATH}/textures/bunny_thickness.jpg`,
  `${GHPATH}/textures/texture_default.jpg`,
  `${GHPATH}/textures/white.jpg`,

  `${GHPATH}/textures/cube/skybox/nx.png`,
  `${GHPATH}/textures/cube/skybox/ny.png`,
  `${GHPATH}/textures/cube/skybox/nz.png`,
  `${GHPATH}/textures/cube/skybox/px.png`,
  `${GHPATH}/textures/cube/skybox/py.png`,
  `${GHPATH}/textures/cube/skybox/pz.png`,

  `${GHPATH}/shaders/fragment1.js`,
  `${GHPATH}/shaders/vertex1.js`,

  `${GHPATH}/helpers/helper_camera_rotation.js`,
  `${GHPATH}/helpers/helper_generation_hud.js`,
  `${GHPATH}/helpers/helper_generation_planet.js`,
  `${GHPATH}/helpers/helper_mesh.js`,

  `${GHPATH}/img/icon.png`,
  `${GHPATH}/css/styles.css`,
  `${GHPATH}/js/app.js`
]