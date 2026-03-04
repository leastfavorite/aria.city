varying vec3 vPosition;

// wavelengths for r, g, b light
uniform vec3 uWavelengths;

// IORs: [air, film, internal]
uniform vec3 uIors;

// film thickness: minThickness, maxThickness
uniform float uThickness;
uniform float uBumpDepth;
uniform float uBumpSmoothness;

/*** hash ***/
// https://www.shadertoy.com/view/WttXWX
uint murmurHash13(uvec3 src) {
    const uint M = 0x5bd1e995u;
    uint h = 1190494759u;
    src *= M; src ^= src>>24u; src *= M;
    h *= M; h ^= src.x; h *= M; h ^= src.y; h *= M; h ^= src.z;
    h ^= h>>13u; h *= M; h ^= h>>15u;
    return h;
}

// 1 output, 3 inputs
float hash13(vec3 src) {
    uint h = murmurHash13(floatBitsToUint(src));
    return uintBitsToFloat(h & 0x007fffffu | 0x3f800000u) - 1.0;
}


/*** thin-film ***/

// thx alro from shadertoy
// https://www.shadertoy.com/view/7sV3Rh

// Reflection coefficient (s-polarized)
float rs(float n1, float n2, float cosI, float cosR) {
    return (n1 * cosI - n2 * cosR) / (n1 * cosI + n2 * cosR);
}

// Reflection coefficient (p-polarized)
float rp(float n1, float n2, float cosI, float cosR) {
    return (n2 * cosI - n1 * cosR) / (n1 * cosR + n2 * cosI);
}

// Transmission coefficient (s-polarized)
float ts(float n1, float n2, float cosI, float cosR) {
    return 2.0 * n1 * cosI / (n1 * cosI + n2 * cosR);
}

// Transmission coefficient (p-polarized)
float tp(float n1, float n2, float cosI, float cosR) {
    return 2.0 * n1 * cosI / (n1 * cosR + n2 * cosI);
}

vec3 thinFilmReflectance(float cos0, vec3 lambdas, float thickness) {

    float d01 = (uIors.x >= uIors.y) ? 0.0 : PI;
    float d12 = (uIors.y >= uIors.z) ? 0.0 : PI;

    float delta = d01 + d12;
    float sin1 = pow(uIors.x / uIors.y, 2.0) * (1.0 - pow(cos0, 2.0));
    if(sin1 > 1.0){
        return vec3(1.0);
    }
    float cos1 = sqrt(1.0 - sin1);
    float sin2 = pow(uIors.y / uIors.z, 2.0) * (1.0 - pow(cos1, 2.0));
    if (sin2 > 1.0){
        return vec3(1.0);
    }
    float cos2 = sqrt(1.0 - sin2);

    float alpha_s = rs(uIors.y, uIors.x, cos1, cos0) * rs(uIors.y, uIors.z, cos1, cos2);
    float alpha_p = rp(uIors.y, uIors.x, cos1, cos0) * rp(uIors.y, uIors.z, cos1, cos2);
    float beta_s = ts(uIors.x, uIors.y, cos0, cos1) * ts(uIors.y, uIors.z, cos1, cos2);
    float beta_p = tp(uIors.x, uIors.y, cos0, cos1) * tp(uIors.y, uIors.z, cos1, cos2);

    vec3 phi = (2.0 * PI / lambdas) * (2.0 * uIors.y * thickness * cos1) + delta;

    vec3 ts = pow(beta_s, 2.0) / (pow(alpha_s, 2.0) - 2.0 * alpha_s * cos(phi) + 1.0);
    vec3 tp = pow(beta_p, 2.0) / (pow(alpha_p, 2.0) - 2.0 * alpha_p * cos(phi) + 1.0);
    float beamRatio = (uIors.z * cos2) / (1.0 * cos0);
    vec3 t = beamRatio * (ts + tp) / 2.0;
    return min(vec3(1.0), max(vec3(0.0), 1.0 - t));

}

/*** end thin-film ***/

vec3 rgb2hsv(vec3 c)
{
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

vec3 hsv2rgb(vec3 c)
{
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

float getRawThickness(vec3 pos) {
    return hash13(floor(pos));
}

float getThickness(vec3 p) {
    vec3 pos = vPosition + uBumpSmoothness / 2.0;
    vec3 k = clamp(fract(pos) / uBumpSmoothness, 0.0, 1.0);

    k = (3.0 - 2.0 * k) * k * k;

    float t = getRawThickness(pos);

    if (k == vec3(1.0)) {
        return t;
    }

    vec3 dt = vec3(
        getRawThickness(pos - vec3(1.0, 0.0, 0.0)),
        getRawThickness(pos - vec3(0.0, 1.0, 0.0)),
        getRawThickness(pos - vec3(0.0, 0.0, 1.0))
    );


    return clamp(dot(1.0 - k, (dt - t)) + t, 0.0, 1.0);
}


vec3 getViewNormal() {
    vec3 pos = vPosition - uBumpSmoothness/2.0;
    // compute face normal
    vec3 vdx = dFdx(vViewPosition);
    vec3 vdy = dFdy(vViewPosition);
    vec3 viewNormal = normalize(cross(vdx, vdy));

    return normalize(viewNormal);
}

void main() {
    vec3 viewNormal = getViewNormal();
    float thicknessScalar = getThickness(vPosition);
    float thickness = thicknessScalar * uBumpDepth + uThickness;

    // compute camera ray direction in view space
    float cosIncidence = dot(normalize(vViewPosition), viewNormal);

    vec3 reflectance = thinFilmReflectance(cosIncidence, uWavelengths, thickness);

    vec3 hsv = rgb2hsv(reflectance);
    vec3 color = hsv2rgb(vec3(hsv.x, hsv.y * 0.5 + 0.5, 1.0));


    csm_DiffuseColor = vec4(color, 0.0);
    // csm_FragColor = vec4(vec3(thicknessScalar), 1.0);
    // csm_FragColor = vec4(0.5 + 0.5 * normalize(vWorldPosition), 1.0);
}
