// hold ctrl k then 0

// service worker: necessary for PWA
// must be placed first?
if (navigator.serviceWorker) {
    console.log("register service worker");
    navigator.serviceWorker.register (
        '/threejs/sw2.js',
        {scope: '/threejs/'}
    )
    .then(() => {
        console.log('Service Worker Registered');
        console.dir(navigator.serviceWorker);
        console.dir(navigator.serviceWorker.URLS);
        console.dir(navigator.serviceWorker.controller.URLS);

        const hasManifest = doesManifestExistForCurrentPage();
        if(hasManifest){console.log("has manifest");}
        else {console.log("no manifest, sorry");}

        console.dir(caches);
        
        caches.open('threejs').then((cache) => {
            console.log(" ");
            console.log("here is our threejs cache:");
            console.dir(cache);
            console.log(" ");
        });

    })
    ;
    }

window.addEventListener('beforeinstallprompt', (event) => {
  console.log("install prompt! should be a success, then?");
});

    // Source - https://stackoverflow.com/a
// Posted by Jeff Posnick
// Retrieved 2025-11-12, License - CC BY-SA 3.0

async function doesManifestExistForCurrentPage() {
  const manifestElement = document.querySelector('link[rel="manifest"]');
  if (!manifestElement) {
    return false;
  }
  const manifestUrl = manifestElement.getAttribute('href');
  if (!manifestElement) {
    return false;
  }

  // You could stop here and just return true.
  // If you want to actually see if the manifest file exists on the
  // server, use the following code:
  try {
    const manifestResponse = await fetch(manifestUrl);
    // .ok will be true if fetch() returned a HTTP 2xx response,
    // and false otherwise.
    return manifestResponse.ok;
  } catch (error) {
    // Or return true?
    // Depends on how you want to handle network failures.
    return false;
  }
}


import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';
import { VertexNormalsHelper } from 'three/addons/helpers/VertexNormalsHelper.js';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

import { extendMaterial } from '@callumacrae/utils/three-extend-material';//@callumacrae/utils/three-extend-material//https://mevedia.com/share/ExtendMaterial.js?vxx1

// visual studio code collapse all
// hold ctrl
// k then 0

import vertex1 from 'vertex1';
import fragment1 from 'fragment1';



import * as HelperCameraRotation from "helper_camera_rotation";
import * as HelperMesh from "helper_mesh";

import * as HelperGenerationHUD from "helper_generation_hud";

// hold ctrl k then 0

// bare minimum
var renderer;
var scene;
var cameraPivot;
var camera;
var cameraDirection;
var cameraPivotDirection;
var cameraFrustum;
// directions perpendicular to the forward direction of the camera
var cameraDirectionRight;
var cameraDirectionUp;

//
var isInIframe = false;
var boolFakePointerLocked = false;

//
var cameraFollower;// we will use this to lerp
var cameraRotationLerpX = 0;
var cameraRotationLerpY = 0;
var cameraRotationLerpZ = 0;
var cameraRotationLerpCount = 0;

// for smooth camera rotation
// that hopefully doesn't steal mouse input
var rotationMatrix = new THREE.Matrix4();
var rotationTargetQuaternion = new THREE.Quaternion();
var rotationTargetPosition = new THREE.Vector3(0,0,0);
var rotationSpeed = 1.0;// aka gravityDirectionRotationSpeed

//
var playerVelocityFromInput;
var playerVelocityFromInputDirection;
var playerVelocityFromGravity;

// camera gravity perpendiculars
// we move along these axes
var directionCameraGravityForward;
var directionCameraGravityRight;
// arrow helpers
var directionCameraGravityForwardArrowHelper;
var directionCameraGravityRightArrowHelper;

//
var indexTriangle = -1;
var indexSidePrev = null;
var indexSide = null;

// clock
var clock;
var clockDelta = 0;
var clockTimeElapsed = 0;

// lights
var light1;
var light2;

// will be used to load models
var loaderOBJ;
// will be used to load textures
var loaderTexture;
// may be useful to have a fallback texture
var defaultTexture;

//
var hasInit = false;

// group
var terrainObjectGroup;
var terrainObjectPlaneFloorHelperGroup;
var terrainObjectPlaneWallHelperGroup;
var cloudGroup;
var cloudMaterial;

// array that could have been a group
var terrainObjectPlaneFloorHelperArray = [];
var terrainObjectPlaneWallHelperArray = [];
var terrainObjectFloorArrowHelperArray = [];
var terrainObjectWallArrowHelperArray = [];
var terrainObjectCornerArrowHelperArray = [];

// bools for helpers
var boolShouldDrawHelpers = true;

// reference to terrain object once loaded
var terrainObject;
var terrainObjectPositionCount = 0;
var terrainObjectPositionItemSize = 1;

// vertex positions and normals, for convenience later
var terrainObjectVertexPositions = [];
var terrainObjectVertexNormals = [];

// triangle positions, triangle normals, and triangle planes, for convenience later
var terrainObjectTrianglePositions = [];
var terrainObjectTriangleNormals = [];
var terrainObjectFloorPlanes = [];
var terrainObjectTriangleSidePlanes = [];
const terrainObjectEdgePadding = 0.0;//1.0// will affect how far we need to go off of a plane before we start falling


//
const terrainObjectSidesWithTriangleIndeces = {};
var terrainObjectSidesWithTriangleIndecesCount = 0;
const terrainObjectSidesWithOuterWalls = {};
var terrainObjectCenterPoints = {};
var distanceToPlanetMin = null;

//
var playerHasPlanet = false;
var playerHasPlanetSide = false;

//
var playerStateGravity = -1;
var playerStateGravityPrev = -1;

//
var playerDistanceToPlanet = 0.0;
var playerDistanceToPlanetPrev = playerDistanceToPlanet;
var playerDistanceToFloor = 0.0;
var playerDistanceToFloorPrev = playerDistanceToFloor;

//
var playerIsAboveCurrentFloorPlane = true;
var playerIsAboveCurrentFloorPlanePrev = playerIsAboveCurrentFloorPlane;
var playerIsWithinAllOuterWalls = true;
var playerIsWithinAllOuterWallsPrev = playerIsWithinAllOuterWalls;

//
var arrayArrowHelpers = [];

// to be used
// to convert local-space normals to world-space normals
var normalMatrix = new THREE.Matrix3(); // create once and reuse
var worldNormal = new THREE.Vector3(); // create once and reuse

// earth and sky
var earthbox;
var skybox;

// terrain
const terrainColor = new THREE.Color("hsl(0,50%,80%)");

// hud
var hudReticle;
var hudReticleFill;
var hudReticleLines;

var hudTextControls;
var hudTextControlsDouble;
var hudTextStatus;
var hudTextStatusDouble;
var hudTextStack;
var hudTextStackDouble;

//
var boolTextControls = true;
const stringTextControls = [
    "[LeftClick]  to start\n\n[Escape]  to pause\n\n[W][A][S][D] to move\n\n[P]  to show/hide all controls",
    "[Spacebar]  to update gravity/up direction\nto the closest triangle's normal direction\nthough it will jarringly move the camera\n\n\n[Escape]  to unlock\n\n[W][A][S][D] to move\nperpendicular to current gravity\n\n[Q][E]  to move down/up\nalong camera's current up direction\n\n(tilting doesn't affect the\ncamera's up direction for some reason)\n\n[LeftArrow][RightArrow]  to manually\ntilt camera with camera.rotateZ()\n\n[Backspace]  to reset\n\n\n[1]  to teleport to center of triangle\n[2]  to .lookAt() center point\n\n[1]→[2]  will correctly\nunskew the camera\nto align with the current plane\nbut this feels like jank"
];

// controls
var keyboard = {};
var hasControls = false;

var isPlaying = false;

//
var mouseX = 0;
var mouseY = 0;

//
var playerInputPolarityForwardBackward = 0;
var playerInputPolarityLeftRight = 0;
var playerInputPolarityUpDown = 0;

// lerps
const gravityDirectionLerpSpeedMax = 64;
const gravityDirectionLerpSpeedMin1 = 24;
const gravityDirectionLerpSpeedMin2 = 8;

var gravityDirectionLerpOld;
var gravityDirectionLerpCountMax = gravityDirectionLerpSpeedMin2;
var gravityDirectionLerpCount = gravityDirectionLerpCountMax + 1;

// throttles
const throttleMaxAbility = 1.0;
var throttleAbility = 0;
const throttleMaxUpdateClosestGravityMax = 4.0;// used when far away from the planet; we do not want to check side as often
const throttleMaxUpdateClosestGravityMin = 0.2;// used when on the planet; we want to check often then
var throttleMaxUpdateClosestGravity = throttleMaxUpdateClosestGravityMax;
var throttleUpdateClosestGravity = 0;
const throttleMaxMoveGravity = 1.0;
var throttleMoveGravity = 0;
const throttleMaxCameraLerp = 0.1;
var throttleCameraLerp = 0;
const throttleMaxTextLog = 0.2;
var throttleTextLog = 0;
const throttleMaxSingleKey = 0.0;
var throttleSingleKey = 0;

//
const throttleMaxUniforms = 1.0;
var throttleUniforms = 0;

//
var cloudUniformArray = [];
var cloudMaterialArray = [];

