'use client';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { MeshStandardMaterial } from 'three';
import CustomShaderMaterial from 'three-custom-shader-material'
import CSM from 'three-custom-shader-material/vanilla'

import vertexShader from './static/vert.glsl'
import fragmentShader from './static/frag.glsl'

interface IridescentMaterialProps {
    airIor: number,
    filmIor: number,
    bulkIor: number,
    thickness: [number, number],
    uvScale: number
}

export default function IridescentMaterial(props: IridescentMaterialProps) {
    const materialRef = useRef<CSM<typeof MeshStandardMaterial>>(null!);

    useFrame((state) => {
        if (materialRef.current) {
            materialRef.current!.uniforms.uTime.value = state.clock.elapsedTime
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
                uIors: { value: [props.airIor, props.filmIor, props.bulkIor] },
                uThickness: { value: props.thickness },
                uTextureScale: { value: props.uvScale }
            }}
            // Base material properties
            flatShading
            color={0xff00ff}
        />
    )
}
