'use client'

import React from 'react';
import { CiPlay1, CiStar } from "react-icons/ci";
import { BsVectorPen } from "react-icons/bs";
import { RiApps2Line } from "react-icons/ri";
import { FaRegUserCircle } from "react-icons/fa";
import { IoCheckmark } from "react-icons/io5";
import { FaQuestion } from "react-icons/fa6";
import BannerCarousel from './Carousel';

const SOCIALS = [
    { label: 'Instagram', handle: 'dranjalicures', icon: '/insta.png', href: 'https://instagram.com/dranjalicures' },
    { label: 'Facebook', handle: 'dranjalicures', icon: '/facebook.png', href: 'https://facebook.com/dranjalicures' },
    { label: 'LinkedIn', handle: 'dranjalicures', icon: '/linkedin.png', href: 'https://linkedin.com/in/dranjalicures' },
    { label: 'X', handle: 'dranjalicures', icon: '/x.png', href: 'https://x.com/dranjalicures' },
    { label: 'YouTube', handle: 'dranjalicures', icon: '/youtube.png', href: 'https://youtube.com/@dranjalicures' },
];

const FAQS = [
    {
        q: "Who is this course for?",
        a: "Anyone struggling with acid reflux or gut issues who wants a structured, natural plan with step-by-step guidance."
    },
    {
        q: "Do I need any prior knowledge?",
        a: "No. The course is beginner-friendly with simple frameworks, templates, and weekly actions."
    },
    {
        q: "How long do I get access?",
        a: "Lifetime access, including future updates and added resources."
    },
    {
        q: "Is there community or support?",
        a: "Yes. You get access to community Q&A and mentor support during the program windows."
    },
];


