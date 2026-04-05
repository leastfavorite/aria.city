'use client';

import Background from "@/components/Background";
import CanvasProvider from "@/components/CanvasProvider";
import Card from "@/components/Card";
import Header from "@/components/Header/index";

import styles from "./page.module.css";
import Image from "next/image";
import { CSSProperties, useEffect, useRef, use, useCallback } from "react";
import { LucideCat } from "lucide-react";
import Nav from "@/components/Nav";

export default function Page() {

  const srcs = [
    '/static/purrloin1.png',
    '/static/purrloin2.png',
    '/static/purrloin3.png',
    '/static/purrloin4.png'
  ];
  const imgs = srcs.map((src, i) => (
    <Image
      key={i}
      className='parallax'
      style={{'--parallax': -0.03 * (srcs.length - i - 2)} as CSSProperties}
      src={src} alt=""
      width={400} height={250}
    />
  ));


  return (<>
    <Background>
      <CanvasProvider>
        <Header />
        <Nav />
        <main className={styles.main}>
          <div className={styles.leftContainer}>
            My name is aria. This website is currently under very heavy construction.
          </div>
          <div className={styles.rightContainer}>
          </div>
        </main>
      </CanvasProvider>
    </Background>
  </>);
}
