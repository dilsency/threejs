// to run
// npx serve .

// to upload on itch.io
// zip the whole folder and upload that :)

// to collapse all
// ⌘ + k
// ⌘ + 0

// because of our importmap in index.html
// we can just use the alias/names here
// this will (hopefully) apply to both CDN and local files
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';
import { VertexNormalsHelper } from 'three/addons/helpers/VertexNormalsHelper.js';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

import * as HelperCameraRotation from "helper_camera_rotation";
import * as HelperMesh from "helper_mesh";

// bare minimum
var renderer;
var scene;
var cameraPivot;
var camera;
var cameraDirection;
// directions perpendicular to the forward direction of the camera
// may or may not be useful
var cameraDirectionRight;
var cameraDirectionUp;

// camera gravity perpendiculars
// we move along these axes
var directionCameraGravityForward;
var directionCameraGravityRight;
// arrow helpers
var directionCameraGravityForwardArrowHelper;
var directionCameraGravityRightArrowHelper;

//
var indexTriangle = -1;

// clock
var clock;

// lights
var light1;
var light2;

// will be used to load gltf models
var loaderGLTF;
var loaderOBJ;
// will be used to load textures
var loaderTexture;
// it's useful to have a fallback texture
var defaultTexture;

// reference to terrain object once loaded
var terrainObject;
var terrainObjectIndexArrayLength = 0;
var terrainObjectIndexCount = 0;
var terrainObjectIndexItemSize = 1;
var terrainObjectPositionArrayLength = 0;
var terrainObjectPositionCount = 0;
var terrainObjectPositionItemSize = 1;

var terrainObjectFacesCount = 0;

// vertex positions and normals, for convenience later
var terrainObjectVertexPositions = [];
var terrainObjectVertexNormals = [];

// triangle positions and normals, for convenience later
var terrainObjectTrianglePositions = [];
var terrainObjectTriangleNormals = [];

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
var hudTextControls;
var hudTextControlsDouble;
var hudTextStatus;
var hudTextStatusDouble;

// controls
var keyboard = {};
var hasControls = false;

//
var mouseX = 0;
var mouseY = 0;

