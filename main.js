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
var cameraFrustum;

// camera gravity perpendiculars
// we move along these axes
var directionCameraGravityForward;
var directionCameraGravityRight;
// arrow helpers
var directionCameraGravityForwardArrowHelper;
var directionCameraGravityRightArrowHelper;

//
var cameraPointerLockDirection = new THREE.Vector3(0,0,0);
var cameraPointerLockDirectionToAngle = 0.0;
var cameraRotationYAltered = 0.0;

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

// to be used
// to convert local-space normals to world-space normals
var normalMatrix = new THREE.Matrix3(); // create once and reuse
var worldNormal = new THREE.Vector3(); // create once and reuse

// player
var playerRayCaster;

// earth and sky
var earthbox;
var skybox;

// terrain
const terrainColor = new THREE.Color("hsl(0,50%,80%)");

// hud
var hudReticle;
var hudTextStatus;

// operating system (OS)
var isMac = true;
var isWindows = false;


// controls
var hasControls = false;

// mouse
var controlsPointerLock;

//
const throttleMaxCollisionPlayerToTerrain = 0.8;
var throttleCollisionPlayerToTerrain = 0;

//
const throttleMaxTextLog = 1.0;
var throttleTextLog = 0;

//
const resultVec3 = new THREE.Vector3();

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

        //camera.up.set(0,0,1);
        camera.up.set(0,1,0);

        camera.updateProjectionMatrix();
        cameraPivot.add(camera);
        cameraDirection = new THREE.Vector3();
        camera.getWorldDirection(cameraDirection);

        //
        generateFrustum();

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
        //
        playerRayCaster = new THREE.Raycaster();
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
        hudTextStatus = document.createElement("p");
        hudTextStatus.textContent = "";
        hudTextStatus.style.position = "fixed";
        hudTextStatus.style.zIndex = "2";
        hudTextStatus.style.top = "48px";
        hudTextStatus.style.left = "0";
        hudTextStatus.style.backgroundColor = "#000000";
        hudTextStatus.style.color = "#A0A0A0";
        hudTextStatus.style.fontSize = "14px";
        hudTextStatus.style.lineHeight = "16px";
        hudTextStatus.style.whiteSpace = "pre-wrap";
        hudTextStatus.style.fontFamily = "monospace";
        hudTextStatus.style.display = "none";
        document.body.appendChild(hudTextStatus);
    }
    function initControls()
    {
        /*
        //
        controlsPointerLock = new PointerLockControls(camera, document.body);

        //
        controlsPointerLock.addEventListener("change", handleMouseChange);
        controlsPointerLock.addEventListener("lock", handleMouseLock);
        controlsPointerLock.addEventListener("unlock", handleMouseUnlock);
        */

        //
        /*document.addEventListener("click", async () => {
            await document.requestPointerLock();
            await renderer.domElement.requestPointerLock();
        });*/

        //
        document.addEventListener("pointerlockchange", handlePointerLockChange, false);

        //
        document.addEventListener("mousemove", handleMouseMove);

        //
        document.addEventListener("keydown", handleKeyDown);
        document.addEventListener("keyup", handleKeyUp);
    }
    function initEventListeners()
    {
        //
        document.addEventListener("mousedown", handleMouseDown, false);

        //
        //renderer.domElement.addEventListener("mousedown", handleCanvasMouseDown, false);
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
    initEventListeners();

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
    printMeshInfo();
    
    setDefaultValues();
    
    return;

    //
    handleMouseRightClick(null);

    //
    setTimeout((() => {
        attemptToMoveToTriangleCenter();
        attemptToLookAtTriangleCenter();
    }), 400);

    setTimeout((() => {

        console.dir(directionCameraGravityForward);
        cameraPivot.position.y += directionCameraGravityForward.y * -10.0;

    }), 2400);
    

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

function loadGLTF(gltf)
{
    //alternatively:
    //gltf.scene.children[0];

    //
    gltf.scene.scale.x *= 20.0;
    gltf.scene.scale.y *= 20.0;
    gltf.scene.scale.z *= 20.0;
    gltf.scene.position.y -= 3.0;
    scene.add(gltf.scene);

    //
    /*
    gltf.animations; // Array<THREE.AnimationClip>
    gltf.scene; // THREE.Group
    gltf.scenes; // Array<THREE.Group>
    gltf.cameras; // Array<THREE.Camera>
    gltf.asset; // Object
    */



    /*var uniforms = {
        uTime: {type: "float", value: 0.0},
        map: { type: "t", value: defaultTexture},
    };
    var newMaterial = new THREE.ShaderMaterial(
    {
        side: THREE.FrontSide,
        uniforms: uniforms,
        vertexShader: shaderVertexDefault.shaderVertexDefault,
        fragmentShader: shaderFragmentDefault.shaderFragmentDefault
    });*/

    // object that contains the mesh
    //console.log(gltf.scene.children[0]);
    // the mesh itself
    terrainObject = gltf.scene.children[0].children[0];

    // if we want to force smooth shading
    //convertToSmoothShading(terrainObject);

    // if we want to force flat shading
    //convertToFlatShading(terrainObject);

    //
    // we either generate bounding boxes here
    // (best)
    // or we do it in update
    // (worst)
    // but then we get to see them formed :)

    // so for now
    // we comment this out
    //generateBoundingBoxes(terrainObject, count, itemSize, 0);
    
    var hasMaterialMap = false;
    var hasNoMaterialMap = false;

    var countSceneItem = 0;
    var countMeshes = 0;
    var countMaterials = 0;

    //gltf.scene.children[0]
    terrainObject.traverse((o) =>
    {
        if(o.isMesh)
        {
            if(o.material != null)
            {
                if(o.material.map != null)
                {
                    hasMaterialMap = true;

                    const oTexture = o.material.map;
                    gltf.scene.background = oTexture;
                    //uniforms.map.value = oTexture;
                    //o.material = newMaterial;
                }
                else 
                {
                    hasNoMaterialMap = true;

                    //console.log("uniforms.map.value:");
                    //console.log(uniforms.map.value);

                    //uniforms.map.value = defaultTexture;
                    
                    //o.material = newMaterial;
                    o.material = new THREE.MeshStandardMaterial({ 
                        wireframe: false,
                        //color: terrainColor,
                        //vertexColors: THREE.FaceColors,
                        vertexColors: true,
                        //flatShading: true,
                        roughness: 1.0,
                        metalness: 0.0,
                    });
                    o.material.needsUpdate = true;
                }
            }
        }
    });

    //
    generateVertexColors(terrainObject.geometry);
    reGenerateVertexColors(terrainObject.geometry);

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
    printMeshInfo();
    
    //
    //handleMouseRightClick(null);
}

function printMeshInfo()
{
    //
    const indexAttribute = terrainObject.geometry.getIndex();
    if(indexAttribute == null || indexAttribute == undefined)
    {
        terrainObjectIndexArrayLength = 0;
        terrainObjectIndexCount = 0;
        terrainObjectIndexItemSize = 1;
    }
    else
    {
        terrainObjectIndexArrayLength = indexAttribute.array.length;
        terrainObjectIndexCount = indexAttribute.count;
        terrainObjectIndexItemSize = indexAttribute.itemSize;
    }

    //
    const terrainObjectPositionAttribute = terrainObject.geometry.getAttribute("position");
    terrainObjectPositionArrayLength = terrainObjectPositionAttribute.array.length;
    terrainObjectPositionCount = terrainObjectPositionAttribute.count;
    terrainObjectPositionItemSize = terrainObjectPositionAttribute.itemSize;

    //
    const terrainObjectNormalAttribute = terrainObject.geometry.getAttribute("normal");
    const terrainObjectNormalArrayLength = terrainObjectNormalAttribute.array.length;
    const terrainObjectNormalCount = terrainObjectNormalAttribute.count;
    const terrainObjectNormalItemSize = terrainObjectNormalAttribute.itemSize;

    //
    terrainObjectFacesCount = terrainObjectPositionCount / terrainObjectPositionItemSize;

    //
    console.log("");
    console.log("[PRINT MESH]");

    //
    console.log("");
    console.log("[ "+ terrainObjectIndexArrayLength +" ] terrainObjectIndexArrayLength");
    console.log("[ "+ terrainObjectIndexCount +" ] terrainObjectIndexCount");
    console.log("[ "+ terrainObjectIndexItemSize +" ] terrainObjectIndexItemSize");
    console.log("[ "+ terrainObjectIndexCount / terrainObjectIndexItemSize +" ] terrainObjectIndexCount / terrainObjectIndexItemSize");

    //
    console.log("");
    console.log("[ "+ terrainObjectPositionArrayLength +" ] terrainObjectPositionArrayLength");
    console.log("[ "+ terrainObjectPositionCount +" ] terrainObjectPositionCount");
    console.log("[ "+ terrainObjectPositionItemSize +" ] terrainObjectPositionItemSize");
    console.log("[ "+ terrainObjectPositionCount / terrainObjectPositionItemSize +" ] terrainObjectPositionCount / terrainObjectPositionItemSize");

    //
    console.log("[ "+ terrainObjectFacesCount +" ] terrainObjectFacesCount");

    //
    if(terrainObjectIndexCount > 0)
    {
        for(var i = 0; i < terrainObjectIndexCount; i++)
        {
            console.log(indexAttribute.array[i]);
        }
    }
    else {
        console.log("terrainObjectIndexCount == 0");
    }

    // positions
    if(terrainObjectPositionCount > 0)
    {
        for(var i = 0; i < terrainObjectPositionCount; i += terrainObjectPositionItemSize)
        {
            console.log(terrainObjectTrianglePositions[i / 3]);
        }
    }
    else {
        console.log("terrainObjectPositionCount == 0");
    }

    // normals
    if(terrainObjectNormalCount > 0)
    {
        for(var i = 0; i < terrainObjectNormalCount; i += terrainObjectNormalItemSize)
        {
            console.log(terrainObjectTriangleNormals[i / 3]);
        }
    }
    else {
        console.log("terrainObjectNormalCount == 0");
    }

    //.index (which vertex belongs to which triangle)
    //.position
    //.normal
    //.uv
}

function generateVertexData(terrainObject, terrainObjectPositionAttribute, terrainObjectPositionCount, terrainObjectPositionItemSize, terrainObjectNormalAttribute, terrainObjectNormalCount, terrainObjectNormalItemSize)
{
    // early return: count is different
    if(terrainObjectPositionCount != terrainObjectNormalCount){return;}
    if(terrainObjectPositionItemSize != terrainObjectNormalItemSize){return;}

    //
    for(var i = 0; i < terrainObjectPositionCount; i += terrainObjectPositionItemSize)
    {  
        // position
        const positionVertexData = HelperMesh.getPositionVertexData(terrainObject, terrainObjectPositionAttribute, i, terrainObjectPositionItemSize);
        addPositionVertexDataToList(positionVertexData);

        // normal
        const normalVertexData = HelperMesh.getNormalVertexData(terrainObject, terrainObjectNormalAttribute, i, terrainObjectNormalItemSize);
        addNormalVertexDataToList(positionVertexData, normalVertexData);
    }
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

var arrayArrowHelpers = [];
function generateArrowInTriangleCenter(index, itemSize)
{
    const actualIndex = index / itemSize;

    const length = 1;
    const hex = 0xffff00;

    const arrowHelper = new THREE.ArrowHelper(terrainObjectTriangleNormals[actualIndex], terrainObjectTrianglePositions[actualIndex], length, hex);
    scene.add(arrowHelper);
    arrayArrowHelpers.push(arrowHelper);
}

function generateSphereInTriangleCenter(terrainObjectTrianglePosition)
{
    const objGeo = new THREE.SphereGeometry(1.0, 2, 2);
    const objMat = new THREE.MeshStandardMaterial({ 
        wireframe: true,
        //color: terrainColor,
        //vertexColors: THREE.FaceColors,
        vertexColors: true,
        flatShading: true,
        roughness: 1.0,
        metalness: 0.0,
    });

    const obj = new THREE.Mesh(objGeo, objMat);

    obj.position.x = terrainObjectTrianglePosition.x;
    obj.position.y = terrainObjectTrianglePosition.y;
    obj.position.z = terrainObjectTrianglePosition.z;

    scene.add(obj);
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
    //terrainObjectTriangleNormals.push(new THREE.Vector3(normalTriangleData[0].x, normalTriangleData[0].y, normalTriangleData[0].z));
}

function getVertexIndexFromIndexArray(object, index)
{
    //
    const indexAttribute = object.geometry.getIndex();

    //
    if(indexAttribute == null || indexAttribute == undefined){return -1;}
    return indexAttribute.array[index];
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

        // move in direction
        // transfer this case to its own function if they should be kept
        if(moveInDirection)
        {
            cameraPivot.position.addScaledVector(terrainObjectTriangleNormals[indexTriangle], 0.1);
        }

        // attempt to unskew camera
        // we don't know where to stop...
        // ...is the problem
        if(keyArrowLeft)
        {
            camera.rotateZ(0.01);
        }
        else if (keyArrowRight)
        {
            camera.rotateZ(-0.01);
        }

        // update current plane
        if(keySpace)
        {
            console.log(clock.getElapsedTime().toFixed(1));
            if(clock.getElapsedTime().toFixed(1) % 3 == 0)
            {
                console.log("mouse right click!");
                handleMouseRightClick(null);
            }
        }

        checkControlsMovementMK();
    }

    checkCollisionPlayerToTerrain();

    updatePlayerGravity();

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
        // Do something useful in response
    }
    else
    {
        console.log("The pointer lock status is now unlocked");
        // Do something useful in response
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

async function handleMouseChange(e)
{
    //console.log("mouse move");
}

async function handleMouseMove(e)
{
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
    cameraPivot.rotateOnWorldAxis(terrainObjectTriangleNormals[indexTriangle], e.movementX / -1000.0);

    // for movementY, we can just consider rotateX, the local variant
    camera.rotateX(e.movementY / -1000.0);
}

async function handleMouseLock(e)
{
    console.log("mouse lock");
    setTimeout((() => {
        //console.log("["+ (controlsPointerLock.isLocked === true) +"] controlsPointerLock.isLocked === true");
        checkHasControls();
    }), 100);
}
async function handleMouseUnlock(e)
{
    console.log("mouse unlock");
    setTimeout((() => {
        //console.log("["+ (controlsPointerLock.isLocked === true) +"] controlsPointerLock.isLocked === true");
        checkHasControls();
    }), 100);
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
    switch (e.code)
    {
        case 'ArrowUp':
        case 'KeyW':
            keyForward = false;
            break;

        case 'ArrowDown':
        case 'KeyS':
            keyBackward = false;
            break;

        case 'KeyA':
            keyLeft = false;
            break;

        case 'KeyD':
            keyRight = false;
            break;

        case 'Space':
            keySpace = false;
            break;

        case 'ArrowLeft':
            keyArrowLeft = false;
            break;

        case 'ArrowRight':
            keyArrowRight = false;
            break;
    };
}

var keyArrowLeft = false;
var keyArrowRight = false;
async function handleKeyDown(e)
{

    switch (e.code)
    {
        case 'ArrowUp':
        case 'KeyW':
            keyForward = true;
            break;

        case 'ArrowDown':
        case 'KeyS':
            keyBackward = true;
            break;

        case 'KeyA':
            keyLeft = true;
            break;

        case 'KeyD':
            keyRight = true;
            break;

        case 'ArrowLeft':
            keyArrowLeft = true;
            break;

        case 'ArrowRight':
            keyArrowRight = true;
            break;

        case 'KeyL':
            camera.lookAt(terrainObjectTrianglePositions[indexTriangle]);
            break;

        case 'KeyC':
            attemptToLookAtTriangleCenter();
            break;

        case 'KeyZ':
            attemptToRotateToMatchClosest2Vertices();
            break;

        case 'KeyX':
            attemptToMoveToTriangleCenter();
            break;

        case 'KeyP':
            console.log("");
            console.log("camera.position");
            console.dir(camera.position);
            console.log("cameraPivot.position");
            console.dir(cameraPivot.position);
            console.log("camera.rotation");
            console.dir(camera.rotation);
            console.log("cameraPivot.rotation");
            console.dir(cameraPivot.rotation);
            break;

        case 'Space':
            keySpace = true;
            break;

        case 'Backspace':
            moveInDirection = true;
            break;

        case 'ShiftLeft':
            updateClosestGravity();
            break;

        default:
            console.log(e.code);
            break;
    };
}

async function handleMouseDown(e)
{
    //
    if(getIsPointerUnlocked()){handleLockPointer();return;}
    
    //
    console.log(e.which);
    switch(e.which){
        case 1:
            await handleMouseLeftClick(e);
            break;
        case 3:
            await handleMouseRightClick(e);
            break;
    }
}

async function handleCanvasMouseDown(e)
{
    console.log("mouse down: " + e.which);
    await handleMouseDown(e);
}

var indexTriangle = -1;
var moveInDirection = false;
async function handleMouseRightClick(e)
{
    //
    indexTriangle++;
    if(indexTriangle >= 20)
    {
        indexTriangle = 0;
    }

    //
    console.log("");
    console.log("["+ indexTriangle +"] indexTriangle");

    // move to centerpoint
    cameraPivot.position.x = terrainObjectTrianglePositions[indexTriangle].x;
    cameraPivot.position.y = terrainObjectTrianglePositions[indexTriangle].y;
    cameraPivot.position.z = terrainObjectTrianglePositions[indexTriangle].z;

    // move outwards slightly
    cameraPivot.position.addScaledVector(terrainObjectTriangleNormals[indexTriangle], 2.0);

    // re-align camera to gravity
    // we only have jank solutions so far
    reAlignCameraToGravity();
}

async function handleMouseLeftClick(e)
{
    //
    moveInDirection = false;

    //
    //await document.requestPointerLock();
    await handleLockPointer();
}

function updateClosestGravity()
{
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
    // which we have solved with only jank so far
    reAlignCameraToGravity();
}

function printAngleDifferences()
{
    const vec3Up = new THREE.Vector3(0,1,0);

    // we will attempt to use .rotateZ on the camera (not cameraPivot)
    // to unskew any skew
    console.log("[" + camera.rotation.z.toFixed(2) + " ("+ ((Math.PI + camera.rotation.z) % Math.PI).toFixed(2) +")" + "] camera.rotation.z");
    
    // let's find some angle differences
    // and see if one is close to what we want

    // do we first need to update camera direction?
    // let's try with and without

    const angleDifferenceAA = cameraDirection.dot(terrainObjectTriangleNormals[indexTriangle]);
    const angleDifferenceAB = cameraDirection.dot(directionCameraGravityForward);
    const angleDifferenceAC = cameraDirection.dot(directionCameraGravityRight);

    const angleDifferenceBA = vec3Up.dot(cameraDirection);
    const angleDifferenceBB = vec3Up.dot(terrainObjectTriangleNormals[indexTriangle]);
    const angleDifferenceBC = vec3Up.dot(directionCameraGravityForward);
    const angleDifferenceBD = vec3Up.dot(directionCameraGravityRight);

    console.log("");

    console.log("["+ angleDifferenceAA.toFixed(2) + " ("+ ((Math.PI - angleDifferenceAA) % Math.PI).toFixed(2) +")" + "] angleDifference AA");
    console.log("["+ angleDifferenceAB.toFixed(2) + " ("+ ((Math.PI - angleDifferenceAB) % Math.PI).toFixed(2) +")" + "] angleDifference AB");
    console.log("["+ angleDifferenceAC.toFixed(2) + " ("+ ((Math.PI - angleDifferenceAC) % Math.PI).toFixed(2) +")" + "] angleDifference AC");

    console.log("");

    console.log("["+ angleDifferenceBA.toFixed(2) + " ("+ ((Math.PI - angleDifferenceBA) % Math.PI).toFixed(2) +")" + "] angleDifference BA");
    console.log("["+ angleDifferenceBB.toFixed(2) + " ("+ ((Math.PI - angleDifferenceBB) % Math.PI).toFixed(2) +")" + "] angleDifference BB");
    console.log("["+ angleDifferenceBC.toFixed(2) + " ("+ ((Math.PI - angleDifferenceBC) % Math.PI).toFixed(2) +")" + "] angleDifference BC");
    console.log("["+ angleDifferenceBD.toFixed(2) + " ("+ ((Math.PI - angleDifferenceBD) % Math.PI).toFixed(2) +")" + "] angleDifference BD");

    console.log("");

    console.log("[" + cameraDirection.x.toFixed(2) + ", " + cameraDirection.y.toFixed(2) + ", " + cameraDirection.z.toFixed(2) + "] cameraDirection");
    console.log("[" + terrainObjectTriangleNormals[indexTriangle].x.toFixed(2) + ", " + terrainObjectTriangleNormals[indexTriangle].y.toFixed(2) + ", " + terrainObjectTriangleNormals[indexTriangle].z.toFixed(2) + "] terrainObjectTriangleNormals[indexTriangle]");
    console.log("[" + directionCameraGravityForward.x.toFixed(2) + ", " + directionCameraGravityForward.y.toFixed(2) + ", " + directionCameraGravityForward.z.toFixed(2) + "] directionCameraGravityForward");
}

function attemptToMoveToTriangleCenter()
{
    // move to center
    cameraPivot.position.x = terrainObjectTrianglePositions[indexTriangle].x;
    cameraPivot.position.y = terrainObjectTrianglePositions[indexTriangle].y;
    cameraPivot.position.z = terrainObjectTrianglePositions[indexTriangle].z;

    // move out a bit
    cameraPivot.position.addScaledVector(terrainObjectTriangleNormals[indexTriangle], 1.0);
}

function attemptToLookAtTriangleCenter()
{
    //
    camera.lookAt(terrainObjectTrianglePositions[indexTriangle]);
    //camera.rotateZ(Math.PI);

    //
    //camera.rotation.copy(directionCameraGravityForwardArrowHelper.rotation);
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

    return;

    var closestVertexIndexA = -1;
    var closestVertexDistanceA = 9999;

    var closestVertexIndexB = -1;
    var closestVertexDistanceB = 9999;

    // we copy our array of vertices
    var arrayVerticesByDistance = terrainObjectVertexPositions.slice();
    
    // we sort by distance to camera pivot
    arrayVerticesByDistance.sort((itemA, itemB) =>
    {
        return compareFnVertexDistanceToCameraPivot(itemA, itemB);
    });

    // now, the first two items will be our two closest vertices
    
    // when our camera is rotated so that these two are at the same height...
    // ...then we are no longer misaligned?

    // and how on earth do we do this, lol

    console.log("");
    console.log("closest vertex A:");
    console.log(arrayVerticesByDistance[0]);
    console.log("closest vertex B:");
    console.log(arrayVerticesByDistance[5]);

    // just for testing
    // let's place ourselves inbetween them

    cameraPivot.position.x = (arrayVerticesByDistance[0].x + arrayVerticesByDistance[5].x) / 2;
    cameraPivot.position.y = (arrayVerticesByDistance[0].y + arrayVerticesByDistance[5].y) / 2;
    cameraPivot.position.z = (arrayVerticesByDistance[0].z + arrayVerticesByDistance[5].z) / 2;

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
    //printAngleDifferences();
    
    // jank solution

    //THREE.Object3D.DEFAULT_UP = terrainObjectTriangleNormals[indexTriangle];
    //camera.getWorldDirection(cameraDirection);

    console.log("");
    console.log("re-align!")
    console.log("");

    camera.DEFAULT_UP = terrainObjectTriangleNormals[indexTriangle];
    cameraPivot.DEFAULT_UP = terrainObjectTriangleNormals[indexTriangle];
    THREE.Object3D.DEFAULT_UP = terrainObjectTriangleNormals[indexTriangle];

    return;

    // move to the point
    // .lookAt
    // .rotateX to get up again
    // move back to previous point

    const previousX = cameraPivot.position.x;
    const previousY = cameraPivot.position.y;
    const previousZ = cameraPivot.position.z;

    const previousRotationX = camera.rotation.x;
    console.log("[" + previousRotationX + "] previousRotationX");
    console.log("[" + (Math.PI / 4) + "] Math.PI / 4");
    //const previousRotationY = camera.rotation.y;

    cameraPivot.position.x = terrainObjectTrianglePositions[indexTriangle].x;
    cameraPivot.position.y = terrainObjectTrianglePositions[indexTriangle].y;
    cameraPivot.position.z = terrainObjectTrianglePositions[indexTriangle].z;

    cameraPivot.position.addScaledVector(terrainObjectTriangleNormals[indexTriangle], 1.0);

    camera.lookAt(terrainObjectTrianglePositions[indexTriangle]);

    //camera.rotateX(Math.PI / 2);
    camera.rotateX(previousRotationX);

    cameraPivot.position.x = previousX;
    cameraPivot.position.y = previousY;
    cameraPivot.position.z = previousZ;

    //cameraPivot.rotation.x = previousRotationX;

    //cameraPivot.rotateOnWorldAxis(terrainObjectTriangleNormals[indexTriangle], -Math.PI * 2);


    //cameraPivot.rotation.y += Math.PI / 2;
    //cameraPivot.rotation.y = previousRotationY;

    return;

    // get angle difference
    // between our current camera direction
    // and gravity forward direction (perpendicular)
    //var angleDifference = cameraDirection.dot(directionCameraGravityForward);
    //console.log(angleDifference);

    // first look at the center point
    // this perfectly aligns our skew issue... for some reason

    // new discovery!
    // this only fixes the skew when the camera is positioned directly above the point
    // so this will not work, oh at all
    //camera.lookAt(terrainObjectTrianglePositions[indexTriangle]);

    // then we rotate the camera up a bit
    //camera.rotateX(Math.PI / 2);

    // now, we rotate up again, by the same difference as before
    //camera.rotateX(-angleDifference);
}

// we find the camera gravity perpendiculars before we handle movement
// rotation -> update camera gravity perpendiculars -> movement
// i think this order is the most reasonable
function updateCameraGravityPerpendiculars()
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
    const horizontalPolarity = (keyLeft ? -1 : (keyRight ? 1 : 0));
    const verticalPolarity = (keyForward ? 1 : (keyBackward ? -1 : 0));

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

    // get forward axis first
    // we use input to determine speed
    //cameraPivot.translateOnWorldAxis(directionCameraGravityForward, 0.1);
    
    // now we can use the right-left axis
    //cameraPivot.translateOnWorldAxis(directionCameraGravityRight, 0.1);
}

function getProjectedDistanceToCenter(objectPosition)
{
    //
    const projectedPositionA = new THREE.Vector3();
    projectedPositionA.copy(getProjectedPosition(objectPosition));

    //
    resultVec3.x = window.innerWidth / 2;
    resultVec3.y = window.innerHeight / 2;
    resultVec3.z = 0;

    //
    const distanceToCenterOfScreenA = projectedPositionA.distanceTo(resultVec3);

    //
    return distanceToCenterOfScreenA;
}

function getProjectedPosition(objectPosition)
{
    //
    resultVec3.copy(objectPosition);
    resultVec3.project(camera);

    // change range to the size of the canvas
    resultVec3.x = (resultVec3.x + 1) * window.innerWidth / 2;
    resultVec3.y = -(resultVec3.y - 1) * window.innerHeight / 2;
    resultVec3.z = 0;

    //
    return resultVec3;
}

function generateFrustum()
{
    // standard, normal update
    // will set the frustum to exactly the camera's

    // perhaps in some world one could modify these
    // so that it is smaller
    // but I don't seem to be able to
    // so I'll have it remain at normal for now
    cameraFrustum = new THREE.Frustum().setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse));
}

