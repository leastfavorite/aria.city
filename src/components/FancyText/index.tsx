'use client';

import styles from './style.module.css';
import fontData from './static/pixelify-sans.json';

import { CameraControls, Center, Float, PerspectiveCamera, View } from "@react-three/drei";
import CustomShaderMaterial from "three-custom-shader-material/vanilla";
import { useMemo } from 'react';
import { DoubleSide, MeshPhongMaterial, MeshStandardMaterial, ShaderMaterial, Vector3 } from 'three';
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
  roughness: 0.6,
});

// create materials
const material = new ShaderMaterial({
    uniforms: {
         uFilmThickness: { value: 5000 },
         uFilmIor: { value: 2.5 },
         uMetalIor: { value: 3.0 }
    },
    vertexShader: `
        varying vec3 vViewPosition;

        void main() {
            vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
            vViewPosition = viewPosition.xyz;

            gl_Position = projectionMatrix * viewPosition;
        }
    `,
    fragmentShader: `
        #define PI 3.1415

        uniform float uFilmThickness;
        uniform float uFilmIor;
        uniform float uMetalIor;

        varying vec3 vViewPosition;
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

        float thinFilmReflectance(float cos0, float lambda) {

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
            float phi = (2.0 * PI / lambda) * (2.0 * uFilmIor * uFilmThickness * cos1) + delta;
            float ts = pow(beta_s, 2.0) / (pow(alpha_s, 2.0) - 2.0 * alpha_s * cos(phi) + 1.0);
            float tp = pow(beta_p, 2.0) / (pow(alpha_p, 2.0) - 2.0 * alpha_p * cos(phi) + 1.0);
            float beamRatio = (uMetalIor * cos2) / (1.0 * cos0);
            float t = beamRatio * (ts + tp) / 2.0;
            return min(1.0, max(0.0, 1.0 - t));
        }

        void main() {
            // compute face normal in world space
            vec3 dx = dFdx(vViewPosition);
            vec3 dy = dFdy(vViewPosition);
            vec3 normal = normalize(cross(dx, dy));


            // compute camera ray direction in world space
            vec3 rayDirection = normalize(vViewPosition);

            float cosI = -dot(rayDirection, normal);

            vec3 reflectance = vec3(
                thinFilmReflectance(cosI, 650.0),
                thinFilmReflectance(cosI, 510.0),
                thinFilmReflectance(cosI, 475.0)
            );

            float desc = uFilmIor * uFilmIor - 1.0 + cosI * cosI;
            float scalar = 4.0 * 3.1415 * uFilmThickness;
            gl_FragColor = vec4(reflectance * 3.0, 1.0);
        }
    `,
    side: DoubleSide
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
                    <Float speed={5 + Math.random()} rotationIntensity={1}>
                        <mesh
                            geometry={geometry}
                            material={material}
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
                </PerspectiveCamera>
                <CameraControls />
                <TextDisplay>
                    {children}
                </TextDisplay>
            </View>
        </span>
    );
}
