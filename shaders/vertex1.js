const vertex1 = /* glsl */ `

uniform float uTime;

uniform vec3 diffuseColor;
uniform vec3 fresnelColor;

uniform float fresnelDegree;

uniform vec3 cameraPivotPosition;

varying vec2 vUv;

varying vec3 vPositionW;
varying vec3 vNormalW;

void main()
{
    //
    vUv = uv;

    //
    vec4 vViewPosition4 = modelViewMatrix * vec4(position, 1.0);

    //
    vPositionW = vViewPosition4.xyz;
    vNormalW = normalMatrix * normal;

    //
    vec3 newPosition = position + normal * vec3( 0.0, sin(uTime * 0.1) * 0.1, 0.0 );
    gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );

    //
    gl_Position = projectionMatrix * vViewPosition4;
}
`;
export default vertex1;