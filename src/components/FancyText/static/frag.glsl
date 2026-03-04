varying vec3 vWorldPosition;

// IORs: [air, film, internal]
uniform vec3 uIors;

// film thickness: minThickness, maxThickness
uniform vec2 uThickness;

// texturing:
uniform float uTextureScale;

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

float thinFilmReflectance(float cos0, float lambda, float thickness) {

    float d01 = (uIors.x >= uIors.y) ? 0.0 : PI;
    float d12 = (uIors.y >= uIors.z) ? 0.0 : PI;

    float delta = d01 + d12;
    float sin1 = pow(uIors.x / uIors.y, 2.0) * (1.0 - pow(cos0, 2.0));
    if(sin1 > 1.0){
        return 1.0;
    }
    float cos1 = sqrt(1.0 - sin1);
    float sin2 = pow(uIors.y / uIors.z, 2.0) * (1.0 - pow(cos1, 2.0));
    if (sin2 > 1.0){
        return 1.0;
    }
    float cos2 = sqrt(1.0 - sin2);

    float alpha_s = rs(uIors.y, uIors.x, cos1, cos0) * rs(uIors.y, uIors.z, cos1, cos2);
    float alpha_p = rp(uIors.y, uIors.x, cos1, cos0) * rp(uIors.y, uIors.z, cos1, cos2);
    float beta_s = ts(uIors.x, uIors.y, cos0, cos1) * ts(uIors.y, uIors.z, cos1, cos2);
    float beta_p = tp(uIors.x, uIors.y, cos0, cos1) * tp(uIors.y, uIors.z, cos1, cos2);

    float phi = (2.0 * PI / lambda) * (2.0 * uIors.y * thickness * cos1) + delta;

    float ts = pow(beta_s, 2.0) / (pow(alpha_s, 2.0) - 2.0 * alpha_s * cos(phi) + 1.0);
    float tp = pow(beta_p, 2.0) / (pow(alpha_p, 2.0) - 2.0 * alpha_p * cos(phi) + 1.0);
    float beamRatio = (uIors.z * cos2) / (1.0 * cos0);
    float t = beamRatio * (ts + tp) / 2.0;
    return min(1.0, max(0.0, 1.0 - t));

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

void main() {
    // compute face normal in view space
    vec3 dx = dFdx(vViewPosition);
    vec3 dy = dFdy(vViewPosition);
    vec3 faceNormal = normalize(cross(dx, dy));


    float thicknessFactor = 0.5 + 0.5 * sin(floor(vWorldPosition.x / uTextureScale));
    float thickness = uThickness.x;

    // compute camera ray direction in view space
    vec3 rayDirection = normalize(vViewPosition);

    float cosI = dot(rayDirection, faceNormal);

    vec3 reflectance = vec3(
        thinFilmReflectance(cosI, 650.0, thickness),
        thinFilmReflectance(cosI, 500.0, thickness),
        thinFilmReflectance(cosI, 400.0, thickness)
    );

    vec3 hsv = rgb2hsv(reflectance);
    vec3 color = hsv2rgb(vec3(hsv.x, pow(hsv.y, 1.0/3.0), 1.0));



    // csm_DiffuseColor = vec4(color, 1.0);
    csm_FragColor = vec4(thicknessFactor, thicknessFactor, thicknessFactor, 1.0);
    // csm_FragColor = vec4(0.5 + 0.5 * normalize(vWorldPosition), 1.0);
}
