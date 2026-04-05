"use client";

import { NavigationMenu } from '@base-ui/react/navigation-menu';
import { PropsWithChildren } from 'react';
import Tilting from '../Tilting';
import Link from 'next/link';

import styles from './style.module.css';

function NavButton({ href, text }: { href: string, text: string }) {

    return (
        <Tilting tiltX={30} tiltY={15} innerScale={1.6} outerScale={2.0}>
            <NavigationMenu.Item>
                <div className={`${styles.iridescent} absolute-before parallax-before absolute parallax`} />
                <Link href={href} className='parallax'>
                    {text}
                </Link>
            </NavigationMenu.Item>
        </Tilting>
    )
}

export default function Nav() {
    return (
        <NavigationMenu.Root className={styles.navRoot}>
            <NavButton href='/' text="Home" />
            <NavButton href='/blog' text="Blog" />
        </NavigationMenu.Root>
    );

}
