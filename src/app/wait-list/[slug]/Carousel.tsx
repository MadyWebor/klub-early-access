'use client';

import * as React from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import type { EmblaOptionsType } from 'embla-carousel';
import Autoplay from 'embla-carousel-autoplay';

type Slide =
  | { type: 'image'; src: string }
  | { type: 'video'; src: string };

const SLIDES_DEFAULT: Slide[] = [
  { type: 'image', src: '/wl1.jpg' },
  { type: 'video', src: 'https://www.youtube.com/embed/fxx_E0ojKrc' },
  { type: 'image', src: '/wl2.jpg' },
  { type: 'image', src: '/wl3.jpg' },
  { type: 'image', src: '/wl4.jpg' },
];

export default function BannerCarousel({ slides }: { slides?: Slide[] }) {
  const SLIDES = slides && slides.length ? slides : SLIDES_DEFAULT;

  const sectionRef = React.useRef<HTMLDivElement | null>(null);

  const optionsA: EmblaOptionsType = {
    loop: false,
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: false,
    skipSnaps: false,
  };

  const autoplayRef = React.useRef(
    Autoplay({ delay: 3000, stopOnInteraction: true, stopOnMouseEnter: true })
  );

  const [emblaRef, emblaApi] = useEmblaCarousel(optionsA, [autoplayRef.current]);
  const [selected, setSelected] = React.useState(0);
  const [canScroll, setCanScroll] = React.useState(false);

  const videoIdx = React.useMemo(
    () => SLIDES.findIndex((s) => s.type === 'video'),
    [SLIDES]
  );

  // keep a DOM ref to the viewport so we can attach wheel handler
  const viewportRef = React.useRef<HTMLDivElement | null>(null);
  const setViewportRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      viewportRef.current = node;
      emblaRef(node);
    },
    [emblaRef]
  );

  // helper: update whether carousel can scroll
  const updateCanScroll = React.useCallback(() => {
    if (!emblaApi) return;
    // true if there are multiple snaps and either direction can scroll
    const scrollable =
      emblaApi.scrollSnapList().length > 1 &&
      (emblaApi.canScrollNext() || emblaApi.canScrollPrev());
    setCanScroll(scrollable);
  }, [emblaApi]);

  React.useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setSelected(emblaApi.selectedScrollSnap());
      updateCanScroll();
    };

    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', updateCanScroll);
    emblaApi.on('resize', updateCanScroll);

    // initial sync
    onSelect();

    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', updateCanScroll);
      emblaApi.off('resize', updateCanScroll);
    };
  }, [emblaApi, updateCanScroll]);

  React.useEffect(() => {
    if (!emblaApi) return;
    const isVideo = SLIDES[selected]?.type === 'video';
    if (isVideo) autoplayRef.current?.stop?.();
    else autoplayRef.current?.play?.();
  }, [selected, emblaApi, SLIDES]);

  React.useEffect(() => {
    if (!emblaApi || videoIdx < 0) return;
    let hasJumped = false;
    const el = sectionRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && !hasJumped) {
          setTimeout(() => emblaApi.scrollTo(videoIdx, true), 150);
          hasJumped = true;
        }
      },
      { root: null, rootMargin: '-20% 0px -50% 0px', threshold: 0.01 }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [emblaApi, videoIdx]);

  React.useEffect(() => {
    const vp = viewportRef.current;
    if (!vp || !emblaApi) return;

    let accum = 0;
    let resumeTimer: ReturnType<typeof setTimeout> | null = null;

    const resumeAutoplaySoon = () => {
      if (resumeTimer) clearTimeout(resumeTimer);
      resumeTimer = setTimeout(() => autoplayRef.current?.play?.(), 900);
    };

    const WHEEL_STEP = 60;

    const onWheel = (e: WheelEvent) => {
      if (!canScroll) return; // don't hijack scroll if we can't move
      const delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      if (delta === 0) return;
      e.preventDefault();
      autoplayRef.current?.stop?.();

      accum += delta;
      while (accum >= WHEEL_STEP) { emblaApi.scrollNext(); accum -= WHEEL_STEP; }
      while (accum <= -WHEEL_STEP) { emblaApi.scrollPrev(); accum += WHEEL_STEP; }

      resumeAutoplaySoon();
    };

    vp.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      vp.removeEventListener('wheel', onWheel as EventListener);
      if (resumeTimer) clearTimeout(resumeTimer);
    };
  }, [emblaApi, canScroll]);

  const scrollPrev = React.useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = React.useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = React.useCallback((i: number) => emblaApi?.scrollTo(i, true), [emblaApi]);

  // const handleEnter = () => {
  //   if (!emblaApi) return;
  //   autoplayRef.current?.stop?.();
  // };
  // const handleLeave = () => {
  //   if (!emblaApi) return;
  //   autoplayRef.current?.play?.();
  // };

  return (
    <div ref={sectionRef} className="w-full relative">
      <div ref={setViewportRef} className="overflow-hidden px-3 sm:px-4 cursor-grab active:cursor-grabbing">
        {/* Center track when not scrollable */}
        <div className={`flex gap-3 sm:gap-4 md:gap-6 ${canScroll ? '' : 'justify-center'}`}>
          {SLIDES.map((slide, i) => (
            <div
              key={`${slide.type}-${slide.src}-${i}`}
              className="shrink-0 basis-[85%] sm:basis-[360px] md:basis-[420px] lg:basis-[480px] aspect-[265/227] rounded-[20px] overflow-hidden bg-black/5 shadow-sm"
              // onMouseEnter={handleEnter}
              // onMouseLeave={handleLeave}
            >
              {slide.type === 'image' ? (
                <div className="w-full h-full bg-center bg-cover rounded-[20px]" style={{ backgroundImage: `url(${slide.src})` }} />
              ) : (
                <iframe
                  className="w-full h-full"
                  src={`${slide.src}?rel=0`}
                  title="Course video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                  loading="lazy"
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Arrows only when scrollable */}
      {canScroll && (
        <>
          <button
            aria-label="Previous slide"
            onClick={scrollPrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-black/35 hover:bg-black/55 text-white shadow-md backdrop-blur flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-black/30"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          <button
            aria-label="Next slide"
            onClick={scrollNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-black/35 hover:bg-black/55 text-white shadow-md backdrop-blur flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-black/30"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 6l6 6-6 6" />
            </svg>
          </button>
        </>
      )}

      {/* Dots only when scrollable */}
      {canScroll && (
        <div className="mt-3 flex items-center justify-center gap-2">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-2.5 w-2.5 rounded-full transition
                ${selected === i ? 'bg-black/80 scale-110' : 'bg-black/30 hover:bg-black/45'}
              `}
            />
          ))}
        </div>
      )}
    </div>
  );
}
