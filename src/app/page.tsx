'use client';

import Background from "@/components/Background";
import CanvasProvider from "@/components/CanvasProvider";
import Card from "@/components/Card";
import Header from "@/components/Header/index";

import styles from "./page.module.css";

export default function Page() {

  return (<>
    <Background>
      <CanvasProvider>
        <Header />
        <main>
          <div className={styles.leftContainer}>
          </div>
          <div className={styles.rightContainer}>
            <Card tiltX={20} tiltY={50} />
          </div>
        </main>
      </CanvasProvider>
    </Background>
  </>);
}
