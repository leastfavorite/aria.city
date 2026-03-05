'use client';

import { PropsWithChildren } from 'react';
import styles from './style.module.css';

export default function Background({ children }: PropsWithChildren) {
    return (
        <div className={styles.container}>
            <div className={styles.gutter} />
            <div className={styles.content}>
                {children}
            </div>
            <div className={styles.gutter} />
        </div>
    )
}
