'use client';

import { CSSProperties, FC, MouseEvent, PropsWithChildren, useCallback, useRef } from "react";
import styles from './style.module.css';
import Tilting from "../Tilting";
import { LucideProps } from "lucide-react";

type CardCategory = 'project' | 'information' | 'lifestyle';

export interface CardLook {
    borderColor: string,
    borderRadius: number,
    backgroundColor: string,

    // opacity
    iridescence: number,
    checkerboard: number
}

export interface CardType {
    icon: FC<LucideProps>,
    info: string,
    color: string
}

export interface CardProps {
    types: CardType[]
    title: string
    category: CardCategory
    status?: 'ongoing'
    description: string
}

export default function Card({ children, ...props }: PropsWithChildren<CardProps>) {
    console.log(props)
    return (
        <Tilting tiltX={10} tiltY={10} innerScale={0}>
            <div className={styles.background}>
                <div className={`${styles.iridescent} absolute parallax`} />
                <div className={`${styles.checkerboard} absolute parallax`} />
                <div className={`${styles.shadow} absolute`} />
            </div>
            <div className={styles.border} />
            <div className={styles.childContainer} >
                {children}
            </div>
        </Tilting>
    );
}
