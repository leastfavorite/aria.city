'use client';
// note: not really a provider.
// sub-note: maybe a provider under the hood (shrug emoji)

import { CSSProperties, PropsWithChildren, RefObject, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { View } from "@react-three/drei";

export default function CanvasProvider({ children }: PropsWithChildren) {
    const container = useRef<HTMLDivElement>(null);

    const canvasStyle: CSSProperties = {
        position: 'fixed',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        overflow: 'hidden'
    };

    return (
        <div ref={container}>
            {children}
            <Canvas
                style={canvasStyle}
                eventSource={container as RefObject<HTMLElement>}>
                <View.Port />
            </Canvas>
        </div>
    );
}
