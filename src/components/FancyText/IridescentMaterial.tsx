'use client';
import { useFrame } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { MeshStandardMaterial } from 'three';
import CustomShaderMaterial from 'three-custom-shader-material'
import CSM from 'three-custom-shader-material/vanilla'

import vertexShader from './static/vert.glsl'
import fragmentShader from './static/frag.glsl'

interface IridescentMaterialProps {
    airIor: number,
    filmIor: number,
    bulkIor: number,
    thickness: number,
    bumpDepth: number,
    bumpSmoothness: number,

    uvScale: number,
    wavelengths: [number, number, number],

    roughness: number,
    metalness: number
}

export default function IridescentMaterial(props: IridescentMaterialProps) {
    const materialRef = useRef<CSM<typeof MeshStandardMaterial>>(null!);

    useFrame((state) => {
        if (materialRef.current) {
            materialRef.current!.uniforms.uTime.value = state.clock.elapsedTime

            let u = materialRef.current.uniforms;
            u.uIors.value = [props.airIor, props.filmIor, props.bulkIor];
            u.uThickness.value = props.thickness;
            u.uBumpDepth.value = props.bumpDepth;
            u.uTextureScale.value = props.uvScale;
            u.uWavelengths.value = props.wavelengths;
            u.uBumpSmoothness.value = props.bumpSmoothness;
        }
    })

    return (
        <CustomShaderMaterial
            ref={materialRef}
            baseMaterial={MeshStandardMaterial}
            vertexShader={vertexShader}
            fragmentShader={fragmentShader}
            // Your Uniforms
            uniforms={{
                uTime: { value: 0 },
                uIors: { value: [1.0, 1.5, 1.0] },
                uThickness: { value: 3280 },
                uBumpDepth: { value: 25 },
                uTextureScale: { value: 5 },
                uWavelengths: { value: [430, 520, 650] },
                uBumpSmoothness: { value: 0.1 }
            }}
            // Base material properties
            flatShading

            roughness={props.roughness}
            metalness={props.metalness}
        />
    )
}
