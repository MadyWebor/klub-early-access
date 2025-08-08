'use client'

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';

const WaitListSetup: React.FC = () => {
    const { mode } = useParams();
    const [tick, setTick] = useState({
        1: { icon: '/tick.png', status: 'border-[#ECECEC] text-[#787878]' },
        2: { icon: '/tick.png', status: 'border-[#ECECEC] text-[#787878]' },
        3: { icon: '/tick.png', status: 'border-[#ECECEC] text-[#787878]' }
    })
    const router = useRouter();

    useEffect(() => {
        if (mode === 'course') {
            setTick({
                ...tick,
                1: { icon: '/tick-choosen.png', status: 'border-[#ECECEC] text-[#000000]' }
            })
        } else if (mode === 'content') {
            setTick({
                ...tick,
                1: { icon: '/tick-finish.png', status: 'border-[#0A5DBC] text-[#0A5DBC] bg-[#E6EFF8]' },
                2: { icon: '/tick-choosen.png', status: 'border-[#ECECEC] text-[#000000]' }
            })
        } else if (mode === 'price') {
            setTick({
                ...tick,
                1: { icon: '/tick-finish.png', status: 'border-[#0A5DBC] text-[#0A5DBC] bg-[#E6EFF8]' },
                2: { icon: '/tick-finish.png', status: 'border-[#0A5DBC] text-[#0A5DBC] bg-[#E6EFF8]' },
                3: { icon: '/tick-choosen.png', status: 'border-[#ECECEC] text-[#000000]' }
            })
        }
        // eslint-disable-next-line
    }, [mode]);

    return (
        <div className="w-full h-full flex flex-col overflow-hidden gap-6 sm:gap-8">
            {/* Header */}
            <div className="w-full flex justify-center border border-[#ECECEC] h-[90px] sm:h-[114px] px-2 sm:px-0">
                <div className="w-[95%  ] max-w-[1200px] h-full flex flex-wrap sm:flex-nowrap justify-between items-center gap-4 sm:gap-0">
                    {/* Logo */}
                    <div className="flex flex-col items-center justify-center min-w-[70px]">
                        <img src="/klub-image.png" alt="klub" className="w-[75px] h-[30px]" />
                    </div>
                    {/* Title */}
                    <div className="flex flex-col items-center justify-center flex-1 min-w-0 text-center">
                        <span className="font-[500] text-[14px] sm:text-[18px] lg:text-[20px] text-[#000] leading-tight">
                            Setup your <span className="text-[#0A5DBC]">Waitlist</span>
                        </span>
                    </div>
                    {/* User Card */}
                    <div className="flex flex-col items-center justify-center">
                        <div className="bg-[#F6F6F6] border border-[#ECECEC] flex w-[150px] sm:w-[192px] h-[50px] sm:h-[60px] rounded-[20px] px-2">
                            <div className="flex flex-col items-center justify-center">
                                <img src="/user.jpg" alt="user" className="rounded-full border-2 border-[#0A5DBC] w-[36px] h-[36px] sm:w-[45px] sm:h-[45px]" />
                            </div>
                            <div className="flex flex-col items-center justify-center ml-2">
                                <div className="flex flex-col items-start">
                                    <span className="font-[500] text-[10px] sm:text-[14px]">Dr. Anjali Shah</span>
                                    <span className="text-[#787878] text-[9px] sm:text-[12px]">anjalishah</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Section */}
            <div className="flex-1 w-full flex justify-center overflow-hidden pb-4">
                <div className="w-[90%] max-w-[1200px] flex flex-col md:flex-row gap-6 md:gap-0">
                    {/* Stepper */}
                    <div className="flex md:flex-col md:w-[220px] items-center md:items-start justify-center md:justify-start md:gap-0">
                        {/* Step 1 */}
                        <div
                            className={`flex gap-2 py-1.5 px-4 w-fit border rounded-[15px] ${tick['1'].status} cursor-pointer`}
                            onClick={() => router.push('/wait-list/setup/course')}
                        >
                            <img src={tick['1'].icon} className="w-[16px] h-[16px] sm:w-[18px] sm:h-[18px]" />
                            <span className="font-[500] text-[12px] sm:text-[16px]">Course details</span>
                        </div>
                        <div className="flex flex-col w-fit justify-center items-center">
                            <div className="border border-[#DADADA] w-[25px] h-0 md:w-0 md:h-[35px] md:ml-[30px]" />
                        </div>
                        {/* Step 2 */}
                        <div
                            className={`flex gap-2 py-1.5 px-4 w-fit border rounded-[15px] ${tick['2'].status} cursor-pointer`}
                            onClick={() => router.push('/wait-list/setup/content')}
                        >
                            <img src={tick['2'].icon} className="w-[14px] h-[14px] sm:w-[18px] sm:h-[18px]" />
                            <span className="font-[500] text-[12px] sm:text-[16px]">Page Content</span>
                        </div>
                        <div className="flex flex-col w-fit justify-center items-center">
                            <div className="border border-[#DADADA] w-[25px] h-0 md:w-0 md:h-[35px] md:ml-[30px]" />
                        </div>
                        {/* Step 3 */}
                        <div
                            className={`flex gap-2 py-1.5 px-4 w-fit border rounded-[15px] ${tick['3'].status} cursor-pointer`}
                            onClick={() => router.push('/wait-list/setup/price')}
                        >
                            <img src={tick['3'].icon} className="w-[14px] h-[14px] sm:w-[18px] sm:h-[18px]" />
                            <span className="font-[500] text-[12px] sm:text-[16px]">Pricing</span>
                        </div>
                    </div>
                    {/* Content Area */}
                    <div className="flex-1 w-full h-full md:w-auto overflow-hidden flex flex-col">
                        <div className="w-full border h-[90%] flex flex-col overflow-y-auto overflow-x-hidden"></div>
                        <div className="w-full h-[10%] flex justify-end border-t border-[#ECECEC] mt-auto pt-[30px]">
                            <div className="flex gap-2 sm:gap-4">
                                <button
                                    className="w-[90px] sm:w-[113px] h-[40px] sm:h-[44px] border border-[#ECECEC] rounded-[15px] flex items-center justify-center text-[#787878] text-[14px] sm:text-[16px] font-[500] leading-[24px]"
                                    type="button"
                                >
                                    Go back
                                </button>
                                <button
                                    className="w-[100px] sm:w-[126px] h-[40px] sm:h-[44px] bg-[#0A5DBC] rounded-[15px] flex items-center justify-center text-white text-[14px] sm:text-[16px] font-[500] leading-[24px]"
                                    type="submit"
                                >
                                    Save & Next
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default WaitListSetup;
