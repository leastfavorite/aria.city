'use client';

import styles from './style.module.css';
import fontData from './static/pixelify-sans.json';

import { CameraControls, Center, Float, PerspectiveCamera, View } from "@react-three/drei";
import { PropsWithChildren, useMemo } from 'react';
import { FontLoader, TextGeometry } from 'three/examples/jsm/Addons.js';

import { useControls } from 'leva';
import IridescentMaterial from './IridescentMaterial';

// load font information
type Glyph = {
    "ha": number,
    "x_min": number,
    "x_max": number,
    "o": string
}
const font = new FontLoader().parse(fontData as any)
const glyphs = fontData.glyphs as { [char: string]: Glyph }

// TODO: mouse reactivity
// TODO: shaders

function TextDisplay({ text, children }: PropsWithChildren<{text: string}>) {
    const meshes = useMemo(() => {
        let meshes = [];

        let xOffset = 0;
        const textSettings = {
            font,
            size: 100,
            depth: 25
        };

        const scale = textSettings.size / fontData.resolution;

        for (const char of text) {
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
                            position={oldPos.sub(geometry.boundingBox!.min)}
                        >
                            {children}
                        </mesh>
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

    const iriProps = useControls({
        airIor: {
            min: 1.0,
            max: 3.0,
            value: 1.0
        },
        filmIor: {
            min: 1.0,
            max: 3.0,
            value: 1.5
        },
        bulkIor: {
            min: 1.0,
            max: 3.0,
            value: 1.0
        },
        thickness: {
            min: 1000,
            max: 5000,
            value: 3280
        },
        bumpDepth: {
            min: 0,
            max: 100,
            value: 21
        },
        uvScale: {
            min: 1,
            max: 50,
            value: 15
        },
        wavelengths: {
            min: 200,
            max: 1000,
            value: [430, 520, 650]
        },
        bumpSmoothness: {
            min: 0,
            max: 1,
            value: 0.1
        },
        roughness: {
            min: 0,
            max: 1,
            value: 0
        },
        metalness: {
            min: 0,
            max: 1,
            value: 0
        }


    })

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
                <TextDisplay text={children}>
                    <IridescentMaterial {...iriProps} />
                </TextDisplay>
            </View>
        </span>
    );
}
