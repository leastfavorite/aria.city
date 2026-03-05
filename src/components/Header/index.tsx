import { MouseEvent, useRef } from 'react';
import styles from './style.module.css';
import FancyText from '../FancyText';

import { NavigationMenu } from '@base-ui/react/navigation-menu';
import Link from 'next/link';
import { vec3 } from 'gl-matrix';

function Title() {
    return (
        <h1 className={styles.title}>
            <FancyText>aria.city!</FancyText>
        </h1>
    );
}

function NavButton({ href, text }: { href: string, text: string }) {
    const liRef = useRef<HTMLLIElement>(null);
    const divRef = useRef<HTMLDivElement>(null);
    const aRef = useRef<HTMLAnchorElement>(null);

    function onMouseMove(event: MouseEvent) {
        if (!divRef.current || !aRef.current || !liRef.current) {
            return;
        }
        const bounds = liRef.current.getBoundingClientRect();

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

        divRef.current.style.backgroundPositionX = `calc(30% + ${parallel[0] * 3}px)`
        divRef.current.style.backgroundPositionY = `calc(30% + ${parallel[1] * 3}px)`
        divRef.current.style.rotate =
            `${axis[0]} ${axis[1]} ${axis[2]} ${rotAmt * 30}deg`

        aRef.current.style.translate =
            `${-parallel[0]/5}px ${-parallel[1]/5}px`
    }

    return (
        <NavigationMenu.Item ref={liRef} onMouseMove={onMouseMove}>
            <div ref={divRef}>
                <Link ref={aRef} href={href}>{text}</Link>
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
