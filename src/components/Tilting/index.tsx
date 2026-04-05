import { MouseEvent, PropsWithChildren, useCallback, useRef } from 'react';
import styles from './style.module.css';

export interface TiltingProps {
    tiltX: number,
    tiltY: number,
    outerScale?: number,
    innerScale?: number
}

export default function Tilting({
            children, tiltX, tiltY, outerScale=1, innerScale=1
        }: PropsWithChildren<TiltingProps>) {
    const cardRef = useRef<HTMLDivElement>(null);
    const viewportRef = useRef<HTMLDivElement>(null);

    const onMouseMove = useCallback(({ clientX, clientY }: MouseEvent) => {
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

            const mouse = {
                x: (clientX - center.x) * scale.x,
                y: (clientY - center.y) * scale.y
            };

            const mag = 2 * Math.max(Math.abs(mouse.x / bounds.width), Math.abs(mouse.y / bounds.height));
            const rotAmt = mag * Math.max(tiltX, tiltY);
            const scaleAmt = (innerScale - outerScale) * Math.max(0, 1 - mag * mag * mag) + outerScale;
            console.log(rotAmt, scaleAmt);

            cardRef.current.style.setProperty(
                "--rot", `${-mouse.y} ${mouse.x} 0 ${rotAmt}deg`)
            cardRef.current.style.setProperty(
                "--offset-x", `${mouse.x}px`)
            cardRef.current.style.setProperty(
                "--offset-y", `${mouse.y}px`)

            // circular arc
            cardRef.current.style.setProperty(
                "--mag", `${scaleAmt}`)
        }
    }, [tiltX, tiltY]);

    return (
        <div className={`${styles.viewport} tilting`}
            onMouseMove={onMouseMove}
            ref={viewportRef}>
            <div className={styles.card} ref={cardRef}>
                {children}
            </div>
        </div>
    );
}