//
init();
function init()
{
    function initBareMinimum()
    {
        //
        clock = new THREE.Clock();
        clock.start();

        //
        scene = new THREE.Scene();
        scene.environment = null;

        //
        cameraFollower = new THREE.Object3D();
        scene.add(cameraFollower);
        cameraPivot = new THREE.Object3D();
        cameraPivot.position.z = 5;
        scene.add(cameraPivot);
        camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

        // I think was just needed for OrbitControls, which we are not using
        //camera.up.set(0,0,1);
        camera.up.set(0,1,0);

        camera.updateProjectionMatrix();
        cameraPivot.add(camera);
        cameraDirection = new THREE.Vector3();
        cameraPivotDirection = new THREE.Vector3();
        cameraFrustum = new THREE.Frustum();
        
        // default cam values
        camera.getWorldDirection(cameraDirection);
        cameraPivot.getWorldDirection(cameraPivotDirection);
        cameraFrustum.setFromProjectionMatrix(camera.projectionMatrix);

        //
        gravityDirectionLerpOld = new THREE.Vector3();

        // camera forward perpendiculars
        cameraDirectionRight = new THREE.Vector3(1,0,0);
        cameraDirectionUp = new THREE.Vector3(0,1,0);

        // camera gravity perpendiculars
        // we move along these axes
        directionCameraGravityForward = new THREE.Vector3(0,1,0);
        directionCameraGravityRight = new THREE.Vector3(1,0,0);
        // arrow helpers
        directionCameraGravityForwardArrowHelper = new THREE.ArrowHelper(directionCameraGravityForward, new THREE.Vector3(0,0,0), 1.0, 0xFF0000);
        scene.add(directionCameraGravityForwardArrowHelper);
        directionCameraGravityRightArrowHelper = new THREE.ArrowHelper(directionCameraGravityForward, new THREE.Vector3(0,0,0), 1.0, 0xFFFF00);
        scene.add(directionCameraGravityRightArrowHelper);
        

        //
        renderer = new THREE.WebGLRenderer();
        renderer.setSize( window.innerWidth, window.innerHeight );
        document.body.appendChild( renderer.domElement );

        // if we are inside of an iframe
        // we cannot pointerlock
        // (well we could if a special attribute is set, but it is not in vs code)
        isInIframe = (window.self !== window.top);

        //
        playerVelocityFromInput = new THREE.Vector3(0,0,0);
        playerVelocityFromInputDirection = new THREE.Vector3(0,0,0);
        playerVelocityFromGravity = new THREE.Vector3(0,0,0);
    }
    function initLights()
    {
        //
        light1 = new THREE.AmbientLight(0x909090);

        //
        light2 = new THREE.DirectionalLight(0xFFFFFF, 1.0);
        light2.position.set(100,100,100);

        //
        scene.add(light1);
        scene.add(light2);
    }
    function initPlayer()
    {
    }
    function initClouds1()
    {
        //
        cloudGroup = new THREE.Group();
        scene.add(cloudGroup);

        //
        const propsUniform = {
            uTime: {type: "float", value: 0.0},
            map: { type: "t", value: defaultTexture},
            fresnelDegree: {type: "float", value: 2.0},
            diffuseColor: {type: "vec3", value: new THREE.Vector3(0.75,0.75,0.75)},
            fresnelColor: {type: "vec3", value: new THREE.Vector3(1.0,1.0,1.0)},
            cameraPivotPosition: {type: "vec3", value: new THREE.Vector3(0,0,0)},
        };
        cloudUniformArray[0] = {
            ...propsUniform,
            diffuseColor: {type: "vec3", value: new THREE.Vector3(0.75,0.5,0.5)},
            fresnelColor: {type: "vec3", value: new THREE.Vector3(0.45,0.2,0.2)},
            fresnelDegree: {type: "float", value: 1.8},
        };
        cloudUniformArray[2] = {
            ...propsUniform,
            diffuseColor: {type: "vec3", value: new THREE.Vector3(0.75,0.629,0.5)},
            fresnelColor: {type: "vec3", value: new THREE.Vector3(0.45,0.329,0.2)},
            fresnelDegree: {type: "float", value: 1.8},
        };
        cloudUniformArray[1] = {
            ...propsUniform,
            diffuseColor: {type: "vec3", value: new THREE.Vector3(0.75,0.75,0.5)},
            fresnelColor: {type: "vec3", value: new THREE.Vector3(0.45,0.45,0.2)},
            fresnelDegree: {type: "float", value: 1.8},
        };
        console.log(cloudUniformArray[0]);
        //cloud1Uniforms.cameraPivotPosition.value.copy(cameraPivot.position);

        const propsMaterial = {
            side: THREE.FrontSide,
            vertexShader: vertex1,
            fragmentShader: fragment1,
        };

        cloudMaterialArray[0] = new THREE.ShaderMaterial({
            ...propsMaterial,
            uniforms: cloudUniformArray[0],
        });
        cloudMaterialArray[1] = new THREE.ShaderMaterial({
            ...propsMaterial,
            uniforms: cloudUniformArray[1],
        });
        cloudMaterialArray[2] = new THREE.ShaderMaterial({
            ...propsMaterial,
            uniforms: cloudUniformArray[2],
        });
    }
    function initFallbackTexture()
    {
        // Load the fallback texture
        loaderTexture.load
        (
            // resource URL
            './textures/texture_default.jpg',
            // onLoad callback
            function (texture)
            {
                //
                defaultTexture = texture;
                defaultTexture.encoding = THREE.sRGBEncoding;
                console.log("default texture loaded!");
                console.log(defaultTexture);

                //
                initClouds2();
            },
            // onProgress callback, may or may not be supported
            // should in that case be replaced with
            // undefined,
            function (xhr)
            {
                console.log((xhr.loaded / xhr.total * 100) + '% loaded');
            },
            // onError callback
            function (err)
            {
                console.error('ERROR: loaderTexture');
                console.error(err);
            }
        );
    }
    function initEarthAndSky()
    {
        earthbox = new THREE.Mesh( new THREE.PlaneGeometry(200,200,1,1), new THREE.ShaderMaterial
        ({
            wireframe: false,
            side: THREE.FrontSide,
            uniforms: {
              color1: {
                value: new THREE.Color("#290D00")
              },
              color2: {
                value: new THREE.Color("#260A00")
              }
            },
            vertexShader: `
              varying vec2 vUv;
          
              void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
              }
            `,
            fragmentShader: `
                float rescale(float, float, float, float, float);

                uniform vec3 color1;
                uniform vec3 color2;
            
                varying vec2 vUv;

                vec3 col;
                float dist;
                
                void main() {
                    dist = distance(vUv, vec2(0.5f,0.5f));
                    dist = rescale(dist,0.0f,0.8f,0.0f,1.0f);

                    col = mix(color1,color2,dist);

                    gl_FragColor = vec4(col,1.0);
                }

                float rescale(float number, float minimumInputValue, float maximumInputValue, float minimumRescaledValue, float maximumRescaledValue)
                {
	                return minimumRescaledValue + (number - minimumInputValue) * (maximumRescaledValue - minimumRescaledValue) / (maximumInputValue - minimumInputValue);
                }
            `,
          })
        );
        earthbox.rotation.x += -Math.PI / 2;
        earthbox.position.y -= 50.0;
        //scene.add(earthbox);
        skybox = new THREE.Mesh( new THREE.ConeGeometry( 100, 100, 32, 1, true), new THREE.ShaderMaterial
        ({
            wireframe: false,
            side: THREE.BackSide,
            uniforms: {
              color1: {
                value: new THREE.Color("#290D00")
              },
              color2: {
                value: new THREE.Color("#0090C0")
              }
            },
            vertexShader: `
              varying vec2 vUv;
          
              void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
              }
            `,
            fragmentShader: `
              uniform vec3 color1;
              uniform vec3 color2;
            
              varying vec2 vUv;
              
              void main() {
                
                gl_FragColor = vec4(mix(color1, color2, vUv.y), 1.0);
              }
            `,
          })
         );
        //scene.add(skybox);
        const cubeTextureLoader = new THREE.CubeTextureLoader();
        cubeTextureLoader.setPath("textures/cube/skybox/");
        const textureCubeSkyBox = cubeTextureLoader.load
        (
            [
                "px.png", "nx.png",
                "py.png", "ny.png",
                "pz.png", "nz.png"
            ]
        );
        scene.background = textureCubeSkyBox;
    }
    function initClouds2()
    {
        //
        console.log("() init clouds 2");

        //


          cloudMaterial = extendMaterial(THREE.MeshStandardMaterial, {
      

            // Will be prepended to vertex and fragment code
      
            header: 'varying vec3 vNN; varying vec3 vEye;',
            fragmentHeader: 'uniform vec3 fresnelColor; uniform float fresnelDegree;',
      
      
            // Insert code lines by hinting at a existing
      
            vertex: {
              // Inserts the line after #include <fog_vertex>
              '#include <fog_vertex>': `
      
      
                mat4 LM = modelMatrix;
                LM[2][3] = 0.0;
                LM[3][0] = 0.0;
                LM[3][1] = 0.0;
                LM[3][2] = 0.0;
      
                vec4 GN = LM * vec4(objectNormal.xyz, 1.0);
                vNN = normalize(GN.xyz);
                vEye = normalize(GN.xyz-cameraPosition);`
            },

            fragment: {
                'gl_FragColor = vec4( outgoingLight, diffuseColor.a );' : `
        
        float m = ( 1.0 - -min(dot(vEye, normalize(vNN)), 0.0) );
        m = pow(m, 8.); // the greater the second parameter, the thinner effect you get
        gl_FragColor.rgb +=  m * fresnelColor;
        
        `
    },


            /*fragment: {
                'gl_FragColor = vec4( outgoingLight, diffuseColor.a );' : 'gl_FragColor.rgb += diffuseColor.rgb * pow(1.0 - abs(dot(normalize(NM*vEye), vNN )), 2.5) * 2.0;'
              },*/


            /*fragment: {
                'vec4 diffuseColor = vec4( diffuse, opacity );': `
                    float a = ( 1.0 - -min(dot(vEye, normalize(vNormal) ), 0.0) );
                    a = pow(a, fresnelDegree);
                    diffuseColor.rgb += a * fresnelColor;
    `
},*/
            /*
            fragment: {
                'vec4 diffuseColor = vec4( diffuse, opacity );': `

                float m = ( 1.0 - -min(dot(vEye, normalize(vNN)), 0.0) );
                m = pow(m, fresnelDegree); // the greater the second parameter, the thinner effect you get

                diffuseColor.rgb += m * fresnelColor;
                `
            },*/

            material: {
                lights: false
              },
      
      
            // Uniforms (will be applied to existing or added)
      
            uniforms: {
              diffuse: new THREE.Color('black'),
              diffuseColor: new THREE.Color('red'),
              fresnelColor: new THREE.Color( 'white' ),
              fresnelDegree: 1.0,
            }
      
            
          });


          cloudMaterial = extendMaterial(THREE.MeshMatcapMaterial, {
      

            // Will be prepended to vertex and fragment code
      
            header: 'varying vec3 vNN; varying mat3 NM; varying vec3 vEye;',
      
      
            // Insert code lines by hinting at a existing
      
            vertex: {
              // Inserts the line after #include <fog_vertex>
              '#include <fog_vertex>': `
                vNN = normalize(transformedNormal);
                NM = normalMatrix;
                vEye = normalize(transformed-cameraPosition);`
            },
            fragment: {
              'gl_FragColor = vec4( outgoingLight, diffuseColor.a );' : 'gl_FragColor.rgb += diffuseColor.rgb * pow(1.0 - abs(dot(normalize(NM*vEye), vNN )), 2.5) * 2.0;'
            },
      
      
            material: {
              lights: false
            },
            // Uniforms (will be applied to existing or added)
      
            uniforms: {
              diffuse: new THREE.Color('gray')
            }
      
            
          });

          cloudMaterial = extendMaterial(cloudMaterial, {
      
            vertex: {
              'project_vertex': {
                  '@vec4 mvPosition = modelViewMatrix * vec4( transformed, 1.0 );':
                    'vec4 mvPosition = modelViewMatrix * vec4( transformed * 0.5, 1.0 );'
              }
            }
            
          });
    }
    function initTerrain()
    {
        // terrain group
        terrainObjectGroup = new THREE.Group();
        scene.add(terrainObjectGroup);

        // a group for outer wall plane helpers
        //terrainObjectPlaneFloorHelperGroup = new THREE.Group();
        //terrainObjectPlaneWallHelperGroup = new THREE.Group();
        //terrainObjectGroup.add(terrainObjectPlaneFloorHelperGroup);
        //terrainObjectGroup.add(terrainObjectPlaneWallHelperGroup);

        loaderOBJ.load
        (
            // resource URL
            './models/Icosahedron.obj',
            // called when the resource is loaded
            function (obj)
            {
                loadOBJ(obj);
            },
            // called while loading is progressing
            function (xhr) {
                console.log((xhr.loaded / xhr.total * 100) + '% loaded');
            },
            // called when loading has errors
            function (error) {
                console.error('ERROR: loaderOBJ');
                console.error(error);
            }
        );
    }
    function initGeometry()
    {
    }
    function initHUD()
    {
        //
        generateHUD();

        //
        generateReticle();
    }
    function initControls()
    {
        //
        document.addEventListener("resize", handleWindowResize, false);
    
        //
        document.addEventListener("pointerlockchange", handlePointerLockChange, false);
        document.addEventListener("pointerlockerror", handlePointerLockError, false);

        //
        document.addEventListener("mousemove", handleMouseMove);

        //
        document.addEventListener("mousedown", handleMouseDown, false);
        document.addEventListener("mouseup", handleMouseUp, false);

        //
        document.addEventListener("keydown", handleKeyDown);
        document.addEventListener("keyup", handleKeyUp);
    }

    //
    initBareMinimum();
    initLights();

    //
    loaderOBJ = new OBJLoader();
    loaderTexture = new THREE.TextureLoader();

    //
    initPlayer();
    initClouds1();
    initFallbackTexture();
    initEarthAndSky();
    initTerrain();
    initGeometry();
    initHUD();
    initControls();

    //
    update();
}

