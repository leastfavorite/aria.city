'use client';

import styles from './style.module.css';
import fontData from './static/pixelify-sans.json';

import { CameraControls, Center, Float, PerspectiveCamera, View } from "@react-three/drei";
import CustomShaderMaterial from "three-custom-shader-material/vanilla";
import { useMemo } from 'react';
import { MeshStandardMaterial } from 'three';
import { FontLoader, TextGeometry } from 'three/examples/jsm/Addons.js';

import fragmentShader from './static/frag.glsl';
import vertexShader from './static/vert.glsl';

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
    vertexShader,
    fragmentShader
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
