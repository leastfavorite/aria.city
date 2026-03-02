import { PropsWithChildren } from 'react';
import styles from './style.module.css';
import FancyText from '../FancyText';

export default function Header() {
    // todo:
    // - get 3d text in pixelify-sans
    return (
        <header className={styles.header}>
            <h1 className={styles.title}>
                <FancyText>
                    aria.city
                </FancyText>
            </h1>
        </header>
    );
}
