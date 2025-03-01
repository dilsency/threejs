const fragment1 = /* glsl */ `

uniform float uTime;

uniform vec3 diffuseColor;
uniform vec3 fresnelColor;

uniform float fresnelDegree;

uniform vec3 cameraPivotPosition;

uniform sampler2D map;
varying vec2 vUv;


varying vec3 vPositionW;
varying vec3 vNormalW;

void main( void ) {
    //
    vec2 texCoords = vec2(vUv.x + sin(uTime * 0.02), vUv.y + cos(uTime * 0.02));
    //vec4 tColor = texture2D(map, texCoords);
    vec4 tColor = vec4(diffuseColor, 1.0);

    //
    vec3 viewDirectionW = normalize(cameraPivotPosition - vPositionW);
    vec3 normal = normalize(vNormalW);

    //
    float fresnelTerm = dot(viewDirectionW, normal);
    fresnelTerm = clamp(1.0 - fresnelTerm, 0., 1.);
    fresnelTerm = pow(fresnelTerm, fresnelDegree);
    
    //
    gl_FragColor = tColor;
    gl_FragColor += vec4(fresnelColor * fresnelTerm, 1.0);

    //if(vPositionW.x == 0.0 || vPositionW.y == 0.0 || vPositionW.z == 0.0){gl_FragColor = vec4(1,0,0,1);}
}
`;
export default fragment1;


/*

    gl_FragColor = tColor;

    gl_FragColor.rgb += diffuseColor.rgb * pow(1.0 - abs(dot(normalize(NM*vEye), vNN )), 2.5) * 2.0;

    gl_FragColor.rgb = diffuseColor;
*/
