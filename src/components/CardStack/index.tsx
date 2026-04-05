import useEmblaCarousel from 'embla-carousel-react'
import styles from './style.module.css'

export function CardStack() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });

  const goToPrev = () => emblaApi?.scrollPrev();
  const goToNext = () => emblaApi?.scrollNext();

  return (
    <div className="embla">
      <div className={styles.viewport} ref={emblaRef}>
        <div className={styles.container}>
          <div className={styles.slide}>Slide 1</div>
          <div className={styles.slide}>Slide 2</div>
          <div className={styles.slide}>Slide 3</div>
        </div>
      </div>

      <button onClick={goToPrev}>Scroll to prev</button>
      <button onClick={goToNext}>Scroll to next</button>
    </div>
  )
}