function handleWindowResize(e)
{
    //camera.aspect = window.innerWidth / window.innerHeight;
    //camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function generateHUD()
{
    //
    const returnObjectGenerationHUD = HelperGenerationHUD.generateText(stringTextControls);
    //
    hudTextControls = returnObjectGenerationHUD["hudTextControls"];
    hudTextControlsDouble = returnObjectGenerationHUD["hudTextControlsDouble"];
    hudTextStatus = returnObjectGenerationHUD["hudTextStatus"];
    hudTextStatusDouble = returnObjectGenerationHUD["hudTextStatusDouble"];
    hudTextStack = returnObjectGenerationHUD["hudTextStack"];
    hudTextStackDouble = returnObjectGenerationHUD["hudTextStackDouble"];
    //
    document.body.appendChild(hudTextControls);
    document.body.appendChild(hudTextControlsDouble);
    document.body.appendChild(hudTextStatus);
    document.body.appendChild(hudTextStatusDouble);
    document.body.appendChild(hudTextStack);
    document.body.appendChild(hudTextStackDouble);
}

function generateReticle()
{
    const returnObjectGenerationHUD = HelperGenerationHUD.generateReticle();
    hudReticle = returnObjectGenerationHUD["hudReticle"];
    if(returnObjectGenerationHUD["hudReticleFill"] != null)
    {
        hudReticleFill = returnObjectGenerationHUD["hudReticleFill"];
    }
    hudReticleLines = returnObjectGenerationHUD["hudReticleLines"];
    document.body.appendChild(hudReticle);
    if(hudReticleFill != null)
    {
        document.body.appendChild(hudReticleFill);
    }
    if(hudReticleLines != null)
    {
        document.body.appendChild(hudReticleLines);
    }
}

function loadOBJ(obj)
{
    //
    terrainObject = obj.children[0];
    terrainObjectGroup.add(terrainObject);

    //
    terrainObject.scale.x *= 20.0;
    terrainObject.scale.y *= 20.0;
    terrainObject.scale.z *= 20.0;

    //
    terrainObject.material = new THREE.MeshStandardMaterial({ 
        side: THREE.FrontSide,
        wireframe: false,
        //color: terrainColor,
        //vertexColors: THREE.FaceColors,
        vertexColors: true,
        flatShading: true,
        roughness: 1.0,
        metalness: 0.0,
    });
    terrainObject.material.needsUpdate = true;

    //
    generateVertexColors(terrainObject.geometry);

    //
    const terrainObjectPositionAttribute = terrainObject.geometry.getAttribute("position");
    terrainObjectPositionCount = terrainObjectPositionAttribute.count;
    terrainObjectPositionItemSize = terrainObjectPositionAttribute.itemSize;

    //
    const terrainObjectNormalAttribute = terrainObject.geometry.getAttribute("normal");
    const terrainObjectNormalCount = terrainObjectNormalAttribute.count;
    const terrainObjectNormalItemSize = terrainObjectNormalAttribute.itemSize;

    // this will generate both vertex and triangle data
    generateTriangleData(terrainObject, terrainObjectPositionAttribute, terrainObjectPositionCount, terrainObjectPositionItemSize, terrainObjectNormalAttribute, terrainObjectNormalCount, terrainObjectNormalItemSize);

    //
    if(boolShouldDrawHelpers)
    {
        //const helper = new VertexNormalsHelper(terrainObject, 1, 0xff0000);
        //terrainObjectGroup.add(helper);
    }
    
    //
    setDefaultValues();
}

function setDefaultValues()
{
    //
    setDefaultValuesA();
    //
    updateHelpers();

    //
    hasInit = true;
    playerHasPlanet = true;
}
function setDefaultValuesPositionAndRotation()
{
    //
    playerHasPlanet = false;
    playerHasPlanetSide = true;

    //
    cameraPivot.position.x = -100.0;
    cameraPivot.position.y = 100.0;
    cameraPivot.position.z = -50.0;

    //
    camera.rotation.x = -1.57;
    camera.rotation.y = 0.0;
    camera.rotation.z = 1.87;

    //
    cameraPivot.rotation.x = 0.0;
    cameraPivot.rotation.y = -0.30;
    cameraPivot.rotation.z = 0.0;

    //
    playerVelocityFromGravity.x = 0.0;
    playerVelocityFromGravity.y = 0.0;
    playerVelocityFromGravity.z = 0.0;
}
function setDefaultValuesA()
{
    //
    indexTriangle = null;
    indexSide = null;

    //
    setDefaultValuesPositionAndRotation();

    //
    precalculateCameraDirection();
    cameraLookAtForwardObject();
}

function setDefaultValuesB()
{
    
    //
    indexTriangle = 1;
    //indexSide = 1;//5//this is set upon generation

    //
    cameraPivot.position.x = -0.12;
    cameraPivot.position.y = 1.68;
    cameraPivot.position.z = -19.32;

    //
    camera.rotation.x = -0.86;

    //
    cameraPivot.rotation.x = 1.11;
    cameraPivot.rotation.y = 0.02;
    cameraPivot.rotation.z = -3.12;
}

var indexToHashIdArray = [];

function generateTriangleData(terrainObject, terrainObjectPositionAttribute, terrainObjectPositionCount, terrainObjectPositionItemSize, terrainObjectNormalAttribute, terrainObjectNormalCount, terrainObjectNormalItemSize)
{
    // early return: count is different
    if(terrainObjectPositionCount != terrainObjectNormalCount){return;}
    if(terrainObjectPositionItemSize != terrainObjectNormalItemSize){return;}

    //
    console.log("");
    console.log("time to organize sides!");
    console.log("count of normals: " + terrainObjectPositionCount);

    //
    for(var i = 0; i < terrainObjectPositionCount; i += terrainObjectPositionItemSize)
    {  
        // position
        const positionTriangleData = HelperMesh.getPositionTriangleData(terrainObject, terrainObjectPositionAttribute, i, terrainObjectPositionItemSize);
        const average3Vertex = getAverage3Vertex(positionTriangleData);
        addPositionTriangleDataToList(positionTriangleData, average3Vertex);

        // normal
        const normalTriangleData = HelperMesh.getNormalTriangleData(terrainObject, terrainObjectNormalAttribute, i, terrainObjectNormalItemSize);
        const faceNormal = getFaceNormal(positionTriangleData, normalTriangleData);
        addNormalTriangleDataToList(normalTriangleData, faceNormal);

        // unique id from normal data
        // we can do this by multiplying by prime numbers and adding together
        const hashId = getHashIdFromFaceNormal(faceNormal);
        console.log("hashId: " + hashId);

        //
        indexToHashIdArray[i / 3] = hashId;
        
        // first time only: let's set the sideId to the first hashId
        if(indexSide == null){indexSide = hashId;}

        // if we do not have a triangle array at that index, add it
        if(terrainObjectSidesWithTriangleIndeces[hashId.toString()] == null)
        {
            terrainObjectSidesWithTriangleIndeces[hashId.toString()] = [];
            terrainObjectSidesWithTriangleIndecesCount++;

            //generateFloorPlane(average3Vertex, faceNormal, hashId, i);
        }
        // then push our current triangle to that array
        terrainObjectSidesWithTriangleIndeces[hashId.toString()].push(i);

        // add outer wall planes
        generateOuterWallPlanes(positionTriangleData, average3Vertex, faceNormal, hashId, i);

        //
        generateArrowInTriangleCenter(i, terrainObjectPositionItemSize);
    }

    //
    console.log("index to hash id table:");
    console.log(indexToHashIdArray);

    //
    generateFloorPlanesFromSides();

    //
    console.dir(terrainObjectSidesWithTriangleIndeces);
    console.dir(terrainObjectSidesWithOuterWalls);
}

function getHashIdFromFaceNormal(faceNormal)
{
    const xComponent = Math.round(faceNormal.x * 100) * 3;
    const yComponent = Math.round(faceNormal.y * 100) * 5;
    const zComponent = Math.round(faceNormal.z * 100) * 7;
    // we also try to get it in nice, integer, indeces, even if there will be a gap
    return xComponent + yComponent + zComponent;
    return Math.floor(a + 9);
}

function addOuterWallPlaneToObject(hashId, plane)
{
    // if we do not have a outer wall plane array at that index, add it
    if(terrainObjectSidesWithOuterWalls[hashId.toString()] == null)
    {
        terrainObjectSidesWithOuterWalls[hashId.toString()] = [];
    }

    // our helper array for wall
    // it is 2 dimensional
    // so we need to initialize the second tier
    // if we do not already have one
    if(terrainObjectPlaneWallHelperArray[hashId] == null)
    {
        terrainObjectPlaneWallHelperArray[hashId] = [];
    }

    // then push our current outer wall plane to that side array
    terrainObjectSidesWithOuterWalls[hashId.toString()].push(plane);

    // unless I'm crazy
    // this function is ran for each wall
    // not for each side
    // so... we can just add to the array directly?
    const planeHelper = new THREE.PlaneHelper(plane, 35.0, 0xFF0000);
    planeHelper.material.transparent = true;
    planeHelper.children[0].material.transparent = true;
    terrainObjectPlaneWallHelperArray[hashId].push(planeHelper);
    scene.add(planeHelper);

    return;

    if(indexSide == hashId && boolShouldDrawHelpers)
    {
        const planeHelper = new THREE.PlaneHelper(plane, 35.0, 0xFF0000);
        //terrainObjectPlaneWallHelperGroup.add(planeHelper);
    }
}

function generateOuterWallPlanes(positionTriangleData, average3Vertex, faceNormal, hashId, i)
{
    // we could also generate planes for each vertex pair of the triangle

    // since this is a dodecahedron and not an icosahedron...
    // we want to skip any "inner" triangles

    // how we know this I do not yet know

    // perhaps the dot product?

    // a-b
    const planeAB = new THREE.Plane();
    const midpointAB = new THREE.Vector3(
        (positionTriangleData[0].x + positionTriangleData[1].x) / 2,
        (positionTriangleData[0].y + positionTriangleData[1].y) / 2,
        (positionTriangleData[0].z + positionTriangleData[1].z) / 2
    );
    const normalAB = new THREE.Vector3(
        average3Vertex.x - midpointAB.x,
        average3Vertex.y - midpointAB.y,
        average3Vertex.z - midpointAB.z
    );
    normalAB.normalize();
    const normalABInner = getIsNormalInner(midpointAB, normalAB, faceNormal, i);
    if(!normalABInner)
    {
        planeAB.setFromNormalAndCoplanarPoint(normalAB, midpointAB);
        planeAB.constant += terrainObjectEdgePadding;
        terrainObjectTriangleSidePlanes.push(planeAB);

        // since we confirmed that this is an outer wall, add it to an object (list)
        addOuterWallPlaneToObject(hashId, planeAB);
    }
    else {
        terrainObjectTriangleSidePlanes.push(null);
    }

    // a-c
    const planeAC = new THREE.Plane();
    const midpointAC = new THREE.Vector3(
        (positionTriangleData[0].x + positionTriangleData[2].x) / 2,
        (positionTriangleData[0].y + positionTriangleData[2].y) / 2,
        (positionTriangleData[0].z + positionTriangleData[2].z) / 2
    );
    const normalAC = new THREE.Vector3(
        average3Vertex.x - midpointAC.x,
        average3Vertex.y - midpointAC.y,
        average3Vertex.z - midpointAC.z
    );
    normalAC.normalize();
    const normalACInner = getIsNormalInner(midpointAC, normalAC, faceNormal, i);
    if(!normalACInner)
    {
        planeAC.setFromNormalAndCoplanarPoint(normalAC, midpointAC);
        planeAC.constant += terrainObjectEdgePadding;
        terrainObjectTriangleSidePlanes.push(planeAC);

        // since we confirmed that this is an outer wall, add it to an object (list)
        addOuterWallPlaneToObject(hashId, planeAC);
    }
    else {
        terrainObjectTriangleSidePlanes.push(null);
    }

    // a-c
    const planeBC = new THREE.Plane();
    const midpointBC = new THREE.Vector3(
        (positionTriangleData[1].x + positionTriangleData[2].x) / 2,
        (positionTriangleData[1].y + positionTriangleData[2].y) / 2,
        (positionTriangleData[1].z + positionTriangleData[2].z) / 2
    );
    const normalBC = new THREE.Vector3(
        average3Vertex.x - midpointBC.x,
        average3Vertex.y - midpointBC.y,
        average3Vertex.z - midpointBC.z
    );
    normalBC.normalize();
    const normalBCInner = getIsNormalInner(midpointBC, normalBC, faceNormal, i);
    if(!normalBCInner)
    {
        planeBC.setFromNormalAndCoplanarPoint(normalBC, midpointBC);
        planeBC.constant += terrainObjectEdgePadding;
        terrainObjectTriangleSidePlanes.push(planeBC);

        // since we confirmed that this is an outer wall, add it to an object (list)
        addOuterWallPlaneToObject(hashId, planeBC);
    }
    else {
        terrainObjectTriangleSidePlanes.push(null);
    }

    // helper array needs to be initialized
    if(terrainObjectWallArrowHelperArray[hashId] == null)
    {
        terrainObjectWallArrowHelperArray[hashId] = [];
    }

    // arrow helpers
    if(!normalABInner)
    {
        const arrowAB = new THREE.ArrowHelper(normalAB, midpointAB, 1.0, 0xFF00FF);
        arrowAB.children[0].material.transparent = true;
        arrowAB.children[1].material.transparent = true;
        scene.add(arrowAB);
        terrainObjectWallArrowHelperArray[hashId][0] = arrowAB;
    }

    if(!normalACInner)
    {
        const arrowAC = new THREE.ArrowHelper(normalAC, midpointAC, 1.0, 0xFF00FF);
        arrowAC.children[0].material.transparent = true;
        arrowAC.children[1].material.transparent = true;
        scene.add(arrowAC);
        terrainObjectWallArrowHelperArray[hashId][1] = arrowAC;
    }
    
    if(!normalBCInner)
    {
        const arrowBC = new THREE.ArrowHelper(normalBC, midpointBC, 1.0, 0xFF00FF);
        arrowBC.children[0].material.transparent = true;
        arrowBC.children[1].material.transparent = true;
        scene.add(arrowBC);
        terrainObjectWallArrowHelperArray[hashId][2] = arrowBC;
    }
}

function generateFloorPlane(average3Vertex, faceNormal, hashId, i)
{
    console.log("create floor plane! [i == "+ i +"]");

    const dist = terrainObject.position.distanceTo(average3Vertex);

    const plane = new THREE.Plane(faceNormal, -dist);
    terrainObjectFloorPlanes[hashId] = plane;
    const centerPoint = new THREE.Vector3();
    centerPoint.copy(terrainObject.position);
    centerPoint.addScaledVector(faceNormal, dist);
    terrainObjectCenterPoints[hashId] = centerPoint;

    //
    const arrow = new THREE.ArrowHelper(faceNormal, centerPoint, 1.0, 0xFF0000);
    arrow.children[0].material.transparent = true;
    arrow.children[1].material.transparent = true;
    scene.add(arrow);
    terrainObjectFloorArrowHelperArray[hashId] = arrow;

    //
    if(indexSide == hashId)
    {
        const planeHelper = new THREE.PlaneHelper(plane, 10.0, 0xFF0000);
        planeHelper.material.transparent = true;
        planeHelper.children[0].material.transparent = true;
        scene.add(planeHelper);
    }
}

function generateFloorPlanesFromSides()
{
    // now that we have neatly organized our sides
    // so that we can get triangle indeces
    // we need to take the average positions
    // as the centerpoints

    console.log("");
    console.log("sides are organized, time to generate floor planes!");
    console.log("count:");
    console.log(terrainObjectSidesWithTriangleIndecesCount);
    console.log("length:");
    console.log(terrainObjectTrianglePositions.length);

    for (const [key, value] of Object.entries(terrainObjectSidesWithTriangleIndeces))
    {
        //
        var averagePosition = new THREE.Vector3(0,0,0);
        var averageNormal = new THREE.Vector3(0,0,0);
        const length = value.length;

        // sum loop
        for(var i = 0; i < length; i++)
        {
            const index = value[i] / 3;

            // sum
            averagePosition.x += terrainObjectTrianglePositions[index].x;
            averagePosition.y += terrainObjectTrianglePositions[index].y;
            averagePosition.z += terrainObjectTrianglePositions[index].z;
            
            // sum
            averageNormal.x += terrainObjectTriangleNormals[index].x;
            averageNormal.y += terrainObjectTriangleNormals[index].y;
            averageNormal.z += terrainObjectTriangleNormals[index].z;
        }

        // average out
        averagePosition.x = averagePosition.x / length;
        averagePosition.y = averagePosition.y / length;
        averagePosition.z = averagePosition.z / length;

        // average out
        averageNormal.x = averageNormal.x / length;
        averageNormal.y = averageNormal.y / length;
        averageNormal.z = averageNormal.z / length;

        // world normal conversion?
        // test only
        // remove if it becomes crazy
        //averageNormal.applyMatrix3(normalMatrix).normalize();
        
        // now we have our average position
        // let's create a center point there
        terrainObjectCenterPoints[key] = averagePosition;

        // let's create arrow helpers at those points
        const arrowHelper = new THREE.ArrowHelper(averageNormal, averagePosition, 1.0, 0x00FF00);
        arrowHelper.children[0].material.transparent = true;
        arrowHelper.children[1].material.transparent = true;
        scene.add(arrowHelper);
        terrainObjectFloorArrowHelperArray[key] = arrowHelper;


        // and let's create a plane from that center point
        // and our average normal

        const dist = terrainObject.position.distanceTo(averagePosition);
        const plane = new THREE.Plane(averageNormal, -dist - 0.02);
        terrainObjectFloorPlanes[key] = plane;

        // a center point will always be the lowest distance to the planet
        // we can store this information
        if(distanceToPlanetMin == null)
        {
            distanceToPlanetMin = dist;
        }

        //
        const planeHelper = new THREE.PlaneHelper(plane, 10.0, 0xFF0000);
        planeHelper.material.transparent = true;
        planeHelper.children[0].material.transparent = true;
        //terrainObjectPlaneFloorHelperGroup.add(planeHelper);
        scene.add(planeHelper);
        terrainObjectPlaneFloorHelperArray[key] = planeHelper;

        // let's create a cloud at that point as well
        generateCloud(averagePosition, averageNormal, key);
    }
}

function generateCloud(averagePosition, averageNormal, key)
{
        //
        var cloudObject = new THREE.Object3D();
        cloudObject.position.copy(averagePosition);
        cloudObject.position.addScaledVector(averageNormal, 20.0);
        cloudObject.lookAt(averagePosition);
        cloudGroup.add(cloudObject);

        // for color variation
        // we can use the dot product with scene.up
        const dot = averageNormal.dot(scene.up);
        console.log("dot: " + dot.toFixed(6));
        const colorBlend = getColorBlend(dot);

        var sphere1 = new THREE.Mesh(new THREE.SphereGeometry(3.0,7,7), cloudMaterialArray[0]);
        cloudObject.add(sphere1);

        var sphere2 = new THREE.Mesh(new THREE.SphereGeometry(2.5,5,5), cloudMaterialArray[0]);
        sphere2.position.x += 2.5;
        sphere2.rotateX(-Math.PI / 2);
        cloudObject.add(sphere2);

        var sphere3 = new THREE.Mesh(new THREE.SphereGeometry(2.0,5,5), cloudMaterialArray[0]);
        sphere3.position.x -= 2.5;
        sphere3.rotateX(Math.PI / 2);
        cloudObject.add(sphere3);

        //
        if(dot > 0.5)
        {
            //cloudUniformArray[1].diffuseColor.value = colorBlend;
            sphere1.material = cloudMaterialArray[1];
            sphere2.material = cloudMaterialArray[1];
            sphere3.material = cloudMaterialArray[1];
        }
        else if(dot > 0)
        {
            //cloudUniformArray[2].diffuseColor.value = colorBlend;
            sphere1.material = cloudMaterialArray[2];
            sphere2.material = cloudMaterialArray[2];
            sphere3.material = cloudMaterialArray[2];
        }
        else {
            //cloudUniformArray[0].diffuseColor.value = colorBlend;
        }
}

function getColorBlend(dot)
{
    // is dot -1..1?
    // we need it to be 0..1 in that case

    const color1 = new THREE.Color(0xFF0000);
    const color2 = new THREE.Color(0x0000FF);

    return color1.lerp(color2, dot);
}

function getIsNormalInner(midpoint, sideNormal, faceNormal, iteratorIndex)
{
    const directionTowardsOrigin = new THREE.Vector3(
        midpoint.x - terrainObject.position.x,
        midpoint.y - terrainObject.position.y,
        midpoint.z - terrainObject.position.z,
    );
    directionTowardsOrigin.normalize();

    const dot = sideNormal.dot(directionTowardsOrigin);
    //console.log(dot);

    // -0.1 is an arbitrary number and should perhaps be backed up by math
    if(dot > -0.1){return true;}
    return false;
}

function getAverage3Vertex(positionTriangleData)
{
    return new THREE.Vector3(
        (positionTriangleData[0].x + positionTriangleData[1].x + positionTriangleData[2].x) / 3,
        (positionTriangleData[0].y + positionTriangleData[1].y + positionTriangleData[2].y) / 3,
        (positionTriangleData[0].z + positionTriangleData[1].z + positionTriangleData[2].z) / 3,
    )
}

function getFaceNormal(positionTriangleData, normalTriangleData)
{
    const faceNormal = new THREE.Vector3(
        (normalTriangleData[0].x + normalTriangleData[1].x + normalTriangleData[2].x) / 3,
        (normalTriangleData[0].y + normalTriangleData[1].y + normalTriangleData[2].y) / 3,
        (normalTriangleData[0].z + normalTriangleData[1].z + normalTriangleData[2].z) / 3,
    );
    faceNormal.normalize();

    return faceNormal;

    // we get a face normal
    // and convert it to world coordinates
    const faceNormal2 = HelperMesh.getFaceNormal(
        [positionTriangleData[0], positionTriangleData[1], positionTriangleData[2]],
        [normalTriangleData[0], normalTriangleData[1], normalTriangleData[2]]
    );

    // convert faceNormal from local-space to world-space
    worldNormal.copy(faceNormal2).applyMatrix3(normalMatrix).normalize();

    // normalize
    // not sure why the .normalize() above doesn't do this
    // but this one is necessary
    faceNormal2.normalize();

    //
    return faceNormal2;
}

function addPositionTriangleDataToList(positionTriangleData, average3Vertex)
{
    // add to vertex list
    for(var i = 0; i < 3; i++)
    {
        terrainObjectVertexPositions.push(new THREE.Vector3(positionTriangleData[i].x, positionTriangleData[i].y, positionTriangleData[i].z));
    }

    // add center (average) to triangle list
    terrainObjectTrianglePositions.push(average3Vertex);
}

function generateArrowInTriangleCenter(index, itemSize)
{
    return;

    const actualIndex = index / itemSize;

    const length = 1;
    const hex = 0xffff00;

    if(boolShouldDrawHelpers)
    {
        const arrowHelper = new THREE.ArrowHelper(terrainObjectTriangleNormals[actualIndex], terrainObjectTrianglePositions[actualIndex], length, hex);
        scene.add(arrowHelper);
        arrayArrowHelpers.push(arrowHelper);   
    }
}

function addNormalTriangleDataToList(normalTriangleData, faceNormal)
{
    // add to vertex list
    for(var i = 0; i < 3; i++)
    {
        terrainObjectVertexNormals.push(new THREE.Vector3(normalTriangleData[i].x, normalTriangleData[i].y, normalTriangleData[i].z));
    }

    // add to list
    terrainObjectTriangleNormals.push(faceNormal);
}

function generateVertexColors(geometry)
{
    const positionAttribute = geometry.getAttribute("position");

    const colors = [];
    const color = new THREE.Color();

    for ( let i = 0, il = positionAttribute.count; i < il; i ++ )
    {
        color.setHSL( i / il * Math.random(), 0.5, 0.5 );
        //color.setColorName("white");
        colors.push( color.r, color.g, color.b );

    }

    const attrtbt = new THREE.Float32BufferAttribute( colors, 3 );
    geometry.setAttribute('color', attrtbt);
    geometry.needsUpdate = true;
}

function update()
{
    // must be first
    requestAnimationFrame(update);

    //
    clockDelta = clock.getDelta();

    // we should precalculate if we have a side item
    // so that we do not have to check this inside so many functions
    // we can just check it here, instead´
    precalculateHasPlanetSide();

    // precalculate camera forward direction
    precalculateCameraDirection();

    // precalculate distance to floor
    // since we use this every frame regardless
    precalculateDistanceToFloor();
    
    // update gravity perpendiculars
    // these are the axes we actually move on, not the camera's
    updateCameraGravityPerpendiculars();

    
    // testing, move in camera's current forward direction
    if(keyboard["KeyI"] == true)
    {
        cameraPivot.position.addScaledVector(cameraDirection, 0.1);
    }
    // testing, move in camera's current right direction
    else if(keyboard["KeyL"] == true)
    {
        cameraPivot.position.addScaledVector(cameraDirectionRight, 0.1);
    }
    

    // we can fake mouse movement with arrow keys
    if(keyboard["ArrowRight"] == true)
    {
        mouseX = 20.0;
    }
    else if (keyboard["ArrowLeft"] == true)
    {
        mouseX = -20.0;
    }
    if(keyboard["ArrowUp"] == true)
    {
        mouseY = -20.0;
    }
    else if (keyboard["ArrowDown"] == true)
    {
        mouseY = 20.0;
    }


    // attempt to unskew camera manually
    if(keyboard["Slash"] == true)
    {
        camera.rotateZ(0.01);
    }
    else if (keyboard["ShiftRight"] == true)
    {
        camera.rotateZ(-0.01);
    }


    // move up/down from normal direction
    if(keyboard["ShiftLeft"] == true)
    {
        attemptToRotateTowardsTriangleCenter();
        //attemptToLookAtTriangleCenter();
        //cameraLookAtForwardObject();
        if(terrainObjectFloorPlanes[indexSide] != null)
        {
            cameraPivot.translateOnAxis(terrainObjectFloorPlanes[indexSide].normal, 0.5);
        }
    }
    else if(keyboard["ControlLeft"] == true) 
    {
        attemptToRotateTowardsTriangleCenter();
        //attemptToLookAtTriangleCenter();
        //cameraLookAtForwardObject();
        if(terrainObjectFloorPlanes[indexSide] != null)
        {
            cameraPivot.translateOnAxis(terrainObjectFloorPlanes[indexSide].normal, -0.5);
        }
    }


    // ability: super jump
    if(keyboard["Space"] == true)
    {
        //updateActivateAbilitySuperJump();
    }

    //
    checkControlsMovementMK();

    // should be changed to
    // 1: updatePlayerStateGravity()
    // 2: updatePlayerVelocityGravity()
    // 3: updateMovePlayer...
    // because 2 will be informed by 1
    // as in knowing what state we are in
    // will completely change how we are affected by gravity
    // and what our options are

    //
    updatePlayerStateGravity();
    updatePlayerVelocityByStateGravity();

    //
    //updatePlayerGravity();

    //
    updateMovePlayerInDirectionOfVelocity();
    
    //
    updateCameraLerp();

    //
    checkControlsMouse();

    //
    updateUniforms();

    // text log should be last of the update functions
    updateTextLog();

    // must be last
    renderer.render(scene, camera);
}

function precalculateHasPlanetSide()
{
    // early return: no planet
    if(!playerHasPlanet)
    {
        playerHasPlanetSide = false;
        return;
    }

    // early return: index is null
    if(indexSide == null)
    {
        playerHasPlanetSide = false;
        return;
    }
    
    // early return: no item
    // this is the only place where this check should be made
    if(terrainObjectFloorPlanes[indexSide] == null)
    {
        playerHasPlanetSide = false;
        return;
    }

    // all is well
    playerHasPlanetSide = true;
    return;
}

function precalculateDistanceToFloor()
{
    // early return: no planet (yet)
    if(!playerHasPlanet){return;}

    // update our variables
    playerDistanceToPlanetPrev = playerDistanceToPlanet;
    playerDistanceToPlanet = terrainObject.position.distanceTo(cameraPivot.position);

    // early return: no side (yet)
    if(!playerHasPlanetSide){return;}

    // update our variables
    playerDistanceToFloorPrev = playerDistanceToFloor;
    playerDistanceToFloor = terrainObjectFloorPlanes[indexSide].distanceToPoint(cameraPivot.position);
}

function getVelocityComponentInFloorDirection()
{
    // early return: no side
    if(indexSide == null){return 0;}
    if(terrainObjectFloorPlanes[indexSide] == null){return 0;}

    // https://youtu.be/8nIB7e_eds4?si=Gbf0r4tIwqakVxQR&t=201
    var invertedDirection = new THREE.Vector3();
    invertedDirection.copy(terrainObjectFloorPlanes[indexSide].normal);
    invertedDirection.negate();
    var dot = playerVelocityFromGravity.dot(invertedDirection);
    var maxValue = Math.max(0, dot);

    return maxValue;

    //
    var result = new THREE.Vector3();
    invertedDirection.negate();
    result.multiplyVectors(invertedDirection, maxValue);
    return result;
}

function updateMovePlayerInDirectionOfVelocity()
{
    // early return: not pause
    if(!isPlaying) {return;}

    // early return: player has no planet side, and no planet
    if(!playerHasPlanetSide && !playerHasPlanet){return;}

    // early return
    if(terrainObjectFloorPlanes[indexSide].normal == null){return;}

    // we want to check if velocity is higher or equal to distance to floor/plane
    // but only component of velocity in that direction

    // should do ONCE, then change state
    // so, we should probably compare prevState as well
    // or the player's gravity state

    // 1: snap to ground
    // 2: negate that component's velocity
    // i.e. add to velocity in the opposite direction of floor

    /*
    const velocityInDirectionToFloor = getVelocityComponentInFloorDirection();
    if(playerHasPlanetSide && (playerDistanceToFloor - distanceToFloorOffset) <= velocityInDirectionToFloor)
    {
        if(playerHasPlanetSide && (playerDistanceToFloorPrev - distanceToFloorOffset) > velocityInDirectionToFloor)
        {
            console.log(" <= ");
            console.log(playerDistanceToFloor + distanceToFloorOffset);
            console.log(velocityInDirectionToFloor);
            debugText("will snap to floor!");
            playerVelocityFromGravity.addScaledVector(terrainObjectFloorPlanes[indexSide].normal, -velocityInDirectionToFloor);
            setPlayerStateGravity(2);
            return;
        }
    }
    */

    //
    cameraPivot.position.addScaledVector(playerVelocityFromGravity, 1.0);

    // translate (move) in local space
    // .translateX()
    // .translateY()
    // .translateZ()
    // .translateOnAxis()

    // translate (move) in world space
    // .position.x += 
    // .position.y += 
    // .position.z += 
    // .position += 

    // 
    if(playerInputPolarityUpDown != 0)
    {
        cameraPivot.position.x += playerVelocityFromInput.y * terrainObjectFloorPlanes[indexSide].normal.x;
        cameraPivot.position.y += playerVelocityFromInput.y * terrainObjectFloorPlanes[indexSide].normal.y;
        cameraPivot.position.z += playerVelocityFromInput.y * terrainObjectFloorPlanes[indexSide].normal.z;
    }
    if(playerInputPolarityForwardBackward != 0)
    {
        cameraPivot.position.x += playerVelocityFromInput.z * directionCameraGravityForward.x;
        cameraPivot.position.y += playerVelocityFromInput.z * directionCameraGravityForward.y;
        cameraPivot.position.z += playerVelocityFromInput.z * directionCameraGravityForward.z;
    }
    if(playerInputPolarityLeftRight != 0)
    {
        // should we use
        // directionCameraGravityForward
        // instead of
        // cameraDirectionRight
        // ?
        cameraPivot.position.x += playerVelocityFromInput.x * cameraDirectionRight.x;
        cameraPivot.position.y += playerVelocityFromInput.x * cameraDirectionRight.y;
        cameraPivot.position.z += playerVelocityFromInput.x * cameraDirectionRight.z;
    }

    // test

    

    // let's try to update direction here and see if that does us any good
    // first reset
    playerVelocityFromInputDirection.x = 0;
    playerVelocityFromInputDirection.y = 0;
    playerVelocityFromInputDirection.z = 0;
    // is the below necessary?
    // we seem to apply speed, not only direction
    // our vec3 should be normalized anyway... and then apply speed later
    // perhaps we update this when we set the input velocity, instead
    // this works for now though

    // what we do then is use our polarity booleans
    // * with the cameraDirectionRight, terrainObjectFloorPlanes[indexSide].normal, directionCameraGravityForward
    // since we really only want to check if we are moving at all in that direction
    // and we don't care about velocity or speed

    // again, this works for the moment

    // x
    playerVelocityFromInputDirection.x += playerVelocityFromInput.x * cameraDirectionRight.x;
    playerVelocityFromInputDirection.x += playerVelocityFromInput.y * terrainObjectFloorPlanes[indexSide].normal.x;
    playerVelocityFromInputDirection.x += playerVelocityFromInput.z * directionCameraGravityForward.x;
    // y
    playerVelocityFromInputDirection.y += playerVelocityFromInput.x * cameraDirectionRight.y;
    playerVelocityFromInputDirection.y += playerVelocityFromInput.y * terrainObjectFloorPlanes[indexSide].normal.y;
    playerVelocityFromInputDirection.y += playerVelocityFromInput.z * directionCameraGravityForward.y;
    // z
    playerVelocityFromInputDirection.z += playerVelocityFromInput.x * cameraDirectionRight.z;
    playerVelocityFromInputDirection.z += playerVelocityFromInput.y * terrainObjectFloorPlanes[indexSide].normal.z;
    playerVelocityFromInputDirection.z += playerVelocityFromInput.z * directionCameraGravityForward.z;

    return;
}

function updateActivateAbilitySuperJump()
{
    // start of early returns: throttling
    if((clock.getElapsedTime() - throttleAbility) < throttleMaxAbility){return;}

    // early return: player has no planet side
    if(!playerHasPlanetSide){return;}

    // early return: too far from ground
    if(Math.abs(playerDistanceToFloor) > 2.0){return;}

    // end of early returns: reset throttle
    throttleAbility = clock.getElapsedTime();

    //
    playerVelocityFromGravity.addScaledVector(terrainObjectFloorPlanes[indexSide].normal, 1.0);
    //cameraPivot.position.addScaledVector(terrainObjectFloorPlanes[indexSide].normal, 20.0);
}

const mouseXSpeed = -0.015;
const mouseYSpeed = -0.015;

function checkControlsMouse()
{
    // early return: mouse is unlocked
    if(getIsPointerUnlocked()){return;}

    // additional speed modifier
    // for when the game is inside an iframe that doesn't support pointer lock
    // and when the right button is held
    var mouseXSpeedModifier = 1.0;
    var mouseYSpeedModifier = 1.0;
    if(isInIframe)
    {
        if(keyboard["Mouse3"] == true)
        {
            mouseXSpeedModifier = -0.05;
            mouseYSpeedModifier = -0.05;
        }
        else {
            mouseXSpeedModifier = 0.1;
            mouseYSpeedModifier = 0.1;
        }
    }

    //
    const rotationX = mouseY * mouseYSpeed * mouseYSpeedModifier;
    const rotationY = mouseX * mouseXSpeed * mouseXSpeedModifier;

    // if we are far away
    // we do not want to rotate around a planet side's axis
    // we want to rotate "freely"
    if(playerStateGravity == null || playerStateGravity < 0 || playerStateGravity == 0 || playerStateGravity == 1)
    {
        checkControlsMousePlanet(rotationX, rotationY);
    }
    else
    {
        checkControlsMousePlanetSide(rotationX, rotationY);
    }

    // for movementY, we can just consider rotateX, the local variant
    // this is the same regardless
    camera.rotateX(rotationX);

    // reset mouse? idk if necessary
    mouseX = 0;
    mouseY = 0;
}

function checkControlsMousePlanet(rotationX, rotationY)
{
    // we are far away from the planet
    // we do not want to rotate around an axis
    // we want to rotate freely

    // seems to work! at least for the moment, lol
    // it is supposed to refer to the camera's current up direction
    // if it actually does in all cases... who knows
    cameraPivot.rotateOnAxis(cameraFrustum.planes[1].normal, -rotationY);

    // below is the same as camera.rotateX() it seems
    // cameraPivot.rotateOnWorldAxis(cameraFrustum.planes[4].normal, -rotationY);
}

function checkControlsMousePlanetSide(rotationX, rotationY)
{
    // early return: no side index
    if(indexSide == null || terrainObjectFloorPlanes[indexSide] == null){return;}

    // we are close to the planet
    // we DO want to rotate around an axis
    // this axis being the side's up direction (normal of plane)

    // for rotation
    // we should always consider axes
    // as things to rotate around
    // in this case, the new up direction
    cameraPivot.rotateOnWorldAxis(terrainObjectFloorPlanes[indexSide].normal, rotationY);
}

function precalculateCameraDirection()
{
    // in order to move with the axes
    // we need to update the camera's world direction
    // does this actually need to be done every frame?
    camera.getWorldDirection(cameraDirection);
    cameraPivot.getWorldDirection(cameraPivotDirection);

    // do we need to call
    // camera.updateProjectionMatrix();
    //cameraFrustum.setFromProjectionMatrix(camera.projectionMatrix);
}

function updateNoInput()
{
}

function handlePointerLockChange(e)
{
    //
    if (getIsPointerLocked())
    {
        console.log("The pointer lock status is now locked");

        // hide controls
        hudTextControls.style.display = "none";
        hudTextControlsDouble.style.display = "none";
        // show reticle
        hudReticle.style.display = "block";
        if(hudReticleFill != null)
        {
            hudReticleFill.style.display = "block";
        }
        if(hudReticleLines != null)
        {
            hudReticleLines.style.display = "block";
        }

        //
        //setTimeout((() => {
        //    updateFindAndSetClosestGravity();
        //}), 800);
        playerIsWithinAllOuterWalls = false;
        playerIsWithinAllOuterWallsPrev = playerIsWithinAllOuterWalls;
        playerIsAboveCurrentFloorPlane = false;
        playerIsAboveCurrentFloorPlanePrev = playerIsAboveCurrentFloorPlane;
    }
    else
    {
        console.log("The pointer lock status is now unlocked");

        // reset keyboard input
        keyboard = {};
        handlePauseButton();
        
        // hide controls
        hudTextControls.style.display = "flex";
        hudTextControlsDouble.style.display = "flex";
        // hide reticle
        hudReticle.style.display = "none";
        if(hudReticleFill != null)
        {
            hudReticleFill.style.display = "none";
        }
        if(hudReticleLines != null)
        {
            hudReticleLines.style.display = "none";
        }
    }
}

function handlePointerLockError(e)
{
    //
    debugText("pointerlockerror");
}

function debugText(text)
{
    //
    const textResult = text;

    //
    hudTextStack.textContent += "\n" + textResult;
    hudTextStackDouble.textContent += "\n" + textResult;
    return;

    //
    hudTextStatus.textContent += "\n" + textResult;
    hudTextStatusDouble.textContent += "\n" + textResult;
}

async function handleUnlockPointer()
{
    //
    debugText("() handleUnlockPointer");

    // early return: we are inside of an iframe, and thus just fake it
    if(isInIframe)
    {
        boolFakePointerLocked = false;
        hasControls = false;

        handlePointerLockChange();

        return;
    }
}

async function handleLockPointer()
{
    //
    debugText("handleLockPointer");

    // early return: we are inside of an iframe, and thus just fake it
    if(isInIframe)
    {
        boolFakePointerLocked = true;
        hasControls = true;

        handlePointerLockChange();

        return;
    }

    // early return: is already locked
    if(getIsPointerLocked()){return;}

    // to do: add timer to prevent subsequent requests, as they will fail within a certain time frame
    await renderer.domElement.requestPointerLock();

    //
    setTimeout((() => {
        checkHasControls();
    }), 100);
}

function getIsPointerUnlocked()
{
    // early return: we are in an iframe, and just fake it
    if(isInIframe)
    {
        return !boolFakePointerLocked;
    }

    return (document.pointerLockElement == null || document.pointerLockElement == undefined || document.pointerLockElement !== renderer.domElement);
}

function getIsPointerLocked()
{
    return !getIsPointerUnlocked();
}

async function handleMouseMove(e)
{
    //
    mouseX = e.movementX;
    mouseY = e.movementY;

    // the rest is handled in update()
    //checkControlsMouse();
}

function checkHasControls()
{
    if(getIsPointerLocked())
    {
        hasControls = true;
        return;
    }

    hasControls = false;
    return;
}

async function handleKeyUp(e)
{
    keyboard[e.code] = false;
}

async function handleKeyDown(e)
{
    //
    keyboard[e.code] = true;

    //
    //debugText(e.code);

    //
    switch (e.code)
    {
        case 'Space':
        case 'Spacebar':
            debugText("reset camera up-dir to side");
            resetCameraUp();
            break;
        case 'Backspace':
            debugText("hard reset");
            resetHard();
            break;
        case 'Escape':
            handleUnlockPointer();
            handlePauseButton();
            break;

        case 'KeyP':
            toggleTextControls();
            break;

        case 'Digit1':
            debugText("attempt → set closest plane");
            updateFindAndSetClosestGravity();
            break;

        case 'Digit2':
            debugText("attempt → update camera perpendiculars");
            updateCameraGravityPerpendiculars();
            break;

        case 'Digit3':
            debugText("attempt → align camera to gravity");
            reAlignCameraToGravity();
            break;

        case 'Digit4':
            debugText("attempt → move to triangle center");
            attemptToMoveToTriangleCenter();
            break;

        case 'Digit5':
            debugText("attempt → look at triangle center");
            attemptToLookAtTriangleCenter();
            break;

        case 'Digit6':
            debugText("attempt → update rotation target");
            attemptToUpdateRotationTarget();
            break;

        case 'Digit0':
            debugText("unpause / pause");
            handleTogglePauseButton();
            break;


        case 'Numpad8':
            handleKeyNumpad8();
            break;
        case 'Numpad2':
            handleKeyNumpad2();
            break;
        case 'Numpad4':
            handleKeyNumpad4();
            break;
        case 'Numpad6':
            handleKeyNumpad6();
            break;
        case 'Numpad7':
            handleKeyNumpad7();
            break;
        case 'Numpad9':
            handleKeyNumpad9();
            break;
    };
}

async function handleKeyNumpad8(){translateOnFrustumAxis(cameraFrustum.planes[0].normal);}
async function handleKeyNumpad2(){translateOnFrustumAxis(cameraFrustum.planes[1].normal);}
async function handleKeyNumpad4(){translateOnFrustumAxis(cameraFrustum.planes[2].normal);}
async function handleKeyNumpad6(){translateOnFrustumAxis(cameraFrustum.planes[3].normal);}
async function handleKeyNumpad7(){translateOnFrustumAxis(cameraFrustum.planes[4].normal);}
async function handleKeyNumpad9(){translateOnFrustumAxis(cameraFrustum.planes[5].normal);}
async function translateOnFrustumAxis(axis)
{
    //
    var vec3 = new THREE.Vector3();
    vec3.copy(axis);
    vec3.applyEuler(cameraPivot.rotation);
    //
    cameraPivot.translateOnAxis(vec3, 0.5);
}

async function handlePauseButton()
{
    debugText("pause!");

    isPlaying = false;

    keyboard = {};

    playerVelocityFromGravity.x = 0;
    playerVelocityFromGravity.y = 0;
    playerVelocityFromGravity.z = 0;

    playerVelocityFromInput.x = 0;
    playerVelocityFromInput.y = 0;
    playerVelocityFromInput.z = 0;
}

async function handleUnpauseButton()
{
    //
    debugText("play!");

    //
    isPlaying = true;
}

async function handleTogglePauseButton()
{
    if(isPlaying)
    {
        handlePauseButton();
    }
    else {
        handleUnpauseButton();
    }
}

async function handleKeyDownOld(e)
{
    //attemptToMoveToTriangleCenter();
    //attemptToLookAtTriangleCenter();

    //
    switch (e.code)
    {
    case 'Digit1':
        cameraPivot.rotation.order = "XYZ";
        break;

    case 'Digit2':
        cameraPivot.rotation.order = "ZYX";
        break;

    case 'Digit3':
        cameraPivot.rotation.order = "YZX";
        break;

    case 'Digit4':
        cameraPivot.rotation.order = "ZXY";
        break;

    case 'Digit5':
        cameraPivot.rotation.order = "YXZ";
        break;

    case 'Digit6':
        cameraPivot.rotation.order = "XZY";
        break;

    case 'Digit8':
        cameraPivotLookAtForward();
        break;

    case 'Digit9':
        cameraLookAtForward();
        break;

    case 'Digit0':
        reAlignCameraToGravity();
        break;

    case 'Space':
        updateFindAndSetClosestGravity();
        break;
    };
}

async function handleMouseDown(e)
{
    //
    //debugText("mouse down");

    //
    const isPointerUnlocked = getIsPointerUnlocked();
    //debugText("pointer unlocked: " + isPointerUnlocked);

    //
    if(isPointerUnlocked)
    {
        debugText("going to handle lock pointer");
        await handleLockPointer();
        return;
    }
    
    //
    keyboard["Mouse" + e.which] = true;

    //
    //debugText(e.which);

    //
    switch(e.which)
    {
        case 1:
            await handleMouseLeftClick(e);
            break;
        case 2:
            await handleMouseRightClick(e);
            break;
    }
}

async function handleMouseUp(e)
{
    //
    keyboard["Mouse" + e.which] = false;
}


async function handleMouseLeftClick(e)
{
    // test only
    cameraPivot.position.y += 0.1;
}
async function handleMouseRightClick(e)
{
    // test only
    cameraPivot.position.y -= 0.1;
}


function cameraLookAtForward()
{
    debugText("does not exist | () cameraLookAtForward")
    return;

    console.log("() look at forward")

    //
    cameraFollower.position.copy(cameraPivot.position);

    //
    cameraFollower.up = terrainObjectTriangleNormals[indexTriangle];
    cameraPivot.up = terrainObjectTriangleNormals[indexTriangle];
    camera.up = terrainObjectTriangleNormals[indexTriangle];

    // old rotation
    const cameraRotationXOld = camera.rotation.x;
    const cameraRotationYOld = camera.rotation.y;
    const cameraRotationZOld = camera.rotation.z;

    //
    const a = new THREE.Vector3(0,0,0);
    a.copy(cameraPivot.position);
    a.addScaledVector(cameraDirection, 1.0);
    camera.lookAt(a);

    return;

    //
    cameraRotationLerpX = cameraRotationXOld - camera.rotation.x;
    cameraRotationLerpY = cameraRotationYOld - camera.rotation.y;
    cameraRotationLerpZ = cameraRotationZOld - camera.rotation.z;
    cameraRotationLerpCount = 200;

    //
    camera.rotation.x = cameraRotationXOld;
    camera.rotation.y = cameraRotationYOld;
    camera.rotation.z = cameraRotationZOld;
}

function updateHelpersWithNewActiveSide()
{

}

function setCurrentGravity(keyIndex)
{
    // early return
    if(keyIndex == null){console.error("not going to set current gravity to null");return;}

    // error management: if we start at null side, update immediately
    if(indexSide == null)
    {
        indexSidePrev = keyIndex;
        indexSide = keyIndex;

        // update camera rotation
        // and reset count
        // we lerp in update()
        // as in, every frame
        gravityDirectionLerpOld.copy(cameraDirectionUp);
        gravityDirectionLerpCount = 0;
    }

    // error management: we need to have Something
    if(gravityDirectionLerpOld == null)
    {
        gravityDirectionLerpOld.copy(cameraDirectionUp);
        gravityDirectionLerpCount = 0;
    }
    
    // todo to-do to do
    // here, we can check current gravity state/index
    // and thus change lerpcountmax accordingly
    // since we want it to be slow in Most cases
    // but when walking off a side
    // we want it to be much faster

    // 2 is falling towards side
    // 4 is leaping off
    if(playerStateGravity == 2 || playerStateGravity == 4)
    {
        gravityDirectionLerpCountMax = gravityDirectionLerpSpeedMin2;
    }
    else {
        gravityDirectionLerpCountMax = HelperCameraRotation.rescale(playerDistanceToPlanet, 17.4, 100, gravityDirectionLerpSpeedMin1, gravityDirectionLerpSpeedMax);
    }
    
    // early return
    if(terrainObjectFloorPlanes[indexSide] == null){console.error("no item at side index");return;}
    if(terrainObjectFloorPlanes[indexSide].normal == null){console.error("no normal at item at side index");return;}
    if(terrainObjectFloorPlanes[indexSide].normal.x == null || terrainObjectFloorPlanes[indexSide].normal.y == null || terrainObjectFloorPlanes[indexSide].normal.z == null){console.error("no normal at item at side index");return;}

    // update gravity index
    // the rest is handled in update()
    console.log(keyIndex + " keyIndex");
    indexSidePrev = indexSide;
    indexSide = keyIndex;

    //
    playerHasPlanetSide = true;

    // if we want to update camera grav perpendiculars only once
    // this is not currently the case
    // so we can probably delete this line
    //updateCameraGravityPerpendiculars();

    //
    // perhaps we want to check current gravity state/index
    // and NOT do this in some circumstances
    // or distance
    resetCameraUp();

    //
    updateHelpers();
}

function updateHelpers()
{
    //
    for(var i = 0; i < indexToHashIdArray.length; i++)
    {
        const index = indexToHashIdArray[i];

        // early continue
        if(indexToHashIdArray[i] == null){continue;}
        //if(terrainObjectPlaneFloorHelperArray[index] == null){continue;}
        
        // floors
        if(index == indexSide && boolShouldDrawHelpers)
        {
            terrainObjectPlaneFloorHelperArray[index].material.opacity = 0.0;//0.1
            terrainObjectPlaneFloorHelperArray[index].children[0].material.opacity = 0.0;//0.1
        }
        else
        {
            terrainObjectPlaneFloorHelperArray[index].material.opacity = 0;
            terrainObjectPlaneFloorHelperArray[index].children[0].material.opacity = 0.0;
        }

        // floor arrows
        if(terrainObjectFloorArrowHelperArray[index] != null)
        {
            if(index == indexSide && boolShouldDrawHelpers)
            {
                terrainObjectFloorArrowHelperArray[index].children[0].material.opacity = 1.0;
                terrainObjectFloorArrowHelperArray[index].children[1].material.opacity = 1.0;
            }
            else
            {
                terrainObjectFloorArrowHelperArray[index].children[0].material.opacity = 0.0;
                terrainObjectFloorArrowHelperArray[index].children[1].material.opacity = 0.0;
            }
        }

        // walls
        for(var j = 0; j < terrainObjectPlaneWallHelperArray[index].length; j++)
        {
            // early continue
            if(terrainObjectPlaneWallHelperArray[index][j] == null){continue;}

            //
            if(index == indexSide && boolShouldDrawHelpers)
            {
                terrainObjectPlaneWallHelperArray[index][j].material.opacity = 0.0;//0.1
                terrainObjectPlaneWallHelperArray[index][j].children[0].material.opacity = 0.0;//0.1
            }
            else
            {
                terrainObjectPlaneWallHelperArray[index][j].material.opacity = 0;
                terrainObjectPlaneWallHelperArray[index][j].children[0].material.opacity = 0;
            }
        }

        // wall arrows
        for(var j = 0; j < terrainObjectWallArrowHelperArray[index].length; j++)
        {
            // early continue
            if(terrainObjectWallArrowHelperArray[index][j] == null){continue;}

            //
            if(index == indexSide && boolShouldDrawHelpers)
            {
                terrainObjectWallArrowHelperArray[index][j].children[0].material.opacity = 1.0;
                terrainObjectWallArrowHelperArray[index][j].children[1].material.opacity = 1.0;
            }
            else
            {
                terrainObjectWallArrowHelperArray[index][j].children[0].material.opacity = 0;
                terrainObjectWallArrowHelperArray[index][j].children[1].material.opacity = 0;
            }
        }
    }
}

function updateFindAndSetClosestGravity()
{
    // early return: no object
    if(terrainObjectCenterPoints == null){console.error("no object");return;}


    // early return: throttling
    if((clock.getElapsedTime() - throttleUpdateClosestGravity) < throttleMaxUpdateClosestGravity){return;}

    // instead of checking for triangles
    // we check for floor planes

    //
    var closestFloorPlaneKeyIndex = null;
    var closestFloorPlaneDistance = 9999;

    //
    for (const [key, value] of Object.entries(terrainObjectCenterPoints))
    {
        // early continue: nothing at value
        if(value == null){console.error("value null");continue;}
        
        //
        const iteratorDistance = Math.abs(value.distanceTo(cameraPivot.position));
        
        //
        if(iteratorDistance == null){console.error("no distance");return;}

        //
        if(iteratorDistance < closestFloorPlaneDistance)
        {
            closestFloorPlaneDistance = iteratorDistance;
            closestFloorPlaneKeyIndex = key;
        }
    }


    /*const len = terrainObjectFloorPlanes.length;

    for(var i = 0; i < len; i++)
    {
        // early continue: no item (this happens)
        if(terrainObjectFloorPlanes[i] == null){continue;}

        //
        const iteratorDistance = Math.abs(terrainObjectFloorPlanes[i].distanceToPoint(cameraPivot.position));
        if(iteratorDistance < closestFloorPlaneDistance)
        {
            closestFloorPlaneDistance = iteratorDistance;
            closestFloorPlaneIndex = i;
        }
    }*/

    // early return: didn't find
    if(closestFloorPlaneKeyIndex == null)
    {
        //console.error("found no!");
        return;
    }

    // end of early returns: reset throttle
    throttleUpdateClosestGravity = clock.getElapsedTime();

    // don't unecessarily upate
    if(indexSide == closestFloorPlaneKeyIndex){return;}

    //
    debugText(closestFloorPlaneKeyIndex + " new closest side");

    //
    setCurrentGravity(closestFloorPlaneKeyIndex);

    return;



    //
    var closestTriangleIndex = -1;
    var closestTriangleDistance = 9999;
    //const len = terrainObjectTrianglePositions.length;

    // find closest
    for(var i = 0; i < len; i++)
    {
        const iteratorDistance = terrainObjectTrianglePositions[i].distanceTo(cameraPivot.position);
        if(iteratorDistance < closestTriangleDistance)
        {
            closestTriangleDistance = iteratorDistance;
            closestTriangleIndex = i;
        }
    }

    // early return: didn't find
    if(i < 0){return;}

    // end of early returns: reset throttle
    //throttleUpdateClosestGravity = clock.getElapsedTime();

    //
    console.log("() updateClosestGravity");

    // update old and lerp count
    gravityDirectionLerpOld.copy(terrainObjectTriangleNormals[indexTriangle]);
    gravityDirectionLerpCount = 0;

    // update gravity index
    // the rest is handled in update()
    indexTriangle = closestTriangleIndex;

    // re-align camera
    //cameraLookAtForward();

    // re-align camera
    //reAlignCameraToGravity();
}

function attemptToMoveToTriangleCenter()
{
    // copy directly
    cameraPivot.position.copy(terrainObjectCenterPoints[indexSide]);
    // move out a bit
    cameraPivot.position.addScaledVector(terrainObjectFloorPlanes[indexSide].normal, 1.0);
    //
    setPlayerStateGravity(2);
    //
    playerVelocityFromGravity.x = 0;
    playerVelocityFromGravity.y = 0;
    playerVelocityFromGravity.z = 0;
    //
    playerVelocityFromInput.x = 0;
    playerVelocityFromInput.y = 0;
    playerVelocityFromInput.z = 0;

    // set throttles and lerp-maxes to match this version
    // this would be equivalent of 1 -> 2 state trigger
    gravityDirectionLerpCountMax = gravityDirectionLerpSpeedMin1;
    throttleMaxUpdateClosestGravity = throttleMaxUpdateClosestGravityMin;

    //

    return;

    // early return: no triangle
    if(indexTriangle < 0){return;}

    //
    console.log("() attemptToMoveToTriangleCenter");

    // move to center
    cameraPivot.position.x = terrainObjectTrianglePositions[indexTriangle].x;
    cameraPivot.position.y = terrainObjectTrianglePositions[indexTriangle].y;
    cameraPivot.position.z = terrainObjectTrianglePositions[indexTriangle].z;

    // move out a bit
    cameraPivot.position.addScaledVector(terrainObjectTriangleNormals[indexTriangle], 1.0);
}

function resetCameraUp()
{
    //
    debugText("reset camera&pivot up direction");
    //
    gravityDirectionLerpOld.copy(camera.up);
    cameraPivot.up.copy(terrainObjectFloorPlanes[indexSide].normal);
    camera.up.copy(terrainObjectFloorPlanes[indexSide].normal);
    gravityDirectionLerpCount = 0;
}

function resetHard()
{
    const indexSideSaved = indexSide;
    //
    setDefaultValuesPositionAndRotation();
    //
    playerStateGravity = 0;
    isPlaying = false;
    indexSide = indexSideSaved;
    playerHasPlanet = true;
    //
    return;
}

function attemptToRotateTowardsTriangleCenter()
{
    return;
    camera.rotateY(0.1);
    //resetCameraUp();
    return;
    const rotationY = 0.1;
    cameraPivot.rotateOnWorldAxis(terrainObjectFloorPlanes[indexSide].normal, rotationY);
}

function attemptToLookAtTriangleCenter()
{
    // early return: throttling
    if((clock.getElapsedTime() - throttleSingleKey) < throttleMaxSingleKey){return;}

    // end of early returns: reset throttle
    throttleSingleKey = clock.getElapsedTime();

    //
    const a = new THREE.Vector3(0,0,0);
    a.copy(cameraPivot.position);

    const alpha = 0.5;
    a.lerp(terrainObjectCenterPoints[indexSide], alpha);

    // update to the lerped direction
    //cameraPivot.up = a;
    //camera.up = a;

    a.copy(terrainObjectFloorPlanes[indexSide].normal);

    cameraPivot.up.copy(a);
    camera.up.copy(a);

    //
    cameraLookAtForwardObject();

    return;

    //
    camera.lookAt(terrainObjectCenterPoints[indexSide]);

    return;

    // early return: no triangle
    if(indexTriangle < 0){return;}

    //
    console.log("() attemptToLookAtTriangleCenter");

    //
    camera.lookAt(terrainObjectTrianglePositions[indexTriangle]);
}

function reAlignCameraToGravity()
{
    // early return: player has no planet side
    if(!playerHasPlanetSide){return;}

    //
    console.log("() reAlignCameraToGravity");

    // successfully realigns
    // though would love to skip the jarring rotation that comes with it
    cameraPivot.quaternion.setFromUnitVectors(scene.up, terrainObjectFloorPlanes[indexSide].normal);
}

function updateCameraGravityPerpendicularsWithSide()
{
    // early return
    if(indexSide == null){return;}
    if(terrainObjectFloorPlanes[indexSide] == null){return;}

    // remember: we prefer to use planes and indexSide instead of triangles

    const invertedNormal = new THREE.Vector3();
    invertedNormal.copy(terrainObjectFloorPlanes[indexSide].normal);
    //invertedNormal.multiplyScalar(-1);

    // cross product
    // of the camera's current direction
    // and the gravity
    directionCameraGravityRight.crossVectors(cameraDirection, invertedNormal);
    directionCameraGravityRight.normalize();

    // we can then use this vector, to get forward
    // we use this order just to get the correct polarity
    directionCameraGravityForward.crossVectors(invertedNormal, directionCameraGravityRight);
    directionCameraGravityForward.normalize();

    cameraDirectionRight.crossVectors(cameraDirection, invertedNormal);
    cameraDirectionRight.normalize();
}

function updateCameraGravityPerpendicularsNoSide()
{
    // perhaps use scene.up here

    // cross product
    // of the camera's current direction
    // and the gravity
    directionCameraGravityRight.crossVectors(cameraDirection, scene.up);
    directionCameraGravityRight.normalize();

    // we can then use this vector, to get forward
    // we use this order just to get the correct polarity
    directionCameraGravityForward.crossVectors(scene.up, directionCameraGravityRight);
    directionCameraGravityForward.normalize();

    cameraDirectionRight.crossVectors(cameraDirection, scene.up);
    cameraDirectionRight.normalize();
}

// we find the camera gravity perpendiculars before we handle movement
// rotation -> update camera gravity perpendiculars -> movement
function updateCameraGravityPerpendiculars()
{
    // early return: not playing
    if(!isPlaying){return;}

    //
    const hasSide = terrainObjectFloorPlanes[indexSide] != null;

    if(hasSide)
    {
        updateCameraGravityPerpendicularsWithSide();
    }
    else {
        updateCameraGravityPerpendicularsNoSide();
    }

    // we run this either way
    cameraDirectionUp.crossVectors(cameraDirection, cameraDirectionRight);
    cameraDirectionUp.normalize();

    //
    updateCameraGravityPerpendicularHelpers();
}

function updateCameraGravityPerpendicularHelpers()
{
    // early return: no side
    if(indexSide == null){return;}
    if(terrainObjectCenterPoints[indexSide] == null){return;}

    // update arrow helper positions
    directionCameraGravityForwardArrowHelper.position.x = terrainObjectCenterPoints[indexSide].x;
    directionCameraGravityForwardArrowHelper.position.y = terrainObjectCenterPoints[indexSide].y;
    directionCameraGravityForwardArrowHelper.position.z = terrainObjectCenterPoints[indexSide].z;

    directionCameraGravityRightArrowHelper.position.x = terrainObjectCenterPoints[indexSide].x;
    directionCameraGravityRightArrowHelper.position.y = terrainObjectCenterPoints[indexSide].y;
    directionCameraGravityRightArrowHelper.position.z = terrainObjectCenterPoints[indexSide].z;

    // but let's move them outwards a little
    directionCameraGravityForwardArrowHelper.position.addScaledVector(terrainObjectFloorPlanes[indexSide].normal, 0.5);
    directionCameraGravityRightArrowHelper.position.addScaledVector(terrainObjectFloorPlanes[indexSide].normal, 0.5);

    // update
    directionCameraGravityRightArrowHelper.setDirection(directionCameraGravityRight);
    directionCameraGravityForwardArrowHelper.setDirection(directionCameraGravityForward);
} 

function updateCameraGravityPerpendicularHelpersOLD()
{
    // update arrow helper positions
    directionCameraGravityForwardArrowHelper.position.x = terrainObjectTrianglePositions[indexTriangle].x;
    directionCameraGravityForwardArrowHelper.position.y = terrainObjectTrianglePositions[indexTriangle].y;
    directionCameraGravityForwardArrowHelper.position.z = terrainObjectTrianglePositions[indexTriangle].z;

    directionCameraGravityRightArrowHelper.position.x = terrainObjectTrianglePositions[indexTriangle].x;
    directionCameraGravityRightArrowHelper.position.y = terrainObjectTrianglePositions[indexTriangle].y;
    directionCameraGravityRightArrowHelper.position.z = terrainObjectTrianglePositions[indexTriangle].z;

    // but let's move them outwards a little
    directionCameraGravityForwardArrowHelper.position.addScaledVector(terrainObjectTriangleNormals[indexTriangle], 0.5);
    directionCameraGravityRightArrowHelper.position.addScaledVector(terrainObjectTriangleNormals[indexTriangle], 0.5);

    // update
    directionCameraGravityRightArrowHelper.setDirection(directionCameraGravityRight);
    directionCameraGravityForwardArrowHelper.setDirection(directionCameraGravityForward);
}

// mouse & keyboard
function checkControlsMovementMK()
{
    // early return:
    // we need to have controls
    // OR
    // we need to be in debug mode

    // formatted as
    // we do not have controls
    // AND
    // we are not in debug mode
    // return

    // early return: stated above
    //if(!hasControls && !boolTextControls){return;}

    // get input
    playerInputPolarityLeftRight = (keyboard["KeyA"] ? -1 : (keyboard["KeyD"] ? 1 : 0));
    playerInputPolarityForwardBackward = (keyboard["KeyW"] ? 1 : (keyboard["KeyS"] ? -1 : 0));
    playerInputPolarityUpDown = ((keyboard["KeyQ"] || keyboard["Mouse4"]) ? -1 : ((keyboard["KeyE"] || keyboard["Mouse5"]) ? 1 : 0));

    // early return: no input
    if(playerInputPolarityLeftRight == 0 && playerInputPolarityForwardBackward == 0 && playerInputPolarityUpDown == 0)
    {
        playerVelocityFromInput.x = 0;
        playerVelocityFromInput.y = 0;
        playerVelocityFromInput.z = 0;
        return;
    }
    else if (playerInputPolarityLeftRight == 0)
    {
        playerVelocityFromInput.x = 0;
    }
    else if (playerInputPolarityForwardBackward == 0)
    {
        playerVelocityFromInput.z = 0;
    }
    else if (playerInputPolarityUpDown == 0)
    {
        playerVelocityFromInput.y = 0;
    }

    //
    sumVelocityFromPlayerInput();
    sumVelocityFromPlayerInputOLD();
}

const velocityAccelerationLeftRight = 0.005;
const velocityAccelerationForwardBackward = 0.005;
const velocityAccelerationUpDown = 0.005;
function sumVelocityFromPlayerInput()
{
    // early return:
    if(terrainObjectFloorPlanes[indexSide] == null) { return; }

    // we treat this vector as strength ONLY
    // since the directions are sort of hard fixed

    // .y = up/down
    // .z = forward/backward
    // .x = left/right

    playerVelocityFromInput.y += velocityAccelerationUpDown * playerInputPolarityUpDown;
    playerVelocityFromInput.z += velocityAccelerationForwardBackward * playerInputPolarityForwardBackward;
    playerVelocityFromInput.x += velocityAccelerationLeftRight * playerInputPolarityLeftRight;

    //
    clampVelocityFromInput();

    //
    return;
}

function sumVelocityFromPlayerInputOLD()
{
    return;

    // if we modify .x .y .z directly...
    // ...then we are operating in world space
    // if we were to use .translateOnAxis()
    // we would operate in local space
    // in this instance
    // we want to move in world space
    // the difference is examplified here:
    // https://discourse.threejs.org/t/animate-an-object-by-a-world-global-axis/20085/2

    // we use the horizontal & vertical consts to dictate polarity
    //cameraPivot.position.x += directionCameraGravityForward.x * 0.1 * verticalPolarity;
    cameraPivot.position.y += directionCameraGravityForward.y * 0.1 * verticalPolarity;
    cameraPivot.position.z += directionCameraGravityForward.z * 0.1 * verticalPolarity;

    //
    cameraPivot.translateX(directionCameraGravityForward.x * 0.1 * verticalPolarity);

    // we do the same for right-left movement
    // we could probably combine the two, but who cares right now
    cameraPivot.position.x += directionCameraGravityRight.x * 0.1 * horizontalPolarity;
    cameraPivot.position.y += directionCameraGravityRight.y * 0.1 * horizontalPolarity;
    cameraPivot.position.z += directionCameraGravityRight.z * 0.1 * horizontalPolarity;
}

const outerWallOffset = 1.5;
//const distToOuterWalls = [0,0,0,0,0];
function updateIsPlayerWithinCurrentPlanetSide()
{
    // keep track of last frame
    // so that we can trigger events when this happens
    playerIsWithinAllOuterWallsPrev = playerIsWithinAllOuterWalls;
    // loop through all outer walls
    // if any is false, we have our answer
    // otherwise, assume we are inside
    playerIsWithinAllOuterWalls = true;
    for (const [key, value] of Object.entries(terrainObjectSidesWithOuterWalls))
    {
        // early continue: wrong key
        if(key != indexSide){continue;}

        //
        const len = value.length;

        //
        for(var i = 0; i < len; i++)
        {
            const signedDistToPoint = value[i].distanceToPoint(cameraPivot.position);
            //distToOuterWalls[i] = signedDistToPoint;
            const isWithin = (signedDistToPoint >= -outerWallOffset);
            // break loop if any is false
            if(!isWithin)
            {
                playerIsWithinAllOuterWalls = false;
                break;
            }
        }
    }
}

const distanceToFloorOffset = 1.5;

function updateIsPlayerAboveCurrentPlane()
{
    // early return: player has no planet side
    if(!playerHasPlanetSide){playerIsAboveCurrentFloorPlane = true;return;}

    //
    playerIsAboveCurrentFloorPlanePrev = playerIsAboveCurrentFloorPlane;
    playerIsAboveCurrentFloorPlane = (playerDistanceToFloor >= distanceToFloorOffset);
}

function updateIsPlayerInsidePlanet()
{
    // early return: player has no planet side
    if(!playerHasPlanetSide){return;}

    //
    if(playerDistanceToFloor <= -distanceToFloorOffset)
    {
        // player is inside planet
        // panic!
        debugText("panic! inside the planet!");
        setPlayerStateGravity(3);
        playerVelocityFromGravity.addScaledVector(terrainObjectFloorPlanes[indexSide].normal, 1.0);
    }
}

function setPlayerStateGravity(stateToUpdateTo)
{
    // -1: unset / default
    // 0: falling towards planet center
    // 1: falling in planet side normal direction
    // 2: on the ground
    // 3: inside planet

    // we never want to update if the current state wouldn't change
    // this would mess up our triggers on change
    if(playerStateGravity == stateToUpdateTo){return;}

    //
    playerStateGravityPrev = playerStateGravity;
    playerStateGravity = stateToUpdateTo;

    // error check
    // if our current state is valid
    // but our previous state is not valid
    // we need to set the previous state directly
    if(playerStateGravityPrev < 0 && playerStateGravity >= 0){playerStateGravityPrev = playerStateGravity;}

    //
    debugText(playerStateGravityPrev + " → " + playerStateGravity);

    // at this point
    // since we know this only runs once
    // we can add special events based on which the previous state was
    // and which the new state was
    // such as negating velocity and such
    updatePlayerStateGravityTrigger();
}

function updatePlayerStateGravityTrigger()
{
    // playerStateGravity == 0
    // we are falling towards the planet
    // playerStateGravity == 1
    // we are falling towards the floor
    // but with a velocity addend
    // that is lerped between floor and planet
    // playerStateGravity == 2
    // we are snapped to the floor
    // playerStateGravity == 3
    // we are underneath the floor!
    // snap us back up to the surface!
    // playerStateGravity == 4
    // we are leaping from the edge of a side
    // we do not want to update to the closest side at this time
    // playerStateGravity == 5
    // we are falling towards the floor
    // after having leapt off the side


    if(playerStateGravityPrev == 0 && playerStateGravity == 0)
    {
        //
        console.log("");
        console.log("this is run exactly once at the start; we can use it to set side");

        //
        gravityDirectionLerpCountMax = gravityDirectionLerpSpeedMax;
        throttleMaxUpdateClosestGravity = throttleMaxUpdateClosestGravityMax;

        //
        throttleUpdateClosestGravity = -throttleMaxUpdateClosestGravity;
        updateFindAndSetClosestGravity();
    }

    // if we used to be far away from the planet
    // but we no longer are
    // we have entered the hemisphere
    if(playerStateGravityPrev == 0 && playerStateGravity == 1)
    {
        //
        debugText("planet falling → side falling");

        //
        gravityDirectionLerpCountMax = gravityDirectionLerpSpeedMin1;
        throttleMaxUpdateClosestGravity = throttleMaxUpdateClosestGravityMax;
        
        //
        //playerVelocityFromGravity.x = 0;
        //playerVelocityFromGravity.y = 0;
        //playerVelocityFromGravity.z = 0;

        //
        updatePlayerEnteredHemisphere();
    }
    // 1 and 5 are basically synonyms
    else if((playerStateGravityPrev == 1 || playerStateGravityPrev == 5) && playerStateGravity == 2)
    {
        //
        debugText("side falling → snap to floor");

        //
        gravityDirectionLerpCountMax = gravityDirectionLerpSpeedMin1;
        throttleMaxUpdateClosestGravity = throttleMaxUpdateClosestGravityMin;// at this point, we choose the shortest throttle for checking closest side

        //
        const velocityInDirectionToFloor = getVelocityComponentInFloorDirection();

        //
        updateIsPlayerWithinCurrentPlanetSide();
        playerIsAboveCurrentFloorPlanePrev = playerIsAboveCurrentFloorPlane;
        playerIsAboveCurrentFloorPlane = true;

        //
        if(playerIsWithinAllOuterWalls)
        {
            playerVelocityFromGravity.x = 0;
            playerVelocityFromGravity.y = 0;
            playerVelocityFromGravity.z = 0;
        }
        else
        {
            // we are outside of the walls
            // so we need to check closest side again
            // reset throttle
            throttleUpdateClosestGravity = -throttleMaxUpdateClosestGravity;
            //
            updateFindAndSetClosestGravity();
        }

        // perhaps we need to check for the closest side as well?
        //
        //resetCameraUp();
    }
    else if(playerStateGravityPrev == 2 && playerStateGravity == 1)
    {
        //
        //resetCameraUp();
    }

    // we are supposedly inside the planet at state 3
    else if(playerStateGravityPrev != 3 && playerStateGravity == 3)
    {
        // supposedly inside the planet
        debugText("inside the planet! snap to surface, tbh...");

        //
        updateFindAndSetClosestGravity();

        //
        snapPlayerToFloor();
    }
    else if(playerStateGravityPrev != 4 && playerStateGravity == 4)
    {
        debugText("leap!");
    }
    else if(playerStateGravityPrev == 4 && playerStateGravity == 5)
    {
        //
        debugText("from leap to side-falling!");

        // we need to update our throttles
        // to be much faster
        // we also reset them
        throttleUpdateClosestGravity = -throttleMaxUpdateClosestGravity;
        throttleMaxUpdateClosestGravity = throttleMaxUpdateClosestGravityMin;// at this point, we choose the shortest throttle for checking closest side
    }
}

function updatePlayerStateGravity()
{
    // early return: not playing
    if(!isPlaying){return;}

    // 
    if(playerStateGravity < 0)
    {
        // if we are far away, we just fall directly towards a planet's center
        if(playerDistanceToPlanet > 50.0)
        {
            //
            gravityDirectionLerpCountMax = 24;
            //
            setPlayerStateGravity(0);
            return;
        }
    }
    
    // we are falling towards the planet
    else if(playerStateGravity == 0)
    {
        //
        if(playerDistanceToPlanet <= 50.0 && playerDistanceToPlanetPrev > 50.0)
        {
            // this should be moved to when we actually call rotate
            // or the state change trigger
            //gravityDirectionLerpCountMax = gravityDirectionLerpSpeedMin1;
            //
            setPlayerStateGravity(1);
            return;
        }

        // check for side every frame...
        // unneccesarry?
        if(playerDistanceToPlanet < 100.0)
        {
            updateFindAndSetClosestGravity();
        }
    }

    // we do have a side at this point
    // now we check distance
    else if(playerStateGravity == 1 || playerStateGravity == 5)
    {
        // playerStateGravity == 5 is basically a duplicate of playerStateGravity == 1
        // we could move it to be on its own
        // or keep it here for now

        // we never want to be inside the planet; we can check that first
        if((Math.abs(playerDistanceToPlanet) - distanceToFloorOffset * 1.0) < distanceToPlanetMin)
        {
            setPlayerStateGravity(3);
            return;
        }

        //
        if(Math.abs(playerDistanceToPlanet) > 50.0)
        {
            setPlayerStateGravity(0);
            return;
        }

        // we need to know if we are inside the side walls
        // only if we are should we snap down
        // otherwise
        // we should check closest side (every frame ?)
        updateIsPlayerWithinCurrentPlanetSide();

        //
        if(playerIsWithinAllOuterWalls)
        {
            //
            const velocityInDirectionToFloor = getVelocityComponentInFloorDirection();
            // if our distance to floor
            // is shorter than our velocity towards it
            // we can apply a special state that snaps us to it
            if((playerDistanceToFloor - distanceToFloorOffset) <= velocityInDirectionToFloor)
            {
                if((playerDistanceToFloorPrev - distanceToFloorOffset) > velocityInDirectionToFloor)
                {
                    //
                    setPlayerStateGravity(2);
                    return;
                }
            }
            else
            {
                // fall towards the side
                // will check for new closest side every frame
                // is this necessary?
                // works for now I guess
                //
                updateFindAndSetClosestGravity();
            }
        }
        else
        {
            //
            updateFindAndSetClosestGravity();
        }

        
        /*
        else if(playerStateGravity == 1 || playerStateGravity == 2)
        {
            // this function is throttled
            // if one want it to check immediately...
            // ...reset the throttle first
            setPlayerStateGravity(2);
            updateFindAndSetClosestGravity();
        }
        else if(!playerIsWithinAllOuterWalls && !playerIsAboveCurrentFloorPlane)
        {
            // player went outside
            updatePlayerWentOutside();
        }
        */
    }
    else if(playerStateGravity == 2)
    {
        // we first check if we are too high above the floor
        // if so, we can change the state
        // to planet-falling mode
        if(Math.abs(playerDistanceToPlanet) > 50.0)
        {
            setPlayerStateGravity(0);
            return;
        }

        /*
        
        // when would we want to do this? the idea is that when we leave the ground... but idk this may create more trouble than it's worth
        // we also want to negate gravity? but we can do that in trigger

        // side falling mode
        // is instead based on plane distance
        if(Math.abs(playerDistanceToFloor) > 5.0)
        {
            setPlayerStateGravity(1);
            return;
        }
        */

        // now we can check if we went outside
        updateIsPlayerWithinCurrentPlanetSide();
        if(!playerIsWithinAllOuterWalls)
        {
            updatePlayerWentOutside();
            return;
        }
    }
    else if(playerStateGravity == 3)
    {
        // inside the planet
    }
    else if(playerStateGravity == 4)
    {
        // leaping

        // we only need to check distance to current plane... I think
        // unless we have enough speed to leave the planet... which is what I'm currently experiencing
        if((playerDistanceToFloor + distanceToFloorOffset) < distanceToFloorOffset)
        {
            // 1 is falling towards floor, but from the planet
            // so we Could use that one
            // but I'd prefer to create a new one
            // that way
            // we can easily use different camera rotations
            // and perhaps falling speeds
            // 5 it is
            debugText("player is below floor offset!");
            debugText(playerDistanceToFloor + " vs " + distanceToFloorOffset);
            setPlayerStateGravity(5);
        }
    }
}

function updatePlayerWentOutside()
{
    // throttle?

    //
    const shouldLeap = true;
    
    //
    if(shouldLeap)
    {
        // do not snap down
        // give us momentum forward and slightly up instead
        // and change gravity state to falling mode

        // because of how we do input speeds (they are frequently reset to 0)
        // we should probably use gravity velocity
        // if we don't want to create an entirely new velocity just for this
        // or create a new state that negates all other movement for the duration

        // we can scale our velocity based on planet size
        const leapVelocityHorizontal = distanceToPlanetMin * 0.005;
        const leapVelocityVertical = distanceToPlanetMin * 0.015;

        // let's try with grav first
        // we add velocity to our up direction
        playerVelocityFromGravity.addScaledVector(terrainObjectFloorPlanes[indexSide].normal, leapVelocityVertical);
        // and our current moving direction
        // NOT the camera or perpendicular directions
        var a = new THREE.Vector3();
        a.copy(playerVelocityFromInputDirection);
        a.normalize();
        playerVelocityFromGravity.addScaledVector(a, leapVelocityHorizontal);

        //
        setPlayerStateGravity(4);// we should have a unique grav state for this circumstance // because (1) will update closest side // we do NOT want this // let's use 4 (though 3 seems to be unused at the moment)
        playerIsWithinAllOuterWalls = false;
    }
    else
    {
        //
        const indexBeforeUpdate = indexSide;

        //
        updateFindAndSetClosestGravity();

        // early return: if indexSide is not update, we are still on the old one
        // and we do not need to do anything new
        if(indexBeforeUpdate == indexSide)
        {
            //debugText("tried to outside, but we're still on the same side");
            return;
        }

        // snap down
        debugText("snap to floor!");
        snapPlayerToFloor();
    }

    return;

    //
    const velocityInDirectionToFloor = getVelocityComponentInFloorDirection();
    if((playerDistanceToFloor - distanceToFloorOffset) > velocityInDirectionToFloor)
    {
        setPlayerStateGravity(1);
    }
}

function snapPlayerToFloor()
{
    // early return: no side
    if(indexSide == null){return;}
    if(terrainObjectFloorPlanes[indexSide] == null){return;}

    //
    precalculateDistanceToFloor();
    const dist = (playerDistanceToFloor - distanceToFloorOffset);
    debugText(dist);
    cameraPivot.position.addScaledVector(terrainObjectFloorPlanes[indexSide].normal, -dist);
    //cameraPivot.translateOnAxis(, dist);

    //
    playerVelocityFromGravity.x = 0;
    playerVelocityFromGravity.y = 0;
    playerVelocityFromGravity.z = 0;

    //
    playerIsWithinAllOuterWalls = true;

    //
    setPlayerStateGravity(2);
}

function updatePlayerVelocityByStateGravity()
{
    // early return: no gravity state
    if(playerStateGravity < 0){return;}

    // from here on
    // we assume that the state set is correct
    // and act accordingly

    // 0: falling towards planet
    if(playerStateGravity == 0)
    {
        updateAddVelocityInDirectionOfPlanet();
    }
    else if (playerStateGravity == 1)
    {
        updateAddVelocityInLerpedDirectionOfGravity();
    }
    else if (playerStateGravity == 2)
    {
        // no velocity from gravity at this point (๑¯ω¯๑)
        // we also remove some directional velocity at another point
    }
    else if (playerStateGravity == 3)
    {
        // we are supposedly inside the planet at state 3
        // so we should try to push ourselves out?
        //updateAddVelocityInDirectionOfFloorGravity();
    }
    else if (playerStateGravity == 4)
    {
        // we have leapt off the planet
        // so we add side velocity only
        updateAddVelocityInDirectionOfFloorGravity();
    }
    else if (playerStateGravity == 5)
    {
        // we are falling towards a side
        // after leaping off the planet
        updateAddVelocityInDirectionOfFloorGravity();
    }
}

function updatePlayerGravity()
{  
    debugText("not currently existing | () updatePlayerGravity");
    return;
    // remember: we prefer to use indexSide, above indexTriangle

    // early return: no controls
    if(getIsPointerUnlocked()){return;}

    // player may not have planet side
    // but they have planet!
    if(!playerHasPlanetSide && playerHasPlanet)
    {
        if(playerDistanceToPlanet > 50.0)
        {
            //
            updateAddVelocityInDirectionOfPlanet();
            //setPlayerStateGravity(0);
            return;
        }
        else if(playerDistanceToPlanet <= 50.0 && playerDistanceToPlanetPrev > 50.0)
        {
            //
            updatePlayerEnteredHemisphere();
            setPlayerStateGravity(1);
            return;
        }
    }

    //
    if(!playerHasPlanetSide){return;}

    //
    updateIsPlayerWithinCurrentPlanetSide();
    updateIsPlayerAboveCurrentPlane();

    // early return:
    // player is within outer walls
    // player was above plane last check
    // but player is now below plane
    if(playerIsWithinAllOuterWalls && playerIsAboveCurrentFloorPlanePrev && !playerIsAboveCurrentFloorPlane)
    {
        //
        updatePlayerLanded();
        setPlayerStateGravity(2);
        return;
    }

    // early return: is within triangle prism, but is below plane
    if(playerIsWithinAllOuterWalls && !playerIsAboveCurrentFloorPlane)
    {
        return;
    }

    // early return:
    // player is above current floor plane
    // player is outside of outer walls
    // but player was within outer walls last check
    if(!playerIsWithinAllOuterWalls && playerIsWithinAllOuterWallsPrev && playerIsAboveCurrentFloorPlane)
    {
        debugText("went outside!");
        // we could make a new function for this specific event
        // updatePlayerWentOutside();
        updateSlowVelocityFromGravity();
        setPlayerStateGravity(1);
        return;
    }

    //
    updateAddVelocityInDirectionOfFloorGravity();


    //
    if(!playerIsWithinAllOuterWalls && !playerIsAboveCurrentFloorPlane)
    {
        // is player within planet at this point? idk
        // we could be directly on the floor

        //
        //setPlayerStateGravity(3);

        //
        updateSlowVelocityFromGravity();

        //
        updateFindAndSetClosestGravity();
    }

    

    // we check that we aren't inside the planet
    // if we are
    // panic!
    updateIsPlayerInsidePlanet();
}

function updateSlowVelocityFromGravity()
{
    //
    playerVelocityFromGravity.x *= 0.5;
    playerVelocityFromGravity.y *= 0.5;
    playerVelocityFromGravity.z *= 0.5;
}

function updatePlayerEnteredHemisphere()
{
    //
    debugText("entered hemisphere!");
    //
    updateFindAndSetClosestGravity();
    //
    resetCameraUp();
}

var isCurrentlyAttemptingToLookAt = false;
function attemptToUpdateRotationTarget()
{
    // https://threejs.org/examples/webgl_math_orientation_transform

    cameraPivot.up.copy(terrainObjectFloorPlanes[indexSide].normal);
    camera.up.copy(terrainObjectFloorPlanes[indexSide].normal);
    //camera.getWorldDirection(cameraDirection);// not needed?
    rotationTargetPosition.copy(cameraPivot.position);
    //rotationTargetPosition.addScaledVector(cameraDirection, 1.0);
    isCurrentlyAttemptingToLookAt = true;
}

function cameraLookAtForwardObject()
{
    // aka
    // attemptToLookAtRotationTarget

    //
    // attemptToUpdateRotationTarget();
    if(!isCurrentlyAttemptingToLookAt){return;}

    //
    rotationMatrix.lookAt(cameraPivot.position, rotationTargetPosition, terrainObjectFloorPlanes[indexSide].normal);
    rotationTargetQuaternion.setFromRotationMatrix(rotationMatrix);

    //
    if (!camera.quaternion.equals(rotationTargetQuaternion))
    {
        const step = rotationSpeed * clockDelta;
        camera.quaternion.rotateTowards(rotationTargetQuaternion, step);
    }
    else
    {
        if(isCurrentlyAttemptingToLookAt)
        {
            rotationTargetPosition.x = 0;
            rotationTargetPosition.y = 0;
            rotationTargetPosition.z = 0;
            isCurrentlyAttemptingToLookAt = false;
        }
    }
}

function cameraLookAtForwardObjectOLD()
{
    //
    rotationTargetPosition.copy(cameraPivot.position);
    rotationTargetPosition.addScaledVector(cameraDirection, 1.0);

    //
    camera.lookAt(rotationTargetPosition);
}

function updatePlayerLanded()
{
    debugText("landed! negate gravity! (somehow)");
    //playerShouldApplyGravity = false;
    playerVelocityFromGravity.x = 0;
    playerVelocityFromGravity.y = 0;
    playerVelocityFromGravity.z = 0;
}

const maxGravitySpeed = 0.2;
function clampVelocityFromGravity()
{
    // too fast
    if(playerVelocityFromGravity.length() > maxGravitySpeed)
    {
        playerVelocityFromGravity.normalize();
        playerVelocityFromGravity.multiplyScalar(maxGravitySpeed);
    }
}
function clampVelocityFromGravityCustom(customMaxSpeed)
{
    // too fast
    if(playerVelocityFromGravity.length() > customMaxSpeed)
    {
        playerVelocityFromGravity.normalize();
        playerVelocityFromGravity.multiplyScalar(customMaxSpeed);
    }
}
const maxInputSpeedX = 0.1;
const maxInputSpeedY = 0.1;
const maxInputSpeedZ = 0.1;
function clampVelocityFromInput()
{
    // x
    if(playerVelocityFromInput.x > maxInputSpeedX)
    {
        playerVelocityFromInput.x = maxInputSpeedX;
    }
    else if(playerVelocityFromInput.x < -maxInputSpeedX)
    {
        playerVelocityFromInput.x = -maxInputSpeedX;
    }
    // y
    if(playerVelocityFromInput.y > maxInputSpeedY)
    {
        playerVelocityFromInput.y = maxInputSpeedY;
    }
    else if(playerVelocityFromInput.y < -maxInputSpeedY)
    {
        playerVelocityFromInput.y = -maxInputSpeedY;
    }
    // z
    if(playerVelocityFromInput.z > maxInputSpeedZ)
    {
        playerVelocityFromInput.z = maxInputSpeedZ;
    }
    else if(playerVelocityFromInput.z < -maxInputSpeedZ)
    {
        playerVelocityFromInput.z = -maxInputSpeedZ;
    }
}

function updateAddVelocityInDirectionOfPlanet()
{
    // early return: not currently playing
    if(!isPlaying){return;}

    // early return: do not add velocity if we are already too fast
    //if(playerVelocityFromGravity.length() > maxGravitySpeed){return;}

    // direction
    const directionToPlanet = new THREE.Vector3();
    directionToPlanet.subVectors(terrainObject.position, cameraPivot.position);
    directionToPlanet.normalize();

    // we apply gravity
    // only if the direction (dot product)
    // isn't already there
    const normalized = new THREE.Vector3();
    normalized.copy(playerVelocityFromGravity);
    normalized.normalize();
    const dot = normalized.dot(directionToPlanet);

    //
    //debugText(dot.toFixed(2) + " | " + playerVelocityFromGravity.length().toFixed(2));

    //
    if(dot <= 0.9)
    {
        // less than 1, really, but floats have precision problems, and we usually get 0.9999~
        // wrong direction
        playerVelocityFromGravity.addScaledVector(directionToPlanet, 0.02);
    }
    else
    {
        if(playerVelocityFromGravity.length() <= maxGravitySpeed)
        {
            // in the right direction, but too slow
            playerVelocityFromGravity.addScaledVector(directionToPlanet, 0.002);
        }
    }

    // clamp speed
    clampVelocityFromGravity();


    /*
    else if(playerVelocityFromGravity.length() <= 0.2 && playerVelocityFromGravity.length() >= -0.2)
        {
            playerVelocityFromGravity.addScaledVector(directionToPlanet, 0.02);
        }
    else if(dot <= -0.9 && playerVelocityFromGravity.length() < 0.5)
    {
        playerVelocityFromGravity.addScaledVector(directionToPlanet, 0.02);
    }
        */
}

function updateAddVelocityInLerpedDirectionOfGravity()
{
    // early return: no side
    if(!playerHasPlanetSide){return;}

    // early return: no item at index side
    if(terrainObjectFloorPlanes[indexSide] == null){return;}

    // early return
    if(playerDistanceToFloor == null || playerDistanceToFloor == 0){return;}

    // we need to lerp between our planet direction
    // and the plane (side) direction
    // based on the distance to the plane (side)

    // or more like
    // calculate both velocity addends in both directions
    // and scale them both down
    // to match the lerp
    // then apply them both

    // we know that our distance is between 
    // [5..50]
    // so we use that as our alpha (lerp control)

    // make alpha in the range of
    // [0..1]
    const alpha = Math.abs((playerDistanceToFloor - 5) / 50);

    // one will use alpha
    // the other 1 - alpha

    // we know the direction of the floor
    // we need to get the direction to the planet

    // todo to-do to do
    // calculate direction to planet ONCE at the start of the update()
    // we currently do this multiple times
    // we could also do the same with combinedVelocity, to be honest
    // and just use a different alpha when not in this state
    // as in
    // either 0 or 1, binarily

    // direction to planet
    const directionToPlanet = new THREE.Vector3();
    directionToPlanet.subVectors(terrainObject.position, cameraPivot.position);
    directionToPlanet.normalize();

    // we calculate the combined velocity, with lerp
    var combinedVelocity = new THREE.Vector3(0,0,0);
    combinedVelocity.addScaledVector(terrainObjectFloorPlanes[indexSide].normal, (1 - alpha) * -0.004);
    combinedVelocity.addScaledVector(directionToPlanet, (alpha) * 0.002);

    // we then apply it
    playerVelocityFromGravity.addScaledVector(combinedVelocity, 1.0);
    
    // clamp
    clampVelocityFromGravity();
}

function updateAddVelocityInDirectionOfFloorGravity()
{
    // start of early returns: throttling
    //if((clock.getElapsedTime() - throttleMoveGravity) < throttleMaxMoveGravity){return;}

    // early return: no side
    if(!playerHasPlanetSide){return;}

    // early return: no item at index side
    if(terrainObjectFloorPlanes[indexSide] == null){return;}

    // end of early returns: reset throttle
    //throttleMoveGravity = clock.getElapsedTime();

    // we apply gravity
    // only if the direction (dot product)
    // isn't already there
    const normalized = new THREE.Vector3();
    normalized.copy(playerVelocityFromGravity);
    normalized.normalize();
    const dot = normalized.dot(terrainObjectFloorPlanes[indexSide].normal);

    //
    if(dot >= -0.5)
    {
        playerVelocityFromGravity.addScaledVector(terrainObjectFloorPlanes[indexSide].normal, -0.02);
    }
    else if(playerVelocityFromGravity.length() <= 0.2 && playerVelocityFromGravity.length() >= -0.2)
        {
            playerVelocityFromGravity.addScaledVector(terrainObjectFloorPlanes[indexSide].normal, -0.02);
        }
    else if(dot <= -0.9 && playerVelocityFromGravity.length() < 0.5)
    {
        playerVelocityFromGravity.addScaledVector(terrainObjectFloorPlanes[indexSide].normal, -0.02);
    }

    // clamp
    clampVelocityFromGravityCustom(maxGravitySpeed * 2);
}

function updateCameraLerp()
{
    // early return: throttling
    //if((clock.getElapsedTime() - throttleCameraLerp) < throttleMaxCameraLerp){return;}

    // early return: wrong grav state?
    // we only want to do this when we are on the planet, after all
    // so any too low state should break?
    if(playerStateGravity == 0 || playerStateGravity == 1){return;}

    // early return: flag off
    if(gravityDirectionLerpCount > gravityDirectionLerpCountMax){return;}

    // early return: player has no planet side
    if(!playerHasPlanetSide){return;}
    
    //
    const alpha = gravityDirectionLerpCount / gravityDirectionLerpCountMax;

    //
    if(gravityDirectionLerpCount == 0){
        debugText("start rotation");
        debugText(gravityDirectionLerpCount);
        if(gravityDirectionLerpOld == null){debugText("gravityDirectionLerpOld == null");}
    }

    // end of early returns: reset throttle
    //throttleCameraLerp = clock.getElapsedTime();

    //
    const invertedNormal = new THREE.Vector3();
    invertedNormal.copy(terrainObjectFloorPlanes[indexSide].normal);
    //invertedNormal.multiplyScalar(-1);

    //
    const vec3 = new THREE.Vector3();
    vec3.copy(gravityDirectionLerpOld);
    vec3.lerp(invertedNormal, alpha);

    // update to the lerped direction
    //cameraPivot.up = vec3;
    //camera.up = vec3;

    cameraPivot.up.copy(vec3);
    camera.up.copy(vec3);
    
    //
    cameraLookAtForwardObjectOLD();

    //
    gravityDirectionLerpCount++;

    //
    if(gravityDirectionLerpCount >= gravityDirectionLerpCountMax){debugText("end rotation");}
}

function toggleTextControls()
{
    //
    boolShouldDrawHelpers = !boolShouldDrawHelpers;

    //
    boolTextControls = !boolTextControls;

    hudTextControls.textContent = stringTextControls[(boolTextControls ? 1 : 0)];
    hudTextControlsDouble.textContent = stringTextControls[(boolTextControls ? 1 : 0)];
}

function updateUniforms()
{
    // early return: no init
    if(!hasInit){return;}

    // early return: throttling
    if((clock.getElapsedTime() - throttleUniforms) < throttleMaxUniforms){return;}

    // end of early returns: reset throttle
    throttleUniforms = clock.getElapsedTime();

    //
    //console.log("length of uniform array:");
    //console.log(cloudUniformArray.length);
    for(var i = 0; i < cloudUniformArray.length; i++)
    {
        cloudUniformArray[i].cameraPivotPosition.value.copy(cameraPivot.position);
        cloudUniformArray[i].cameraPivotPosition.value.applyMatrix4(camera.matrixWorldInverse);
    }
    //cloud1Uniforms.cameraPivotPosition.value.copy(cameraPivot.position);
    //cloud1Uniforms.cameraPivotPosition.value.applyMatrix4(camera.matrixWorldInverse);

    return;
}

function updateTextLog()
{
    // early return: throttling
    if((clock.getElapsedTime() - throttleTextLog) < throttleMaxTextLog){return;}

    // end of early returns: reset throttle
    throttleTextLog = clock.getElapsedTime();

    //
    var resultString = "";
    const halfTab = "     ";

    // early return: bool
    if(!boolTextControls)
    {
        hudTextStatus.textContent = resultString;
        hudTextStatusDouble.textContent = resultString;
        return;
    }

    //
    resultString += "isPlaying\n";
    resultString += halfTab + isPlaying + "\n";

    //
    resultString += "\n";
    resultString += "playerStateGravity\n";
    resultString += halfTab + playerStateGravity + "\n";

    //
    resultString += "\n";
    resultString += "cameraPivot.position\n";
    resultString += halfTab + cameraPivot.position.x.toFixed(2) + "\n";
    resultString += halfTab + cameraPivot.position.y.toFixed(2) + "\n";
    resultString += halfTab + cameraPivot.position.z.toFixed(2) + "\n";

    //
    resultString += "\n";
    resultString += "camera.rotation\n";
    resultString += halfTab + camera.rotation.x.toFixed(2) + "\n";
    resultString += halfTab + camera.rotation.y.toFixed(2) + "\n";
    resultString += halfTab + camera.rotation.z.toFixed(2) + "\n";

    //
    resultString += "\n";
    resultString += "cameraPivot.rotation\n";
    resultString += halfTab + cameraPivot.rotation.x.toFixed(2) + "\n";
    resultString += halfTab + cameraPivot.rotation.y.toFixed(2) + "\n";
    resultString += halfTab + cameraPivot.rotation.z.toFixed(2) + "\n";
    
    //
    resultString += "\n";
    resultString += "camera's current\nup direction\n";
    resultString += halfTab + cameraDirectionUp.x.toFixed(2) + "\n";
    resultString += halfTab + cameraDirectionUp.y.toFixed(2) + "\n";
    resultString += halfTab + cameraDirectionUp.z.toFixed(2) + "\n";

    //
    resultString += "\n";
    resultString += "current triangle\nindex\n";
    resultString += halfTab + indexTriangle + "\n";

    //
    resultString += "\n";
    resultString += "current planet\nside index\n";
    resultString += halfTab + indexSide + "\n";

    //
    resultString += "\n";
    resultString += "above current\nplane\n";
    resultString += halfTab + playerIsAboveCurrentFloorPlane + "\n";

    //
    resultString += "\n";
    resultString += "within all planet\nouter walls\n";
    resultString += halfTab + playerIsWithinAllOuterWalls + "\n";

    //
    resultString += "\n";
    resultString += "distance to\ncurrent planet\n";
    resultString += halfTab + playerDistanceToPlanet.toFixed(2) + "\n";

    //
    resultString += "\n";
    resultString += "distance to\ncurrent floor\n";
    resultString += halfTab + playerDistanceToFloor.toFixed(2) + "\n";

    /*
    //
    if(!playerIsWithinAllOuterWalls)
    {
        resultString += "\n";
        for(var i = 0; i < 5; i++)
            {
                resultString += "distance to outer wall ["+ i +"]\n";
                resultString += "\t" + distToOuterWalls[i] + "\n";
            }
    }
            */

    //
    if(indexTriangle != null && terrainObjectTriangleNormals[indexTriangle] != null)
    {
        resultString += "\n";
        resultString += "current triangle's\nnormal direction\n(gravity)\n";
        resultString += halfTab + terrainObjectTriangleNormals[indexTriangle].x.toFixed(2) + "\n";
        resultString += halfTab + terrainObjectTriangleNormals[indexTriangle].y.toFixed(2) + "\n";
        resultString += halfTab + terrainObjectTriangleNormals[indexTriangle].z.toFixed(2) + "\n";
    }

    //
    if(indexSide != null)
    {
        //
        const normalized = new THREE.Vector3();
        normalized.copy(playerVelocityFromGravity);
        normalized.normalize();
        const dot = normalized.dot(terrainObjectFloorPlanes[indexSide].normal);

        //
        resultString += "\n";
        resultString += "gravity velocity\ndot\n";
        resultString += halfTab + dot.toFixed(2) + "\n";
    }

    //
    resultString += "\n";
    resultString += "gravity velocity\n.length()\n";
    resultString += halfTab + playerVelocityFromGravity.length().toFixed(2) + "\n";

    //
    resultString += "\n";
    resultString += "playerVelocity\nFromInput\n";
    resultString += halfTab + playerVelocityFromInput.x.toFixed(2) + "\n";
    resultString += halfTab + playerVelocityFromInput.y.toFixed(2) + "\n";
    resultString += halfTab + playerVelocityFromInput.z.toFixed(2) + "\n";

    //
    if(indexSide != null && terrainObjectFloorPlanes[indexSide] != null)
    {
        resultString += "\n";
        resultString += "terrainObjectFloorPlanes\n[indexSide].normal\n";
        resultString += halfTab + terrainObjectFloorPlanes[indexSide].normal.x.toFixed(2) + "\n";
        resultString += halfTab + terrainObjectFloorPlanes[indexSide].normal.y.toFixed(2) + "\n";
        resultString += halfTab + terrainObjectFloorPlanes[indexSide].normal.z.toFixed(2) + "\n";
    }

    /*
    //
    resultString += "\n";
    resultString += "mouse movement\n";
    resultString += "\t" + mouseX + "\n";
    resultString += "\t" + mouseY + "\n";
    */

    //
    hudTextStatus.textContent = resultString;
    hudTextStatusDouble.textContent = resultString;
}

// to do
// make a separate text debug log
// that is only appends text to it, never clears it
// but we can have a timer I suppose
// that periodically removes the last line of the log
// make it an array in that case?
// with pop functionality
// or easier to alter the text directly
// and split it by the newline character?
// to be determined!

// keyword is stack, or stack log