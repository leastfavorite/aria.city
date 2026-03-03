'use client';

import styles from './style.module.css';
import fontData from './static/pixelify-sans.json';

import { CameraControls, Center, Float, PerspectiveCamera, View } from "@react-three/drei";
import CustomShaderMaterial from "three-custom-shader-material/vanilla";
import { useMemo } from 'react';
import { MeshStandardMaterial } from 'three';
import { FontLoader, TextGeometry } from 'three/examples/jsm/Addons.js';

// load font information
type Glyph = {
    "ha": number,
    "x_min": number,
    "x_max": number,
    "o": string
}
const font = new FontLoader().parse(fontData as any)
const glyphs = fontData.glyphs as { [char: string]: Glyph }

const baseMaterial = new MeshStandardMaterial({
  metalness: 1,
  roughness: 1,
});

// create materials
const sideMaterial = new CustomShaderMaterial({
    baseMaterial,
    uniforms: {
         uFilmThickness: { value: 2000 },
         uFilmIor: { value: 1.3 },
         uMetalIor: { value: 2 }
    },

    vertexShader: `
        varying vec3 vWorldPosition;

        void main() {
            vWorldPosition = position.xyz;
        }
    `,

    fragmentShader: `
        varying vec3 vWorldPosition;

        uniform float uFilmThickness;
        uniform float uFilmIor;
        uniform float uMetalIor;

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

            float d12 = (uFilmIor >= uMetalIor) ? 0.0 : PI;
            float delta = PI + d12;
            float sin1 = pow(1.0 / uFilmIor, 2.0) * (1.0 - pow(cos0, 2.0));
            if(sin1 > 1.0){
                return 1.0;
            }
            float cos1 = sqrt(1.0 - sin1);
            float sin2 = pow(1.0 / uFilmIor, 2.0) * (1.0 - pow(cos1, 2.0));
            if (sin2 > 1.0){
                return 1.0;
            }
            float cos2 = sqrt(1.0 - sin2);
            float alpha_s = rs(uFilmIor, 1.0, cos1, cos0) * rs(uFilmIor, uMetalIor, cos1, cos2);
            float alpha_p = rp(uFilmIor, 1.0, cos1, cos0) * rp(uFilmIor, uMetalIor, cos1, cos2);
            float beta_s = ts(1.0, uFilmIor, cos0, cos1) * ts(uFilmIor, uMetalIor, cos1, cos2);
            float beta_p = tp(1.0, uFilmIor, cos0, cos1) * tp(uFilmIor, uMetalIor, cos1, cos2);
            float phi = (2.0 * PI / lambda) * (2.0 * uFilmIor * thickness * cos1) + delta;
            float ts = pow(beta_s, 2.0) / (pow(alpha_s, 2.0) - 2.0 * alpha_s * cos(phi) + 1.0);
            float tp = pow(beta_p, 2.0) / (pow(alpha_p, 2.0) - 2.0 * alpha_p * cos(phi) + 1.0);
            float beamRatio = (uMetalIor * cos2) / (1.0 * cos0);
            float t = beamRatio * (ts + tp) / 2.0;
            return min(1.0, max(0.0, 1.0 - t));
        }

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


            float thicknessFactor = 0.5 + 0.5 * sin(floor(vWorldPosition.x / 10.0));
            float thickness = uFilmThickness;

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
    `
});

const frontMaterial = new MeshStandardMaterial({
  metalness: 1,
  roughness: 0.35,
  emissive: "#00d0f0",
  emissiveIntensity: 0.05,
  color: "#00d0f0"
});

// TODO: mouse reactivity
// TODO: shaders

function TextDisplay({ children }: { children: string }) {
    const meshes = useMemo(() => {
        let meshes = [];

        let xOffset = 0;
        const textSettings = {
            font,
            size: 100,
            depth: 25
        };

        const scale = textSettings.size / fontData.resolution;

        for (const char of children) {
            const glyph: Glyph | undefined = glyphs[char]
            if (!glyph) {
                throw new Error(`Unknown glyph '${char}'`);
            }

            const geometry = new TextGeometry(char, textSettings);
            geometry.computeBoundingBox()

            const oldPos = geometry.boundingBox!.min.clone();
            geometry.center()

            const mesh = (
                <group
                    position={[(xOffset + glyph.x_min) * scale, 0, 0]}
                >
                    <Float speed={5 + Math.random()} rotationIntensity={1.5}>
                        <mesh
                            geometry={geometry}
                            material={[sideMaterial, frontMaterial]}
                            position={oldPos.sub(geometry.boundingBox!.min)}
                        />
                    </Float>
                </group>
            );

            xOffset += glyph.x_max;
            meshes.push(mesh)
        }

        console.log(meshes)
        return <Center scale={scale} position={[0, -0.15, 0]}>
            {...meshes}
        </Center>
    }, [children])

    return meshes
}

export default function FancyText({ children }: { children: string }) {
    return (
        <span className={styles.container}>
            <span className={styles.fallback}>
                {children}
            </span>
            <View className={styles.view}>
                <PerspectiveCamera
                    makeDefault
                    position={[0, 0, 50]}
                    fov={30}
                >

                    <directionalLight intensity={10} position={[0, 1, 0]} />
                </PerspectiveCamera>
                <spotLight
                    position={[0, 50, 10]}
                    intensity={5000}
                />
                <CameraControls />
                <TextDisplay>
                    {children}
                </TextDisplay>
            </View>
        </span>
    );
}