const WaitList: React.FC = () => {

    const [openIdx, setOpenIdx] = React.useState<number | null>(null);

    const toggle = (i: number) => {
        setOpenIdx(prev => (prev === i ? null : i));
    };

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
        <div className='w-screen h-[calc(100%-80px)] sm:h-[calc(100%-113px)] flex flex-col items-center overflow-x-hidden overflow-y-auto hide-scrollbar'>
            <div className='w-[95%] xl:w-[70%] h-auto py-[30px] flex flex-col'>

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
                        text-[46px] sm:text-[40px] md:text-[56px]
                        leading-tight sm:leading-snug md:leading-[1.2]
                        w-full sm:w-[80%] md:w-[65%]
                        text-center
                        "
                    >
                        Your Guide to getting rid of{" "}
                        <span className="text-[#0A5DBC]">Acid Reflux</span> in 30 days
                    </span>
                </div>

                <div className="w-full flex justify-center mt-3 sm:mt-[15px] text-[#787878] px-4">
                    <span
                        className="
                        text-[16px] sm:text-[16px] md:text-[18px]
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
                                w-full sm:w-[400px] md:w-[450px]
                                h-[76px] sm:h-[70px] md:h-[82px]
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
                                h-[76px] sm:h-[70px] md:h-[82px]
                                absolute top-0 right-2 sm:right-2 md:right-3
                            "
                        >
                            <button
                                className="
                                text-white bg-[#0A5DBC]
                                h-[50px] sm:h-[46px] md:h-[50px]
                                px-4 sm:px-[18px] md:px-[20px]
                                text-sm sm:text-[14px] font-normal
                                flex justify-center items-center
                                rounded-full shadow-md hover:bg-[#094c9a] transition
                                gap-2
                                "
                            >
                                <BsVectorPen className='w-[18px] h-[18px]' />
                                Join for Rs. 50
                            </button>
                        </div>
                    </div>
                </div>

                <div className="w-full flex justify-center mt-[10px]">
                    <div className="flex items-center gap-3">
                        {/* Overlapping avatars */}
                        <div className="flex items-center">
                            {/* Avatar 1 */}
                            <span className="relative inline-flex h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-yellow-400">
                                <img
                                    src="/t1.png"
                                    alt=""
                                    className="absolute h-[85%] w-[85%] inset-0 m-[3px] rounded-full object-cover ring-2 ring-white"
                                />
                            </span>
                            {/* Avatar 2 */}
                            <span className="relative inline-flex -ml-2 h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-cyan-400">
                                <img
                                    src="/t2.png"
                                    alt=""
                                    className="absolute h-[85%] w-[85%] inset-0 m-[3px] rounded-full object-cover ring-2 ring-white"
                                />
                            </span>
                            {/* Avatar 3 */}
                            <span className="relative inline-flex -ml-2 h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-red-500">
                                <img
                                    src="/t3.png"
                                    alt=""
                                    className="absolute h-[85%] w-[85%] inset-0 m-[3px] rounded-full object-cover ring-2 ring-white"
                                />
                            </span>
                        </div>

                        {/* Text */}
                        <span className="text-[#686868] text-[12px] sm:text-[14px] font-medium">
                            Trusted by 500+ patients
                        </span>
                    </div>
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
                            <CiStar className='w-[18px] h-[18px] fill-[#0A5DBC] stroke-1 stroke-[#0A5DBC]' />
                            <span className="text-[14px] sm:text-[15px] md:text-[16px] font-normal">
                                About
                            </span>
                        </div>

                        {/* Description */}
                        <div className="w-full mt-3 sm:mt-[15px] text-[#787878] px-4 sm:px-0">
                            <span
                                className="
                                block
                                text-[24px] sm:text-[24px] md:text-[36px]
                                font-semibold
                                leading-snug sm:leading-normal md:leading-[1.3]
                                 sm:text-left
                                "
                            >
                                Learn how to <span className='text-[#000]'>fix acid reflux naturally</span> with simple diet, lifestyle, and <span className='text-[#000]'>gut-healing strategies</span>. This course helps you find lasting relief <span className='text-[#000]'>without relying on medication</span>.
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
                            <RiApps2Line className='w-[18px] h-[18px] fill-[#0A5DBC]' />
                            <span className="text-[14px] sm:text-[15px] md:text-[16px] font-normal">
                                What you&apos;ll get
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
                                        {/* <span className="shrink-0 mt-0.5 text-[#094c9a] leading-none">✔</span> */}
                                        <IoCheckmark className='w-[18px] h-[18px] fill-[#0A5DBC] stroke-3 stroke-[#0A5DBC]' />

                                        {/* Text */}
                                        <span className="text-[#000] font-[500] leading-relaxed">
                                            {text}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col mt-[30px] w-full">
                            {/* Chip heading (optional, matches your style) */}
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
          mt-[30px]
        "
                            >
                                <FaQuestion className="w-[16px] h-[16px] fill-[#0A5DBC] stroke-1 stroke-[#0A5DBC]" />
                                <span className="text-[14px] sm:text-[15px] md:text-[16px] font-normal">FAQs</span>
                            </div>

                            {/* Grid like FEATURES */}
                            <div
                                className="
    grid grid-cols-1 sm:grid-cols-2
    gap-3 sm:gap-4 mt-[15px]
    items-start
  "
                                role="list"
                            >
                                {FAQS.map(({ q, a }, i) => {
                                    const isOpen = openIdx === i;
                                    return (
                                        <div
                                            key={q}
                                            role="listitem"
                                            className="rounded-[20px] border border-[#ECECEC] bg-white p-0 overflow-hidden self-start"

                                        >
                                            {/* Header button */}
                                            <button
                                                type="button"
                                                aria-expanded={isOpen}
                                                onClick={() => toggle(i)}
                                                className="
          w-full flex items-start gap-3 sm:gap-4
          p-4 sm:p-5
          text-left
        "
                                            >
                                                {/* Caret */}
                                                <span
                                                    className={`
            shrink-0 mt-1 inline-flex h-6 w-6 items-center justify-center
            rounded-full border border-[#ECECEC] bg-white
            transition-transform
            ${isOpen ? 'rotate-90' : 'rotate-0'}
          `}
                                                >
                                                    <CiPlay1 className="h-4 w-4" />
                                                </span>

                                                {/* Question text */}
                                                <span className="text-[#000] text-[15px] sm:text-[16px] md:text-[16px] font-[600] leading-snug">
                                                    {q}
                                                </span>
                                            </button>

                                            {/* Answer */}
                                            <div
                                                className={`
          transition-[max-height,opacity] duration-300 ease-out
          ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
        `}
                                            >
                                                <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-0">
                                                    <p className="text-[#787878] text-[14px] sm:text-[15px] leading-relaxed">
                                                        {a}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
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
                            <FaRegUserCircle className='w-[18px] h-[18px] fill-[#0A5DBC]' />
                            <span className="text-[14px] sm:text-[15px] md:text-[16px] font-normal">
                                Socials
                            </span>
                        </div>

                        <div className="w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-4 mt-[15px]">
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
            <div className="w-screen flex flex-col items-center justify-center py-[35px] shadow-[0px_2px_20px_0px_#2A2A2A0D] bg-[#F6F6F6] text-[#787878] border-t border-[#ECECEC]">
                @2025, Klub
            </div>
        </div>
    </div >
}

export default WaitList;