var accelZ = 0.13;
function checkControlsHUD()
{
    // get width and height strings
    // then remove the "px" at the end
    var widthString = window.innerWidth.toString();
    widthString.slice(0, widthString.length - 2);
    var heightString = window.innerHeight.toString();
    heightString.slice(0, widthString.length - 2);

    // interpret as floats, so that we can get the center by dividing by 2
    const width = parseFloat(widthString);
    const height = parseFloat(heightString);

    //
    accelZ = webHIDDeviceInputDictionary["accelZ"];
    // we need to shift accelZ
    // it goes from -0.13 to 0.13
    // which would normally be fine
    // but it starts at 0.13 instead of 0.00
    // so we need to progress it to 0.00 without changing the scale
    // but % does not work on negative numbers
    // so we need to first shift the scale to where 0 is the minimum, first
    accelZ = accelZ + 0.26;
    accelZ = accelZ % 0.26;
    accelZ = accelZ - 0.13;
    accelZ = accelZ * -1;
    accelZ = Math.abs(accelZ);

    //
    const verticalOffsetAccel = HelperWebHID.rescale(webHIDDeviceInputDictionary["accelY"],-1,1,height / -2,height / 2);
    var accelXZ = (webHIDDeviceInputDictionary["accelX"] + accelZ) / 2;
    const horizontalOffsetAccel = HelperWebHID.rescale(accelXZ,-1,1,width / -2,width / 2);

    //
    const verticalOffsetGyro = HelperWebHID.rescale(webHIDDeviceInputDictionary["gyroX"],-1,1,height / -2,height / 2);
    var gyroYZ = (webHIDDeviceInputDictionary["gyroY"] + webHIDDeviceInputDictionary["gyroZ"]) / 2;
    const horizontalOffsetGyro = HelperWebHID.rescale(gyroYZ,-1,1,width / -2,width / 2);

    //
    const isJoyConL = HelperWebHID.isJoyConL(webHIDDevice.productId);
    const reverseMultiplier = (isJoyConL ? 1 : -1);

    //
    const xBase = (width / 2) - 15 + 2;
    const yBase = (height / 2) - 15 + 2;

    //
    hudGyro.style.right = (xBase + horizontalOffsetGyro * reverseMultiplier) + "px";
    hudGyro.style.bottom = (yBase - verticalOffsetGyro * reverseMultiplier) + "px";

    //
    hudAccel.style.right = (xBase + horizontalOffsetAccel * reverseMultiplier) + "px";
    hudAccel.style.bottom = (yBase - verticalOffsetAccel * reverseMultiplier) + "px";
}

