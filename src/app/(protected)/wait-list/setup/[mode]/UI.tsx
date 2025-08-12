'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';


type TickState = {
  1: { icon: string; status: string };
  2: { icon: string; status: string };
  3: { icon: string; status: string };
};

const base = { icon: '/tick.png', status: 'border-[#ECECEC] text-[#787878]' };
const chosen = { icon: '/tick-choosen.png', status: 'border-[#ECECEC] text-[#000000]' };
const done = { icon: '/tick-finish.png', status: 'border-[#0A5DBC] text-[#0A5DBC] bg-[#E6EFF8]' };

export default function WaitListSetup() {

    const router = useRouter();
  const params = useParams();
    // Normalize mode (string | string[] | undefined → string)
  const mode = useMemo(() => {
    const m = (params?.mode ?? '') as string | string[];
    return Array.isArray(m) ? m[0] : m;
  }, [params]);


  const [tick, setTick] = useState<TickState>({
    1: base,
    2: base,
    3: base,
  });

  // Recompute ticks *from scratch* whenever mode changes
  useEffect(() => {
    if (mode === 'course' || mode === '') {
      setTick({ 1: chosen, 2: base, 3: base });
    } else if (mode === 'content') {
      setTick({ 1: done, 2: chosen, 3: base });
    } else if (mode === 'price') {
      setTick({ 1: done, 2: done, 3: chosen });
    } else {
      setTick({ 1: base, 2: base, 3: base });
    }
  }, [mode]);

  return (
    <div className="w-full min-h-[100svh] flex flex-col bg-white">
      {/* Header (sticky, responsive height) */}
      <header className="sticky top-0 z-40 w-full border-b border-[#ECECEC] bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/70">
        <div className="mx-auto w-full max-w-[1200px] px-2 sm:px-4 lg:px-6">
          <div className="h-[72px] sm:h-[90px] lg:h-[114px] flex flex-wrap sm:flex-nowrap items-center justify-between gap-3">
            {/* Logo */}
            <div className="min-w-[70px] flex items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/klub-image.png" alt="klub" className="w-[75px] h-[30px]" />
            </div>

            {/* Title */}
            <div className="order-3 sm:order-none flex-1 min-w-0 flex justify-center">
              <span className="truncate text-center font-[500] text-[14px] sm:text-[18px] lg:text-[20px] text-[#000] leading-tight">
                Setup your <span className="text-[#0A5DBC]">Waitlist</span>
              </span>
            </div>

            {/* User Card */}
            <div className="flex items-center justify-end">
              <div className="bg-[#F6F6F6] border border-[#ECECEC] flex w-[150px] sm:w-[192px] h-[50px] sm:h-[60px] rounded-[20px] px-2">
                <div className="flex items-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/user.jpg"
                    alt="user"
                    className="rounded-full border-2 border-[#0A5DBC] w-[36px] h-[36px] sm:w-[45px] sm:h-[45px] object-cover"
                  />
                </div>
                <div className="flex items-center ml-2">
                  <div className="flex flex-col items-start leading-tight">
                    <span className="font-[500] text-[10px] sm:text-[14px]">Dr. Anjali Shah</span>
                    <span className="text-[#787878] text-[9px] sm:text-[12px]">@anjalishah</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 w-full flex justify-center pb-4">
        <div className="w-[92%] max-w-[1200px] flex flex-col md:flex-row gap-6 md:gap-8 mt-6">
          {/* Stepper: horizontal on mobile, vertical on md+ */}
          <nav
            aria-label="Progress"
            className="flex md:flex-col md:w-[220px] items-center md:items-start justify-center md:justify-start gap-3 md:gap-0"
          >
            {/* Row container (mobile) */}
            <div className="flex md:hidden w-full items-center justify-center gap-3">
              {/* Step 1 */}
              <button
                onClick={() => router.push('/wait-list/setup/course')}
                className={`flex items-center gap-2 py-1.5 px-3 border rounded-[15px] ${tick['1'].status}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={tick['1'].icon} className="w-[16px] h-[16px]" alt="" />
                <span className="font-[500] text-[12px]">Course</span>
              </button>

              <div className="h-[1px] w-6 border border-[#DADADA]" />

              {/* Step 2 */}
              <button
                onClick={() => router.push('/wait-list/setup/content')}
                className={`flex items-center gap-2 py-1.5 px-3 border rounded-[15px] ${tick['2'].status}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={tick['2'].icon} className="w-[16px] h-[16px]" alt="" />
                <span className="font-[500] text-[12px]">Content</span>
              </button>

              <div className="h-[1px] w-6 border border-[#DADADA]" />

              {/* Step 3 */}
              <button
                onClick={() => router.push('/wait-list/setup/price')}
                className={`flex items-center gap-2 py-1.5 px-3 border rounded-[15px] ${tick['3'].status}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={tick['3'].icon} className="w-[16px] h-[16px]" alt="" />
                <span className="font-[500] text-[12px]">Pricing</span>
              </button>
            </div>

            {/* Column container (md+) */}
            <div className="hidden md:flex md:flex-col md:items-start">
              {/* Step 1 */}
              <button
                onClick={() => router.push('/wait-list/setup/course')}
                className={`flex items-center gap-2 py-1.5 px-4 w-fit border rounded-[15px] ${tick['1'].status}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={tick['1'].icon} className="w-[18px] h-[18px]" alt="" />
                <span className="font-[500] text-[16px]">Course details</span>
              </button>
              <div className="border border-[#DADADA] w-0 h-[35px] ml-[30px]" />

              {/* Step 2 */}
              <button
                onClick={() => router.push('/wait-list/setup/content')}
                className={`flex items-center gap-2 py-1.5 px-4 w-fit border rounded-[15px] ${tick['2'].status}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={tick['2'].icon} className="w-[18px] h-[18px]" alt="" />
                <span className="font-[500] text-[16px]">Page Content</span>
              </button>
              <div className="border border-[#DADADA] w-0 h-[35px] ml-[30px]" />

              {/* Step 3 */}
              <button
                onClick={() => router.push('/wait-list/setup/price')}
                className={`flex items-center gap-2 py-1.5 px-4 w-fit border rounded-[15px] ${tick['3'].status}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={tick['3'].icon} className="w-[18px] h-[18px]" alt="" />
                <span className="font-[500] text-[16px]">Pricing</span>
              </button>
            </div>
          </nav>

          {/* Content Area */}
          <section className="flex-1 min-h-[420px] md:min-h-[520px] flex flex-col rounded-[16px]">
            {/* Your routed content goes here */}
            <div className="w-full flex-1 border border-[#ECECEC] rounded-[16px] overflow-y-auto overflow-x-hidden">
              {/* Replace this with your step content */}
            </div>

            {/* Footer actions (stick to bottom of section) */}
            <div className="w-full border-t border-[#ECECEC] pt-4 mt-4">
              <div className="flex items-center justify-end gap-2 sm:gap-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="w-[90px] sm:w-[113px] h-[40px] sm:h-[44px] border border-[#ECECEC] rounded-[15px] flex items-center justify-center text-[#787878] text-[14px] sm:text-[16px] font-[500] leading-[24px]"
                >
                  Go back
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/dashboard')}
                  className="w-[100px] sm:w-[126px] h-[40px] sm:h-[44px] bg-[#0A5DBC] rounded-[15px] flex items-center justify-center text-white text-[14px] sm:text-[16px] font-[500] leading-[24px]"
                >
                  Save & Next
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
