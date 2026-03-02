'use client';

import styles from './style.module.css';
import fontData from './static/pixelify-sans.json';

import { CameraControls, Center, OrthographicCamera, PerspectiveCamera, View } from "@react-three/drei";
import { useMemo } from 'react';
import { MeshPhongMaterial } from 'three';
import { FontLoader, TextGeometry } from 'three/examples/jsm/Addons.js';

type Glyph = {
    "ha": number,
    "x_min": number,
    "x_max": number,
    "o": string
}

const font = new FontLoader().parse(fontData as any)
const glyphs = fontData.glyphs as { [char: string]: Glyph }



const material = [
    new MeshPhongMaterial({ color: "#00ff00" }),
    new MeshPhongMaterial({ color: "#0000ff" }),
];
function TextDisplay({ children }: { children: string }) {
    const meshes = useMemo(() => {
        let meshes = [];

        let xOffset = 0;
        const textSettings = {
            font,
            size: 100
        };

        const scale = textSettings.size / fontData.resolution;

        for (const char of children) {
            const glyph: Glyph | undefined = glyphs[char]
            if (!glyph) {
                throw new Error(`Unknown glyph '${char}'`);
            }

            const geometry = new TextGeometry(char, textSettings);
            const mesh = <mesh
                geometry={geometry}
                material={material}
                position={[(xOffset + glyph.x_min) * scale, 0, 0]}
            />

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
            {children}
            <View className={styles.view}>
                <PerspectiveCamera
                    makeDefault
                    position={[0, 0, 50]}
                    fov={30}
                />
                <CameraControls />
                <TextDisplay>
                    {children}
                </TextDisplay>

                <pointLight position={[10, 10, 10]} intensity={1000}>
                </pointLight>

            </View>
        </span>
    );
}
