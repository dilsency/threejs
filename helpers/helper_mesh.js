
import * as THREE from "three";

export function getPositionTriangleData(object, objectPositionAttribute, i, itemSize)
{
    // indeces will be 0, 3, 6, 9, ..

    const vertexPositionA = new THREE.Vector3();
    const vertexPositionB = new THREE.Vector3();
    const vertexPositionC = new THREE.Vector3();

    vertexPositionA.fromBufferAttribute(objectPositionAttribute, (i + 0));
    object.localToWorld(vertexPositionA);

    vertexPositionB.fromBufferAttribute(objectPositionAttribute, (i + 1));
    object.localToWorld(vertexPositionB);

    vertexPositionC.fromBufferAttribute(objectPositionAttribute, (i + 2));
    object.localToWorld(vertexPositionC);

    return [vertexPositionA, vertexPositionB, vertexPositionC];
}

export function getNormalTriangleData(object, objectNormalAttribute, i, itemSize)
{
    const vertexNormalA = new THREE.Vector3();
    const vertexNormalB = new THREE.Vector3();
    const vertexNormalC = new THREE.Vector3();

    //vertexNormalA.fromBufferAttribute(objectNormalAttribute, i + 0 + itemSize * 0);
    vertexNormalA.fromBufferAttribute(objectNormalAttribute, (i + 0));
    //object.localToWorld(vertexA);

    //vertexNormalB.fromBufferAttribute(objectNormalAttribute, i + 0 + itemSize * 1);
    vertexNormalA.fromBufferAttribute(objectNormalAttribute, (i + 1));
    //object.localToWorld(vertexB);

    //vertexNormalC.fromBufferAttribute(objectNormalAttribute, i + 0 + itemSize * 2);
    vertexNormalA.fromBufferAttribute(objectNormalAttribute, (i + 2));
    //object.localToWorld(vertexC);

    return [vertexNormalA, vertexNormalB, vertexNormalC];
}

//

export function getFaceNormal(triangleVertexPositions, triangleVertexNormals)
{
    // https://stackoverflow.com/a/13696730

    // our parameter is an array of the 3 vertex normals

    //
    const p0 = new THREE.Vector3();
    p0.subVectors(triangleVertexPositions[1], triangleVertexPositions[0]);
    const p1 = new THREE.Vector3();
    p1.subVectors(triangleVertexPositions[2], triangleVertexPositions[0]);

    //
    const faceNormal = new THREE.Vector3();
    faceNormal.crossVectors(p0, p1);

    // we either only use triangleVertexNormals[0]
    // or we first average out all triangleVertexNormals[0..2]
    // and then use the average
    var dot = faceNormal.dot(triangleVertexNormals[0]);

    // apparently necessary to get which way it is facing
    return ( dot < 0.0 ) ? -faceNormal : faceNormal;
}

//

export function getPerpendicularDirection(vec3A)
{
    if(vec3A.x == 0 && vec3A.y == 1 && vec3A.z == 0){return new THREE.Vector3(0,0,1);}

    //
    const vec3B = new THREE.Vector3(0,1,0);

    //
    return vec3A.cross(vec3B);
}

//

export function getVertexWorldPositionByIndex(object, index)
{
    //
    const positionAttribute = object.geometry.getAttribute("position");
    //const positionAttributeCount = positionAttribute.count;
    const positionAttributeItemSize = positionAttribute.itemSize;

    //
    var vertexPositionA = new THREE.Vector3();

    //
    vertexPositionA.fromBufferAttribute(positionAttribute, index + 0 + positionAttributeItemSize * 0);
    object.localToWorld(vertexPositionA);

    //
    return vertexPositionA;
}