import { MouseEvent, PropsWithChildren, useEffect, useRef } from 'react';
import styles from './style.module.css';
import FancyText from '../FancyText';

import { NavigationMenu } from '@base-ui/react/navigation-menu';
import Link from 'next/link';
import { vec3 } from 'gl-matrix';

function Title() {
    return (
        <h1 className={styles.title}>
            <FancyText>aria.city</FancyText>
        </h1>
    );
}

function NavButton({ href, text }: { href: string, text: string }) {
    const ref = useRef<HTMLDivElement>(null);

    function onMouseMove(event: MouseEvent) {
        if (ref.current) {
            const bounds = ref.current.getBoundingClientRect();

            const size = Math.sqrt(
                bounds.width * bounds.width +
                bounds.height * bounds.height
            ) / 2;


            const parallel = [
                bounds.x + bounds.width / 2 - event.clientX,
                bounds.y + bounds.height / 2 - event.clientY,
                0
            ]

            const rotAmt = vec3.len(parallel) / size;
            const out: vec3 = [ 0, 0, 1 ];
            const axis = vec3.normalize(out, vec3.cross(out, parallel, out));

            ref.current.style.backgroundPositionX = `calc(150% + ${parallel[0] * 1.5}px)`
            ref.current.style.backgroundPositionY = `calc(150% + ${parallel[1] * 5}px)`
            ref.current.style.rotate =
                `${axis[0]} ${axis[1]} ${axis[2]} ${rotAmt * 30}deg`
        }
    }

    return (
        <NavigationMenu.Item onMouseMove={onMouseMove}>
            <div ref={ref}>
                <Link href={href}>{text}</Link>
            </div>
        </NavigationMenu.Item>
    );
}

function NavMenu() {
    return (

        <NavigationMenu.Root className={styles.navRoot}>
            <NavButton href="/" text="Home" />
            <NavButton href="/blog" text="Blog" />
        </NavigationMenu.Root>
    );
}

export default function Header() {
    // todo:
    // - get 3d text in pixelify-sans
    return (<>
        <header className={styles.header}>
            <Title />
            <NavMenu />
        </header>
    </>);
}