function updatePlayerGravity()
{
    // early return: has no gamepad
    if(!hasControls){return;}
}

function checkCollisionPlayerToTerrain(){}

function updateTextLog()
{
    // early return: throttling
    if((clock.getElapsedTime() - throttleTextLog) < throttleMaxTextLog){return;}

    // end of early returns: reset throttle
    throttleTextLog = clock.getElapsedTime();

    //
    hudTextStatus.textContent = "";

    //
    const directionDefaultUp = new THREE.Vector3(0,0,1);

    //
    var angleDifferenceDefaultUpAndNormal = HelperCameraRotation.getAngleDifference(directionDefaultUp, terrainObjectTriangleNormals[indexTriangle]);
    var angleDifferenceDefaultUpAndCameraForward = HelperCameraRotation.getAngleDifference(directionDefaultUp, cameraDirection);
    var angleDifferenceDefaultUpAndArrowForward = HelperCameraRotation.getAngleDifference(directionDefaultUp, directionCameraGravityForward);
    var angleDifferenceDefaultUpAndArrowRight = HelperCameraRotation.getAngleDifference(directionDefaultUp, directionCameraGravityRight);

    //
    var dotProductDefaultUpAndNormal = directionDefaultUp.dot(terrainObjectTriangleNormals[indexTriangle]);
    var dotProductDefaultUpAndCameraForward = directionDefaultUp.dot(cameraDirection);
    var dotProductDefaultUpAndArrowForward = directionDefaultUp.dot(directionCameraGravityForward);
    var dotProductDefaultUpAndArrowRight = directionDefaultUp.dot(directionCameraGravityRight);


    //
    hudTextStatus.textContent +=
    "[" + camera.rotation.x.toFixed(2) + "] camera.rotation.x \n" +
    "[" + camera.rotation.y.toFixed(2) + "] camera.rotation.y \n" +
    "\n" +
    "[" + camera.rotation.z.toFixed(2) + "] camera.rotation.z \n" +
    "[" + ((camera.rotation.z + Math.PI) % Math.PI).toFixed(2) + "] ((above + Math.PI) % Math.PI) \n" +
    "\n" +
    "[" + arrayArrowHelpers[indexTriangle].rotation.z.toFixed(2) + "] arrayArrowHelpers[indexTriangle].rotation.z \n" +
    "[" + directionCameraGravityRightArrowHelper.rotation.z.toFixed(2) + "] directionCameraGravityRightArrowHelper.rotation.z \n" +



    "\n" +
    "[" + angleDifferenceDefaultUpAndNormal.toFixed(2) + "] angleDifferenceDefaultUpAndNormal \n" +
    "[" + (Math.PI - angleDifferenceDefaultUpAndNormal).toFixed(2) + "] (Math.PI - above) \n" +
    "[" + ((angleDifferenceDefaultUpAndNormal + 6 * Math.PI) % Math.PI).toFixed(2) + "] ((above + 6 * Math.PI) % Math.PI) \n" +
    "\n" +
    "[" + angleDifferenceDefaultUpAndCameraForward.toFixed(2) + "] angleDifferenceDefaultUpAndCameraForward \n" +
    "[" + (Math.PI - angleDifferenceDefaultUpAndCameraForward).toFixed(2) + "] (Math.PI - above) \n" +
    "[" + angleDifferenceDefaultUpAndArrowForward.toFixed(2) + "] angleDifferenceDefaultUpAndArrowForward \n" +
    "[" + (Math.PI - angleDifferenceDefaultUpAndArrowForward).toFixed(2) + "] (Math.PI - above) \n" +
    "[" + angleDifferenceDefaultUpAndArrowRight.toFixed(2) + "] angleDifferenceDefaultUpAndArrowRight \n" +
    "[" + (Math.PI - angleDifferenceDefaultUpAndArrowRight).toFixed(2) + "] (Math.PI - above) \n" +



    "\n" +
    "[" + dotProductDefaultUpAndNormal.toFixed(2) + "] dotProductDefaultUpAndNormal \n" +
    "[" + ((dotProductDefaultUpAndNormal + 6 * Math.PI) % Math.PI).toFixed(2) + "] ((above + 6 * Math.PI) % Math.PI) \n" +
    "\n" +
    "[" + dotProductDefaultUpAndCameraForward.toFixed(2) + "] dotProductDefaultUpAndCameraForward \n" +
    "[" + dotProductDefaultUpAndArrowForward.toFixed(2) + "] dotProductDefaultUpAndArrowForward \n" +
    "[" + dotProductDefaultUpAndArrowRight.toFixed(2) + "] dotProductDefaultUpAndArrowRight \n" +
    "\n";
}