'use client';

import * as React from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import type { EmblaOptionsType } from 'embla-carousel';
import Autoplay from 'embla-carousel-autoplay';

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────
type Slide = { src: string };

const SLIDES_DEFAULT: Slide[] = [
  { src: '/wl1.jpg' },
  { src: 'https://www.youtube.com/watch?v=fxx_E0ojKrc' },
  { src: '/wl2.jpg' },
  { src: '/wl3.jpg' },
  { src: '/wl4.jpg' },
];

// ──────────────────────────────────────────────
// Media Renderer
// ──────────────────────────────────────────────
const renderMedia = (url: string, isBanner = false) => {
  const videoFile = /\.(mp4|mov|avi|webm|ogg)$/i.test(url);
  const youtube = /youtu(\.be|be\.com)/i.test(url);
  const vimeo = /vimeo/i.test(url);
  const isIframe = youtube || vimeo;

  if (videoFile) {
    return (
      <video
        src={url}
        controls
        className={`w-full ${isBanner ? 'h-[300px]' : 'h-full'} object-cover rounded-[20px]`}
      />
    );
  }

  if (isIframe) {
    let embedUrl = url;

    if (youtube) {
      const videoIdMatch = url.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})/);
      const videoId = videoIdMatch ? videoIdMatch[1] : '';
      embedUrl = `https://www.youtube.com/embed/${videoId}?rel=0`;
    } else if (vimeo) {
      const videoIdMatch = url.match(/vimeo\.com\/(\d+)/);
      const videoId = videoIdMatch ? videoIdMatch[1] : '';
      embedUrl = `https://player.vimeo.com/video/${videoId}`;
    }

    return (
      <iframe
        src={embedUrl}
        className={`w-full ${isBanner ? 'h-[300px]' : 'h-full'} rounded-[20px]`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        loading="lazy"
      />
    );
  }

  return (
    <img
      src={url}
      alt=""
      className={`w-full ${isBanner ? 'h-[300px]' : 'h-full'} object-cover rounded-[20px]`}
    />
  );
};

// ──────────────────────────────────────────────
// Carousel Component
// ──────────────────────────────────────────────
export default function BannerCarousel({ slides }: { slides?: Slide[] }) {
  const SLIDES = slides && slides.length ? slides : SLIDES_DEFAULT;
  const sectionRef = React.useRef<HTMLDivElement | null>(null);

  const options: EmblaOptionsType = {
    loop: false,
    align: 'center',       // fix last item cutoff
    containScroll: 'keepSnaps',
    skipSnaps: false,
  };
  const autoplayRef = React.useRef(
    Autoplay({ delay: 3000, stopOnInteraction: true, stopOnMouseEnter: true })
  );

  const [emblaRef, emblaApi] = useEmblaCarousel(options, [autoplayRef.current]);
  const [selected, setSelected] = React.useState(0);
  const [canScroll, setCanScroll] = React.useState(false);

  const viewportRef = React.useRef<HTMLDivElement | null>(null);
  const setViewportRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      viewportRef.current = node;
      emblaRef(node);
    },
    [emblaRef]
  );

  const updateCanScroll = React.useCallback(() => {
    if (!emblaApi) return;
    const scrollable =
      emblaApi.scrollSnapList().length > 1 &&
      (emblaApi.canScrollNext() || emblaApi.canScrollPrev());
    setCanScroll(scrollable);
  }, [emblaApi]);

  React.useEffect(() => {
    if (!emblaApi) return;

    const autoplay = autoplayRef.current;

    const onSelect = () => {
      const idx = emblaApi.selectedScrollSnap();
      setSelected(idx);
      updateCanScroll();

      const currentSlide = SLIDES[idx];
      if (!autoplay) return;

      // Pause autoplay for video slides
      if (/\.(mp4|mov|avi|webm|ogg)$/i.test(currentSlide.src) || /youtu|vimeo/i.test(currentSlide.src)) {
        autoplay.stop?.();
      } else {
        autoplay.play?.();
      }
    };

    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    emblaApi.on('resize', updateCanScroll);

    // run once initially
    onSelect();

    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
      emblaApi.off('resize', updateCanScroll);
    };
  }, [emblaApi, updateCanScroll, SLIDES]);


  // wheel scrolling
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
      if (!canScroll) return;
      const delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      if (delta === 0) return;
      e.preventDefault();
      autoplayRef.current?.stop?.();

      accum += delta;
      while (accum >= WHEEL_STEP) {
        emblaApi.scrollNext();
        accum -= WHEEL_STEP;
      }
      while (accum <= -WHEEL_STEP) {
        emblaApi.scrollPrev();
        accum += WHEEL_STEP;
      }

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

  return (
    <div ref={sectionRef} className="w-full relative">
      <div
        ref={setViewportRef}
        className="overflow-hidden px-3 sm:px-4 cursor-grab active:cursor-grabbing"
      >
        <div
          className={`flex gap-3 sm:gap-4 md:gap-6 ${canScroll ? '' : 'justify-center'
            }`}
        >
          {SLIDES.map((slide, i) => (
            <div
              key={`${slide.src}-${i}`}
              className="shrink-0 basis-[85%] sm:basis-[360px] md:basis-[420px] lg:basis-[480px] aspect-[265/227] rounded-[20px] overflow-hidden bg-black/5 shadow-sm"
            >
              {renderMedia(slide.src)}
            </div>
          ))}
        </div>
      </div>

      {canScroll && (
        <>
          <button
            aria-label="Previous slide"
            onClick={scrollPrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-black/35 hover:bg-black/55 text-white shadow-md backdrop-blur flex items-center justify-center"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button
            aria-label="Next slide"
            onClick={scrollNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-black/35 hover:bg-black/55 text-white shadow-md backdrop-blur flex items-center justify-center"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 6l6 6-6 6" />
            </svg>
          </button>
        </>
      )}

      {canScroll && (
        <div className="mt-3 flex items-center justify-center gap-2">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-2.5 w-2.5 rounded-full transition ${selected === i ? 'bg-black/80 scale-110' : 'bg-black/30 hover:bg-black/45'
                }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