//
const throttleMaxTextLog = 0.2;
var throttleTextLog = 0;

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
        camera.getWorldDirection(cameraDirection);

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
    }
    function initLights()
    {
        //
        light1 = new THREE.AmbientLight(0xFFFFFF, 0.5);

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
        scene.add(earthbox);
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
        scene.add(skybox);
    }
    function initTerrain()
    {
        // Load the fallback texture
        loaderTexture.load
        (
            // resource URL
            './textures/texture_default.jpg',
            // onLoad callback
            function (texture)
            {
                defaultTexture = texture;
                defaultTexture.encoding = THREE.sRGBEncoding;
                console.log(defaultTexture);
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
        )

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

        return;

        // Load a glTF resource
        loaderGLTF.load
        (
            // resource URL
            './models/Icosahedron.gltf',
            // called when the resource is loaded
            function (gltf)
            {
                return;
                loadGLTF(gltf);
            },
            // called while loading is progressing
            function (xhr) {
                console.log((xhr.loaded / xhr.total * 100) + '% loaded');
            },
            // called when loading has errors
            function (error) {
                console.error('ERROR: loaderGLTF');
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
        hudTextControls = document.createElement("p");
        hudTextControls.style.position = "fixed";
        hudTextControls.style.zIndex = "2";
        hudTextControls.style.top = "12px";
        hudTextControls.style.right = "24px";
        hudTextControls.style.color = "black";
        hudTextControls.style.fontSize = "14px";
        hudTextControls.style.lineHeight = "16px";
        hudTextControls.style.whiteSpace = "pre-wrap";
        hudTextControls.style.fontFamily = "monospace";
        hudTextControls.style.display = "flex";
        hudTextControls.style.userSelect = "none";

        hudTextControls.style.webkitTextStroke = "3.0px black";
        hudTextControls.style.textStroke = "3.0px black";

        document.body.appendChild(hudTextControls);

        //
        hudTextControlsDouble = document.createElement("p");
        hudTextControlsDouble.style.position = "fixed";
        hudTextControlsDouble.style.zIndex = "3";
        hudTextControlsDouble.style.top = "12px";
        hudTextControlsDouble.style.right = "24px";
        hudTextControlsDouble.style.color = "#FFFFFF";
        hudTextControlsDouble.style.fontSize = "14px";
        hudTextControlsDouble.style.lineHeight = "16px";
        hudTextControlsDouble.style.whiteSpace = "pre-wrap";
        hudTextControlsDouble.style.fontFamily = "monospace";
        hudTextControlsDouble.style.display = "flex";
        hudTextControlsDouble.style.userSelect = "none";

        hudTextControlsDouble.style.webkitTextStroke = "none";
        hudTextControlsDouble.style.textStroke = "none";
        
        document.body.appendChild(hudTextControlsDouble);

        //
        const stringRes = "[LeftClick] the screen\nto start controlling\n\n[Escape] to unlock\n\n[W][A][S][D] to move\nperpendicular to current gravity\n\n[Spacebar] to update gravity direction\nto the closest triangle's normal direction\n\nWhen doing so,\nI want to unskew the camera\nto align with the current plane\nBut I don't know how to yet\n\n[LeftArrow][RightArrow] to manually\ntilt camera with camera.rotateZ()\n\n[1] to teleport to center of triangle\n[2] to .lookAt() center point\n\n[1]→[2] will correctly\nunskew the camera\nto align with the current plane";
        hudTextControls.textContent = stringRes;
        hudTextControlsDouble.textContent = stringRes;

        //
        hudTextStatus = document.createElement("p");
        hudTextStatus.style.position = "fixed";
        hudTextStatus.style.zIndex = "2";
        hudTextStatus.style.top = "12px";
        hudTextStatus.style.left = "24px";
        hudTextStatus.style.color = "black";
        hudTextStatus.style.fontSize = "14px";
        hudTextStatus.style.lineHeight = "16px";
        hudTextStatus.style.whiteSpace = "pre-wrap";
        hudTextStatus.style.fontFamily = "monospace";
        hudTextStatus.style.display = "flex";
        hudTextStatus.style.userSelect = "none";

        hudTextStatus.style.webkitTextStroke = "3.0px black";
        hudTextStatus.style.textStroke = "3.0px black";

        document.body.appendChild(hudTextStatus);

        //
        hudTextStatusDouble = document.createElement("p");
        hudTextStatusDouble.style.position = "fixed";
        hudTextStatusDouble.style.zIndex = "3";
        hudTextStatusDouble.style.top = "12px";
        hudTextStatusDouble.style.left = "24px";
        hudTextStatusDouble.style.color = "#FFFFFF";
        hudTextStatusDouble.style.fontSize = "14px";
        hudTextStatusDouble.style.lineHeight = "16px";
        hudTextStatusDouble.style.whiteSpace = "pre-wrap";
        hudTextStatusDouble.style.fontFamily = "monospace";
        hudTextStatusDouble.style.display = "flex";
        hudTextStatusDouble.style.userSelect = "none";

        hudTextStatusDouble.style.webkitTextStroke = "none";
        hudTextStatusDouble.style.textStroke = "none";
        
        document.body.appendChild(hudTextStatusDouble);

        //
        hudReticle = document.createElement("div");
        hudReticle.style.position = "fixed";
        hudReticle.style.zIndex = "2";
        hudReticle.style.top = "calc(50% - 15px)";
        hudReticle.style.left = "calc(50% - 15px)";
        hudReticle.style.width = "30px";
        hudReticle.style.height = "30px";
        hudReticle.style.transform = "rotate(45deg)";
        hudReticle.style.display = "none";
        document.body.appendChild(hudReticle);
        //
        var hudReticleTop = document.createElement("div");
        hudReticleTop.style.position = "absolute";
        hudReticleTop.style.top = "0";
        hudReticleTop.style.left = "5px";
        hudReticleTop.style.background = "#00FF00";
        hudReticleTop.style.height = "5px";
        hudReticleTop.style.width = "20px";
        hudReticleTop.style.borderTop = "1px solid black";
        hudReticleTop.style.borderBottom = "1px solid black";
        hudReticle.appendChild(hudReticleTop);
        //
        var hudReticleBottom = document.createElement("div");
        hudReticleBottom.style.position = "absolute";
        hudReticleBottom.style.bottom = "0";
        hudReticleBottom.style.left = "5px";
        hudReticleBottom.style.background = "#00FF00";
        hudReticleBottom.style.height = "5px";
        hudReticleBottom.style.width = "20px";
        hudReticleBottom.style.borderTop = "1px solid black";
        hudReticleBottom.style.borderBottom = "1px solid black";
        hudReticle.appendChild(hudReticleBottom);
        //
        var hudReticleLeft = document.createElement("div");
        hudReticleLeft.style.position = "absolute";
        hudReticleLeft.style.top = "5px";
        hudReticleLeft.style.left = "0";
        hudReticleLeft.style.background = "#00FF00";
        hudReticleLeft.style.height = "20px";
        hudReticleLeft.style.width = "5px";
        hudReticleLeft.style.borderLeft = "1px solid black";
        hudReticleLeft.style.borderRight = "1px solid black";
        hudReticle.appendChild(hudReticleLeft);
        //
        var hudReticleRight = document.createElement("div");
        hudReticleRight.style.position = "absolute";
        hudReticleRight.style.top = "5px";
        hudReticleRight.style.right = "0";
        hudReticleRight.style.background = "#00FF00";
        hudReticleRight.style.height = "20px";
        hudReticleRight.style.width = "5px";
        hudReticleRight.style.borderLeft = "1px solid black";
        hudReticleRight.style.borderRight = "1px solid black";
        hudReticle.appendChild(hudReticleRight);
        //
        var hudReticleTopLeft = document.createElement("div");
        hudReticleTopLeft.style.position = "absolute";
        hudReticleTopLeft.style.top = "0";
        hudReticleTopLeft.style.left = "0";
        hudReticleTopLeft.style.background = "#00FF00";
        hudReticleTopLeft.style.height = "5px";
        hudReticleTopLeft.style.width = "5px";
        hudReticleTopLeft.style.borderTop = "1px solid black";
        hudReticleTopLeft.style.borderLeft = "1px solid black";
        hudReticle.appendChild(hudReticleTopLeft);
        //
        var hudReticleTopRight = document.createElement("div");
        hudReticleTopRight.style.position = "absolute";
        hudReticleTopRight.style.top = "0";
        hudReticleTopRight.style.right = "0";
        hudReticleTopRight.style.background = "#00FF00";
        hudReticleTopRight.style.height = "5px";
        hudReticleTopRight.style.width = "5px";
        hudReticleTopRight.style.borderTop = "1px solid black";
        hudReticleTopRight.style.borderRight = "1px solid black";
        hudReticle.appendChild(hudReticleTopRight);
        //
        var hudReticleBottomLeft = document.createElement("div");
        hudReticleBottomLeft.style.position = "absolute";
        hudReticleBottomLeft.style.bottom = "0";
        hudReticleBottomLeft.style.left = "0";
        hudReticleBottomLeft.style.background = "#00FF00";
        hudReticleBottomLeft.style.height = "5px";
        hudReticleBottomLeft.style.width = "5px";
        hudReticleBottomLeft.style.borderBottom = "1px solid black";
        hudReticleBottomLeft.style.borderLeft = "1px solid black";
        hudReticle.appendChild(hudReticleBottomLeft);
        //
        var hudReticleBottomRight = document.createElement("div");
        hudReticleBottomRight.style.position = "absolute";
        hudReticleBottomRight.style.bottom = "0";
        hudReticleBottomRight.style.right = "0";
        hudReticleBottomRight.style.background = "#00FF00";
        hudReticleBottomRight.style.height = "5px";
        hudReticleBottomRight.style.width = "5px";
        hudReticleBottomRight.style.borderBottom = "1px solid black";
        hudReticleBottomRight.style.borderRight = "1px solid black";
        hudReticle.appendChild(hudReticleBottomRight);
    }
    function initControls()
    {
        //
        document.addEventListener("pointerlockchange", handlePointerLockChange, false);

        //
        document.addEventListener("mousemove", handleMouseMove);

        //
        document.addEventListener("mousedown", handleMouseDown, false);

        //
        document.addEventListener("keydown", handleKeyDown);
        document.addEventListener("keyup", handleKeyUp);
    }

    //
    initBareMinimum();
    initLights();

    //
    loaderOBJ = new OBJLoader();
    loaderGLTF = new GLTFLoader();
    loaderTexture = new THREE.TextureLoader();

    //
    initPlayer();
    initEarthAndSky();
    initTerrain();
    initGeometry();
    initHUD();
    initControls();

    //
    update();
}

function loadOBJ(obj)
{
    //
    terrainObject = obj.children[0];
    scene.add(terrainObject);

    //
    terrainObject.scale.x *= 20.0;
    terrainObject.scale.y *= 20.0;
    terrainObject.scale.z *= 20.0;
    terrainObject.position.y -= 3.0;

    //
    terrainObject.material = new THREE.MeshStandardMaterial({ 
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

    // test, idk if this works
    const helper = new VertexNormalsHelper( terrainObject, 1, 0xff0000 );
    scene.add(helper);
    
    //
    setDefaultValues();
}

function setDefaultValues()
{
    indexTriangle = 0;

    cameraPivot.position.x = 4.65974616419644;
    cameraPivot.position.y = -12.73895089518661;
    cameraPivot.position.z = 14.340953607116495;

    camera.rotation.x = 2.301433157336285;
    camera.rotation.y = -0.21353103090011885;
    camera.rotation.z = -0.23222523479005994;

    cameraPivot.rotation.x = 1.9237233376776695;
    cameraPivot.rotation.y = 0.3477231005796906;
    cameraPivot.rotation.z = 2.9216718773123658;
}

function generateTriangleData(terrainObject, terrainObjectPositionAttribute, terrainObjectPositionCount, terrainObjectPositionItemSize, terrainObjectNormalAttribute, terrainObjectNormalCount, terrainObjectNormalItemSize)
{
    // early return: count is different
    if(terrainObjectPositionCount != terrainObjectNormalCount){return;}
    if(terrainObjectPositionItemSize != terrainObjectNormalItemSize){return;}

    //
    for(var i = 0; i < terrainObjectPositionCount; i += terrainObjectPositionItemSize)
    {  
        // position
        const positionTriangleData = HelperMesh.getPositionTriangleData(terrainObject, terrainObjectPositionAttribute, i, terrainObjectPositionItemSize);
        addPositionTriangleDataToList(positionTriangleData);

        // normal
        const normalTriangleData = HelperMesh.getNormalTriangleData(terrainObject, terrainObjectNormalAttribute, i, terrainObjectNormalItemSize);
        addNormalTriangleDataToList(positionTriangleData, normalTriangleData);

        //
        //generateSphereInTriangleCenter(terrainObjectTrianglePositions[i / terrainObjectPositionItemSize]);
        generateArrowInTriangleCenter(i, terrainObjectPositionItemSize);
    }
}

function addPositionTriangleDataToList(positionTriangleData)
{
    // add to vertex list
    for(var i = 0; i < 3; i++)
    {
        terrainObjectVertexPositions.push(new THREE.Vector3(positionTriangleData[i].x, positionTriangleData[i].y, positionTriangleData[i].z));
    }

    // add center (average) to triangle list
    terrainObjectTrianglePositions.push(
        new THREE.Vector3(
            (positionTriangleData[0].x + positionTriangleData[1].x + positionTriangleData[2].x) / 3,
            (positionTriangleData[0].y + positionTriangleData[1].y + positionTriangleData[2].y) / 3,
            (positionTriangleData[0].z + positionTriangleData[1].z + positionTriangleData[2].z) / 3,
        )
    );
}

function generateArrowInTriangleCenter(index, itemSize)
{
    const actualIndex = index / itemSize;

    const length = 1;
    const hex = 0xffff00;

    const arrowHelper = new THREE.ArrowHelper(terrainObjectTriangleNormals[actualIndex], terrainObjectTrianglePositions[actualIndex], length, hex);
    scene.add(arrowHelper);
    arrayArrowHelpers.push(arrowHelper);
}

function addNormalTriangleDataToList(positionTriangleData, normalTriangleData)
{
    // add to vertex list
    for(var i = 0; i < 3; i++)
    {
        terrainObjectVertexNormals.push(new THREE.Vector3(normalTriangleData[i].x, normalTriangleData[i].y, normalTriangleData[i].z));
    }

    // add center (average) to triangle list

    // we get a face normal
    // and convert it to world coordinates
    const faceNormal = HelperMesh.getFaceNormal(
        [positionTriangleData[0], positionTriangleData[1], positionTriangleData[2]],
        [normalTriangleData[0], normalTriangleData[1], normalTriangleData[2]]
    );

    // convert faceNormal from local-space to world-space
    worldNormal.copy(faceNormal).applyMatrix3(normalMatrix).normalize();

    // normalize
    // not sure why the .normalize() above doesn't do this
    // but this one is necessary
    faceNormal.normalize();

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

    // input dictionary is handled by eventlistener
    // so we don't need to bother with it in here?

    // precalculate camera forward direction
    // so that we don't need to call it in functions later on ahead
    // unless we move it I guess?
    precalculateCameraDirection();

    if(!hasControls)
    {
        // the user has no input
        updateNoInput();
    }
    else
    {
        // update gravity perpendiculars
        // these are the axes we actually move on
        // not the camera's directions, directly
        // though we do use the camera to find the correct ones
        // so we can update these ahead of time
        updateCameraGravityPerpendiculars();

        //
        if(keyboard["KeyI"] == true)
        {
            cameraPivot.position.addScaledVector(cameraDirection, 0.1);
        }
        else if(keyboard["KeyL"] == true)
        {
            cameraPivot.position.addScaledVector(cameraDirectionRight, 0.1);
        }
        else if(keyboard["KeyE"] == true)
        {
            cameraPivot.position.addScaledVector(cameraDirectionUp, -0.1);
        }
        else if(keyboard["KeyQ"] == true)
        {
            cameraPivot.position.addScaledVector(cameraDirectionUp, 0.1);
        }

        // attempt to unskew camera
        // we don't know where to stop...
        // ...is the problem
        if(keyboard["ArrowLeft"] == true)
        {
            camera.rotateZ(0.01);
        }
        else if (keyboard["ArrowRight"] == true)
        {
            camera.rotateZ(-0.01);
        }

        //
        checkControlsMovementMK();
    }

    // text log should be last of the update functions
    updateTextLog();

    // must be last
    renderer.render(scene, camera);
}

function precalculateCameraDirection()
{
    // in order to move with the axes
    // we need to update the camera's world direction
    
    // we perhaps do not need to do this every frame
    // but we need to do this before we move
    
    camera.getWorldDirection(cameraDirection);
}

function updateNoInput()
{
}

function handlePointerLockChange(e)
{
    if (getIsPointerLocked())
    {
        console.log("The pointer lock status is now locked");

        // hide reticle
        hudReticle.style.display = "block";
    }
    else
    {
        console.log("The pointer lock status is now unlocked");

        // reset keyboard input
        keyboard = {};

        // hide reticle
        hudReticle.style.display = "none";
    }
}

async function handleLockPointer()
{
    // early return: is already locked
    if(getIsPointerLocked()){return;}

    //
    await renderer.domElement.requestPointerLock();

    //
    setTimeout((() => {
        checkHasControls();
    }), 100);
}

function getIsPointerUnlocked()
{
    return (document.pointerLockElement == null || document.pointerLockElement == undefined || document.pointerLockElement !== renderer.domElement);
}

function getIsPointerLocked()
{
    return !getIsPointerUnlocked();
}

async function handleMouseMove(e)
{
    // early return: mouse need to be locked
    if(getIsPointerUnlocked()){return;}

    //
    mouseX = e.movementX;
    mouseY = e.movementY;
    

    // should these things be moved to update() ?
    // so that we can do everything in a predictable order?
    // just set boolean values here
    // and then act accordingly in update() ?

    // this is also useful because then we can use hasMouseMoved flags
    // which isn't really feasible here
    // now we need to check if we have rotated every frame
    // which we might be able to skip if we haven't rotated

    // early return: is not locked
    if(getIsPointerUnlocked()){return;}

    // for rotation
    // we should always consider axes
    // as things to rotate around
    // in this case, the new up direction
    const rotationY = mouseX * -0.001;
    cameraPivot.rotateOnWorldAxis(terrainObjectTriangleNormals[indexTriangle], rotationY);


    // for movementY, we can just consider rotateX, the local variant
    const rotationX = mouseY * -0.001;
    camera.rotateX(rotationX);
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

var keyForward = false;
var keyBackward = false;
var keyLeft = false;
var keyRight = false;

var keySpace = false;

async function handleKeyUp(e)
{
    keyboard[e.code] = false;
}

var keyArrowLeft = false;
var keyArrowRight = false;
async function handleKeyDown(e)
{
    keyboard[e.code] = true;

    switch (e.code)
    {
        case 'Digit1':
            attemptToMoveToTriangleCenter();
            break;

        case 'Digit2':
            attemptToLookAtTriangleCenter();
            break;

        case 'Space':
            updateClosestGravity();
            break;
    };
}

async function handleMouseDown(e)
{
    console.log("() handleMouseDown");

    //
    if(getIsPointerUnlocked()){handleLockPointer();return;}
    
    //
    console.log(e.which);
    switch(e.which){
        case 1:
            await handleMouseLeftClick(e);
            break;
    }
}


async function handleMouseLeftClick(e)
{
    console.log("() handleMouseLeftClick");

    //
    await handleLockPointer();
}

function updateClosestGravity()
{
    console.log("() updateClosestGravity");

    //
    var closestTriangleIndex = -1;
    var closestTriangleDistance = 9999;
    const len = terrainObjectTrianglePositions.length;

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

    // update gravity index
    // the rest is handled in update every frame...
    // ...which is, uhh, interesting
    indexTriangle = closestTriangleIndex;

    // re-align camera
    // this is the hardest bit
    // which we only have jank "solutions" to so far
    reAlignCameraToGravity();
}

function attemptToMoveToTriangleCenter()
{
    console.log("() attemptToMoveToTriangleCenter");

    // move to center
    cameraPivot.position.x = terrainObjectTrianglePositions[indexTriangle].x;
    cameraPivot.position.y = terrainObjectTrianglePositions[indexTriangle].y;
    cameraPivot.position.z = terrainObjectTrianglePositions[indexTriangle].z;

    // move out a bit
    cameraPivot.position.addScaledVector(terrainObjectTriangleNormals[indexTriangle], 1.0);
}

function attemptToLookAtTriangleCenter()
{
    console.log("() attemptToLookAtTriangleCenter");

    //
    camera.lookAt(terrainObjectTrianglePositions[indexTriangle]);
}

function attemptToRotateToMatchClosest2Vertices()
{
    // we get the vertices of the currently assigned triangle
    var arrayVerticesByDistance = [
        terrainObjectVertexPositions[(indexTriangle * 3) + 0],
        terrainObjectVertexPositions[(indexTriangle * 3) + 1],
        terrainObjectVertexPositions[(indexTriangle * 3) + 2]
    ];

    // we sort by distance to camera pivot
    arrayVerticesByDistance.sort((itemA, itemB) =>
    {
        return compareFnVertexDistanceToCameraPivot(itemA, itemB);
    });

    // now, the first two items will be our two closest vertices

    console.log("");
    console.log("closest vertex A:");
    console.log(arrayVerticesByDistance[0]);
    console.log("closest vertex B:");
    console.log(arrayVerticesByDistance[1]);

    // just for testing
    // let's place ourselves inbetween them

    cameraPivot.position.x = (arrayVerticesByDistance[0].x + arrayVerticesByDistance[1].x) / 2;
    cameraPivot.position.y = (arrayVerticesByDistance[0].y + arrayVerticesByDistance[1].y) / 2;
    cameraPivot.position.z = (arrayVerticesByDistance[0].z + arrayVerticesByDistance[1].z) / 2;

    cameraPivot.position.addScaledVector(terrainObjectTriangleNormals[indexTriangle], 1.0);
}

function compareFnVertexDistanceToCameraPivot(itemA, itemB)
{
    // we first get dist of both items
    const distA = cameraPivot.position.distanceTo(itemA);
    const distB = cameraPivot.position.distanceTo(itemB);

    //
    if (distA < distB) {
      return -1;
    }
    else if (distA > distB) {
      return 1;
    }

    // if the distances are the same
    // we then need to sort in some other way
    // so that vertices with identical distances
    // aren't jumbled together
    if(itemA.x < itemB.x || itemA.y < itemB.y || itemA.z < itemB.z)
    {
        return -1;
    }

    // otherwise, ignore
    return 0;
}

function reAlignCameraToGravity()
{
    console.log("() reAlignCameraToGravity");
}

// we find the camera gravity perpendiculars before we handle movement
// rotation -> update camera gravity perpendiculars -> movement
function updateCameraGravityPerpendiculars()
{
    // update 
    //cameraDirectionRight.copy(cameraDirection);
    //cameraDirectionRight.applyAxisAngle(terrainObjectTriangleNormals[indexTriangle], -Math.PI / 2);
    //cameraDirectionRight.normalize();
    cameraDirectionRight.crossVectors(cameraDirection, terrainObjectTriangleNormals[indexTriangle]);
    cameraDirectionRight.normalize();
    cameraDirectionUp.crossVectors(cameraDirection, cameraDirectionRight);
    cameraDirectionUp.normalize();

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

    // now for the complications
    // find the right directions

    // let's first try with the cross product
    // of the camera's current direction
    // and the gravity
    directionCameraGravityRight.crossVectors(cameraDirection, terrainObjectTriangleNormals[indexTriangle]);
    directionCameraGravityRight.normalize();

    // we can then use this vector, to get forward
    // we use this order just to get the correct polarity
    directionCameraGravityForward.crossVectors(terrainObjectTriangleNormals[indexTriangle], directionCameraGravityRight);
    directionCameraGravityForward.normalize();

    // update
    directionCameraGravityRightArrowHelper.setDirection(directionCameraGravityRight);
    directionCameraGravityForwardArrowHelper.setDirection(directionCameraGravityForward);
}

// mouse & keyboard
function checkControlsMovementMK()
{
    // get input
    const horizontalPolarity = (keyboard["KeyA"] ? -1 : (keyboard["KeyD"] ? 1 : 0));
    const verticalPolarity = (keyboard["KeyW"] ? 1 : (keyboard["KeyS"] ? -1 : 0));

    // early return: no input
    if(horizontalPolarity == 0 && verticalPolarity == 0){return;}

    // if we modify .x .y .z directly...
    // ...then we are operating in world space
    // if we were to use .translateOnAxis()
    // we would operate in local space
    // in this instance
    // we want to move in world space
    // the difference is examplified here:
    // https://discourse.threejs.org/t/animate-an-object-by-a-world-global-axis/20085/2

    // we use the horizontal & vertical consts to dictate polarity
    cameraPivot.position.x += directionCameraGravityForward.x * 0.1 * verticalPolarity;
    cameraPivot.position.y += directionCameraGravityForward.y * 0.1 * verticalPolarity;
    cameraPivot.position.z += directionCameraGravityForward.z * 0.1 * verticalPolarity;

    // we do the same for right-left movement
    // we could probably combine the two, but who cares right now
    cameraPivot.position.x += directionCameraGravityRight.x * 0.1 * horizontalPolarity;
    cameraPivot.position.y += directionCameraGravityRight.y * 0.1 * horizontalPolarity;
    cameraPivot.position.z += directionCameraGravityRight.z * 0.1 * horizontalPolarity;
}

function updateTextLog()
{
    // early return: throttling
    if((clock.getElapsedTime() - throttleTextLog) < throttleMaxTextLog){return;}

    // end of early returns: reset throttle
    throttleTextLog = clock.getElapsedTime();

    //
    var resultString = "";

    //
    resultString += "camera.rotation\n";
    resultString += "\t" + camera.rotation.x.toFixed(2) + "\n";
    resultString += "\t" + camera.rotation.y.toFixed(2) + "\n";
    resultString += "\t" + camera.rotation.z.toFixed(2) + "\n";

    //
    resultString += "\n";
    resultString += "cameraPivot.rotation\n";
    resultString += "\t" + cameraPivot.rotation.x.toFixed(2) + "\n";
    resultString += "\t" + cameraPivot.rotation.y.toFixed(2) + "\n";
    resultString += "\t" + cameraPivot.rotation.z.toFixed(2) + "\n";

    //
    resultString += "\n";
    resultString += "current triangle index\n";
    resultString += "\t" + indexTriangle + "\n";

    //
    resultString += "\n";
    resultString += "current triangle's normal direction (gravity)\n";
    resultString += "\t" + terrainObjectTriangleNormals[indexTriangle].x.toFixed(2) + "\n";
    resultString += "\t" + terrainObjectTriangleNormals[indexTriangle].y.toFixed(2) + "\n";
    resultString += "\t" + terrainObjectTriangleNormals[indexTriangle].z.toFixed(2) + "\n";
    
    //
    resultString += "\n";
    resultString += "mouse movement\n";
    resultString += "\t" + mouseX + "\n";
    resultString += "\t" + mouseY + "\n";

    //
    hudTextStatus.textContent = resultString;
    hudTextStatusDouble.textContent = resultString;
}