'use client'

import React from 'react';

// --- Banner (Auto Carousel with arrows) ---
const images = ['/wl1.jpg', '/wl2.jpg', '/wl3.jpg', '/wl4.jpg'];

const SOCIALS = [
  { label: 'Instagram', handle: 'dranjalicures', icon: '/insta.png', href: 'https://instagram.com/dranjalicures' },
  { label: 'Facebook',  handle: 'dranjalicures', icon: '/facebook.png', href: 'https://facebook.com/dranjalicures' },
  { label: 'LinkedIn',  handle: 'dranjalicures', icon: '/linkedin.png', href: 'https://linkedin.com/in/dranjalicures' },
  { label: 'X',         handle: 'dranjalicures', icon: '/x.png', href: 'https://x.com/dranjalicures' },
  { label: 'YouTube',   handle: 'dranjalicures', icon: '/youtube.png', href: 'https://youtube.com/@dranjalicures' },
];

function BannerCarousel() {
    const wrapRef = React.useRef<HTMLDivElement | null>(null);
    const [idx, setIdx] = React.useState(0);
    const [isHover, setIsHover] = React.useState(false);
    const positionsRef = React.useRef<number[]>([]);
    const rafRef = React.useRef<number | null>(null);
    const intervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

    // Compute slide positions on mount/resize
    React.useEffect(() => {
        const el = wrapRef.current;
        if (!el) return;

        const compute = () => {
            const kids = Array.from(el.children) as HTMLElement[];
            positionsRef.current = kids.map(k => k.offsetLeft);
            if (positionsRef.current[idx] != null) {
                el.scrollTo({ left: positionsRef.current[idx], behavior: 'instant' as ScrollBehavior });
            }
        };

        compute();
        const ro = new ResizeObserver(compute);
        ro.observe(el);
        const t = setTimeout(compute, 50);

        return () => { ro.disconnect(); clearTimeout(t); };
    }, [idx, images.length]);

    // Track current index while user scrolls
    React.useEffect(() => {
        const el = wrapRef.current;
        if (!el) return;

        const onScroll = () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            rafRef.current = requestAnimationFrame(() => {
                const pos = el.scrollLeft;
                const pts = positionsRef.current;
                if (!pts.length) return;
                let nearest = 0, best = Math.abs(pos - pts[0]);
                for (let i = 1; i < pts.length; i++) {
                    const d = Math.abs(pos - pts[i]);
                    if (d < best) { best = d; nearest = i; }
                }
                setIdx(nearest);
            });
        };

        el.addEventListener('scroll', onScroll, { passive: true });
        return () => {
            el.removeEventListener('scroll', onScroll);
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, []);

    // Autoplay (pause on hover)
    React.useEffect(() => {
        if (isHover) return;
        const el = wrapRef.current;
        if (!el || !positionsRef.current.length) return;

        intervalRef.current = setInterval(() => {
            const next = (idx + 1) % images.length;
            const left = positionsRef.current[next] ?? 0;
            el.scrollTo({ left, behavior: 'smooth' });
        }, 3000);

        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }, [idx, isHover, images.length]);

    const goTo = (i: number) => {
        const el = wrapRef.current; if (!el) return;
        const n = (i + images.length) % images.length;
        const left = positionsRef.current[n] ?? 0;
        el.scrollTo({ left, behavior: 'smooth' });
        setIdx(n);
    };

    return (
        <div className="w-full relative">
            {/* Track */}
            <div
                ref={wrapRef}
                className="
          flex w-full overflow-x-auto scroll-smooth
          gap-3 sm:gap-4 md:gap-6
          justify-start px-3 sm:px-4
          snap-x snap-mandatory
          hide-scrollbar
        "
                onMouseEnter={() => setIsHover(true)}
                onMouseLeave={() => setIsHover(false)}
            >
                {images.map((src) => (
                    <div
                        key={src}
                        className="
              shrink-0 rounded-[20px] bg-no-repeat bg-center bg-cover
              snap-start
              min-w-[70%] sm:min-w-[265px] md:min-w-[320px] lg:min-w-[360px]
              aspect-[265/227]
            "
                        style={{ backgroundImage: `url(${src})` }}
                    />
                ))}
            </div>

            {/* Left Arrow */}
            <button
                aria-label="Previous slide"
                onClick={() => goTo(idx - 1)}
                className="
          absolute left-2 top-1/2 -translate-y-1/2
          h-8 w-8 sm:h-9 sm:w-9
          rounded-full bg-black/35 hover:bg-black/55
          text-white shadow-md backdrop-blur
          flex items-center justify-center
          focus:outline-none focus:ring-2 focus:ring-black/30
        "
            >
                {/* chevron-left */}
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 18l-6-6 6-6" />
                </svg>
            </button>

            {/* Right Arrow */}
            <button
                aria-label="Next slide"
                onClick={() => goTo(idx + 1)}
                className="
          absolute right-2 top-1/2 -translate-y-1/2
          h-8 w-8 sm:h-9 sm:w-9
          rounded-full bg-black/35 hover:bg-black/55
          text-white shadow-md backdrop-blur
          flex items-center justify-center
          focus:outline-none focus:ring-2 focus:ring-black/30
        "
            >
                {/* chevron-right */}
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 6l6 6-6 6" />
                </svg>
            </button>
        </div>
    );
}



const WaitList: React.FC = () => {


    const FEATURES = [
        'Step-wise learning on AI + no-code automation',
        'Hands-on projects with real-world use cases',
        'Beginner-friendly, no prior coding required',
        'Templates and checklists you can reuse',
        'Community Q&A and mentor support',
        'Lifetime access with updates',
    ];

    return <div className='w-screen h-screen overflow-hidden flex flex-col bg-[#F6F6F6]'>

        {/* Header */}
        <div className="w-screen flex justify-center h-[80px] sm:h-[113px] shadow-[0px_2px_20px_0px_#2A2A2A0D] bg-[#F6F6F6]">
            <div className="flex flex-col items-center justify-center w-full px-2 sm:px-4">
                <div className="flex shadow-[0px_8px_16px_0px_#2A2A2A0D] py-2 px-3 sm:py-[10px] sm:px-[15px] h-[40px] sm:h-[43px] rounded-[31px] gap-2 sm:gap-[6px] max-w-full">
                    {/* Avatar */}
                    <div className="flex flex-col items-center justify-center">
                        <div className="w-[22px] h-[22px] sm:w-[26px] sm:h-[26px] rounded-full bg-[url('/user.jpg')] bg-cover bg-center" />
                    </div>

                    {/* Name */}
                    <div className="flex flex-col items-center justify-center">
                        <span className="text-[14px] sm:text-[16px] font-semibold truncate max-w-[120px] sm:max-w-none">
                            Dr. Anjali Shah
                        </span>
                    </div>
                </div>
            </div>
        </div>

        {/* Main */}
        <div className='w-screen h-[calc(100%-80px-55px)] sm:h-[calc(100%-113px-85px)] flex justify-center pb-[20px]'>
            <div className='w-[95%] xl:w-[60%] h-full py-[30px] flex flex-col overflow-x-hidden overflow-y-auto hide-scrollbar'>

                {/* Banner */}
                <BannerCarousel />
                <div className="w-full flex justify-center mt-6 sm:mt-10 md:mt-20">
                    <div
                        className="
                            inline-flex items-center
                            h-9 sm:h-[35px]
                            px-3 sm:px-[12px] py-1.5 sm:py-[6px]
                            bg-white border border-[#ECECEC]
                            rounded-[30px] gap-2 sm:gap-[6px]
                            shadow-[0px_8px_16px_0px_#2A2A2A0D]
                            max-w-[92%] sm:max-w-[70%] md:max-w-[50%]
                            "
                    >
                        {/* Dot */}
                        <div className="flex items-center justify-center shrink-0">
                            <div className="flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 bg-[#0A5DBC]/30 rounded-full">
                                <div className="w-2 h-2 sm:w-[10px] sm:h-[10px] bg-[#0A5DBC] rounded-full" />
                            </div>
                        </div>

                        {/* Label */}
                        <div className="flex items-center">
                            <span
                                className="
                                text-sm sm:text-[16px] font-medium
                                whitespace-nowrap truncate
                                max-w-[60vw] sm:max-w-[46vw] md:max-w-none
                                "
                                title="Launching this September"
                            >
                                Launching this September
                            </span>
                        </div>
                    </div>
                </div>

                <div className="w-full flex justify-center mt-4 sm:mt-[15px] px-4">
                    <span
                        className="
                        font-semibold
                        text-[28px] sm:text-[40px] md:text-[56px]
                        leading-tight sm:leading-snug md:leading-[1.2]
                        w-full sm:w-[80%] md:w-[65%]
                        text-center xl:text-left
                        "
                    >
                        Your Guide to getting rid of{" "}
                        <span className="text-[#0A5DBC]">Acid Reflux</span> in 30 days
                    </span>
                </div>

                <div className="w-full flex justify-center mt-3 sm:mt-[15px] text-[#787878] px-4">
                    <span
                        className="
                        text-[14px] sm:text-[16px] md:text-[18px]
                        font-normal
                        text-center
                        w-full sm:w-[70%] md:w-[50%]
                        leading-relaxed
                        "
                    >
                        Be one of the first to get exclusive, early-access to this groundbreaking course. Sign up for this now
                    </span>
                </div>

                <div className="w-full flex justify-center mt-3 sm:mt-[15px] text-[#787878] px-4">
                    <div className="w-full sm:w-auto relative">
                        <input
                            type="email"
                            className="
                                w-full sm:w-[320px] md:w-[388px]
                                h-[56px] sm:h-[70px] md:h-[82px]
                                rounded-[40px] sm:rounded-[50px] md:rounded-[60px]
                                bg-white
                                indent-4 sm:indent-6 md:indent-7
                                border border-[#ECECEC]
                                focus:outline-none focus:ring-2 focus:ring-[#0A5DBC]/40
                                placeholder:text-sm sm:placeholder:text-base
                            "
                            placeholder="Please enter your email..."
                        />
                        <div
                            className="
                                flex flex-col justify-center items-center
                                h-[56px] sm:h-[70px] md:h-[82px]
                                absolute top-0 right-2 sm:right-2 md:right-3
                            "
                        >
                            <button
                                className="
                                text-white bg-[#0A5DBC]
                                h-[40px] sm:h-[46px] md:h-[50px]
                                px-4 sm:px-[18px] md:px-[20px]
                                text-sm sm:text-[14px] font-normal
                                flex justify-center items-center
                                rounded-full shadow-md hover:bg-[#094c9a] transition
                                "
                            >
                                Join for Rs. 50
                            </button>
                        </div>
                    </div>
                </div>
                <div className='w-full flex justify-center mt-[10px] text-[#686868]'>
                    <span className='text-[12px] font-[400]'>Trusted by 500+ patients</span>
                </div>

                <div className='w-full flex justify-center mt-[60px]'>
                    <div className='w-full md:w-[80%] flex flex-col'>
                        <div
                            className="
                            inline-flex items-center
                            h-8 sm:h-9 md:h-[35px]
                            px-3 sm:px-[10px] md:px-[12px]
                            py-1 sm:py-1.5 md:py-[6px]
                            bg-white border border-[#ECECEC]
                            rounded-[30px]
                            gap-1.5 sm:gap-2 md:gap-[6px]
                            shadow-[0px_8px_16px_0px_#2A2A2A0D]
                            w-fit
                        "
                        >
                            <span className="text-[14px] sm:text-[15px] md:text-[16px] font-normal">
                                About
                            </span>
                        </div>

                        {/* Description */}
                        <div className="w-full mt-3 sm:mt-[15px] text-[#787878] px-4 sm:px-0">
                            <span
                                className="
                                block
                                text-[18px] sm:text-[24px] md:text-[36px]
                                font-semibold
                                leading-snug sm:leading-normal md:leading-[1.3]
                                text-center sm:text-left
                                "
                            >
                                Learn how to fix acid reflux naturally with simple diet, lifestyle, and gut-healing strategies. This course helps you find lasting relief without relying on medication.
                            </span>
                        </div>
                        <div className="mt-[30px] w-full bg-white rounded-[20px] px-[15px] pt-[25px] pb-[15px]">
                            {/* Dots */}
                            <div className="flex gap-1">
                                <div className="w-[10px] h-[10px] rounded-full bg-[#E7E4E4]" />
                                <div className="w-[10px] h-[10px] rounded-full bg-[#E7E4E4]" />
                                <div className="w-[10px] h-[10px] rounded-full bg-[#E7E4E4]" />
                            </div>

                            {/* Responsive YouTube */}
                            <div className="mt-[30px] w-full aspect-video">
                                <iframe
                                    className="w-full h-full rounded-[25px]"
                                    src="https://www.youtube.com/embed/fxx_E0ojKrc"
                                    title="YouTube video"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            </div>
                        </div>

                        <div
                            className="
                            inline-flex items-center
                            h-8 sm:h-9 md:h-[35px]
                            px-3 sm:px-[10px] md:px-[12px]
                            py-1 sm:py-1.5 md:py-[6px]
                            bg-white border border-[#ECECEC]
                            rounded-[30px]
                            gap-1.5 sm:gap-2 md:gap-[6px]
                            shadow-[0px_8px_16px_0px_#2A2A2A0D]
                            w-fit
                            mt-[70px]
                        "
                        >
                            <span className="text-[14px] sm:text-[15px] md:text-[16px] font-normal">
                                What you'll get
                            </span>
                        </div>

                        <div className="flex flex-col mt-[15px] w-full">
                            <div
                                className="
      grid grid-cols-1 sm:grid-cols-2
      gap-3 sm:gap-4
    "
                                role="list"
                            >
                                {FEATURES.map((text) => (
                                    <div
                                        key={text}
                                        role="listitem"
                                        className="
          flex items-start gap-3
          p-4 sm:p-5
          rounded-[20px] border border-[#ECECEC]
          text-[14px] sm:text-[15px] md:text-[16px]
          bg-white
        "
                                    >
                                        {/* Check icon */}
                                        <span className="shrink-0 mt-0.5 text-[#094c9a] leading-none">✔</span>

                                        {/* Text */}
                                        <span className="text-[#000] font-[500] leading-relaxed">
                                            {text}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div
                            className="
                            inline-flex items-center
                            h-8 sm:h-9 md:h-[35px]
                            px-3 sm:px-[10px] md:px-[12px]
                            py-1 sm:py-1.5 md:py-[6px]
                            bg-white border border-[#ECECEC]
                            rounded-[30px]
                            gap-1.5 sm:gap-2 md:gap-[6px]
                            shadow-[0px_8px_16px_0px_#2A2A2A0D]
                            w-fit
                            mt-[70px]
                        "
                        >
                            <span className="text-[14px] sm:text-[15px] md:text-[16px] font-normal">
                                Socials
                            </span>
                        </div>

<div className="w-full flex flex-wrap gap-2 sm:gap-3 md:gap-4 mt-[15px]">
  {SOCIALS.map(({ label, handle, icon, href }) => (
    <a
      key={label}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="
        flex items-center gap-3 sm:gap-4
        border border-[#ECECEC] 
        rounded-[30px]
        px-4 py-3 sm:px-5 sm:py-4
        hover:shadow-[0px_8px_16px_0px_#2A2A2A0D] transition
      "
    >
      {/* Icon bubble */}
      <div className="flex items-center justify-center bg-white w-12 h-12 sm:w-14 sm:h-14 rounded-full border border-[#ECECEC]">
        <img src={icon} alt={label} className="w-5 h-5 sm:w-6 sm:h-6" />
      </div>

      {/* Text */}
      <div className="flex flex-col leading-tight">
        <span className="text-[15px] sm:text-[16px] font-[500] text-black">{label}</span>
        <span className="text-[#787878] text-[12px] sm:text-[13px] font-[400] truncate max-w-[40vw] sm:max-w-[20vw] md:max-w-none">
          {handle}
        </span>
      </div>
    </a>
  ))}
</div>
                    </div>
                </div>
            </div>
        </div>

        <div className="w-screen flex flex-col items-center justify-center h-[55px] sm:h-[85px]  shadow-[0px_2px_20px_0px_#2A2A2A0D] bg-[#F6F6F6] text-[#787878]">
                                    @2025, Klub
        </div>
    </div >
}

export default WaitList;