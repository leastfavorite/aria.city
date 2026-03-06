'use client';

import { MouseEvent, PropsWithChildren, useCallback, useRef } from "react";
import styles from './style.module.css';

export interface CardProps {
    tiltX?: number,
    tiltY?: number,
    tilt?: number
}

export default function Card({ children, ...props }: PropsWithChildren<CardProps>) {
    console.log(props)
    const cardRef = useRef<HTMLDivElement>(null);
    const viewportRef = useRef<HTMLDivElement>(null);

    const onMouseMove = useCallback(({ clientX, clientY }: MouseEvent) => {
        if ((!(props.tiltX) || !(props.tiltY)) && !(props.tilt)) {
            throw new Error("must specify tilt");
        }

        const tiltX = (props.tiltX ?? props.tilt)!;
        const tiltY = (props.tiltY ?? props.tilt)!;

        if (viewportRef.current && cardRef.current) {
            const bounds = viewportRef.current.getBoundingClientRect();

            const scale = {
                x: tiltX < tiltY ? tiltX / tiltY : 1,
                y: tiltY < tiltX ? tiltY / tiltX : 1
            }

            const center = {
                x: bounds.x + bounds.width / 2,
                y: bounds.y + bounds.height / 2
            };

            // the furthest point we can reach
            const extent = Math.sqrt(
                Math.pow(bounds.width * scale.x, 2) +
                Math.pow(bounds.height * scale.y, 2)
            ) / 2;

            const mouse = {
                x: (clientX - center.x) * scale.x,
                y: (clientY - center.y) * scale.y
            };

            const dist = Math.sqrt(mouse.x * mouse.x + mouse.y * mouse.y);

            const rotAmt = (dist / extent) * Math.max(tiltX, tiltY);
            console.log(mouse, rotAmt)

            cardRef.current.style.setProperty(
                "--rot", `${-mouse.y} ${mouse.x} 0 ${rotAmt}deg`)
            cardRef.current.style.setProperty(
                "--offset-x", `${mouse.x}px`
            )
            cardRef.current.style.setProperty(
                "--offset-y", `${mouse.y}px`
            )
        }
    }, [props.tiltX, props.tiltY]);
    return (
        <div className={styles.viewport}
            onMouseMove={onMouseMove}
            ref={viewportRef}>
            <div className={styles.card} ref={cardRef}>
                    <div className={styles.background}>
                        <div className={styles.iridescent} />
                        <div className={styles.checkerboard} />
                        <div className={styles.shadow} />
                    </div>
                    <div className={styles.border} />
                    <div className={styles.childContainer} >
                        <h1>etweoihsdhgisdg</h1>
                    </div>
                </div>
        </div>
    );
}
