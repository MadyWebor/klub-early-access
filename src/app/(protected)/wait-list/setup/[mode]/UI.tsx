'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import CourseDetailsForm, { type CourseDetails } from './CourseDetailForm';
import ContentSection from './ContentForm';
import PriceSection from './PriseSection';

// stepper state
type TickState = {
  1: { icon: string; status: string };
  2: { icon: string; status: string };
  3: { icon: string; status: string };
};
const base = { icon: '/tick.png', status: 'border-[#ECECEC] text-[#787878]' };
const chosen = { icon: '/tick-choosen.png', status: 'border-[#ECECEC] text-[#000000]' };
const done = { icon: '/tick-finish.png', status: 'border-[#0A5DBC] text-[#0A5DBC] bg-[#E6EFF8]' };

// --- tiny helpers ---
async function jsonFetch<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const r = await fetch(input, { ...init, headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) } });
  const j = await r.json();
  if (!r.ok) throw new Error(j?.error?.message || j?.message || 'Request failed');
  return j as T;
}

// presign -> PUT -> commit, returns publicUrl
async function uploadImageForWaitlist(file: File, waitlistId: string): Promise<string> {
  // 1) presign
  const presign = await jsonFetch<{
    ok: true; uploadUrl: string; publicUrl: string; key: string; context: { target: 'waitlist.media'; kind: 'IMAGE' | 'VIDEO'; waitlistId: string }
  }>('/api/uploads/presign', {
    method: 'POST',
    body: JSON.stringify({ target: 'waitlist.media', kind: 'IMAGE', waitlistId, filename: file.name, contentType: file.type }),
  });

  // 2) PUT to S3
  const put = await fetch(presign.uploadUrl, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file });
  if (!put.ok) throw new Error('Upload failed');

  // 3) commit
  await jsonFetch<{ ok: true }>('/api/uploads/commit', {
    method: 'POST',
    body: JSON.stringify({
      key: presign.key,
      publicUrl: presign.publicUrl,
      target: presign.context.target,
      kind: presign.context.kind,
      waitlistId: presign.context.waitlistId,
    }),
  });

  return presign.publicUrl;
}

export default function WaitListSetupPage({name,image,handle}:{name:string | null;image:string|null;handle:string | null;}) {
  const router = useRouter();
  const params = useParams();

  // route mode
  const mode = useMemo(() => {
    const m = (params?.mode ?? '') as string | string[];
    const s = Array.isArray(m) ? m[0] : m;
    return s === 'content' || s === 'price' ? s : 'course';
  }, [params]);

  // stepper ticks
  const [tick, setTick] = useState<TickState>({ 1: base, 2: base, 3: base });
  useEffect(() => {
    if (mode === 'course') setTick({ 1: chosen, 2: base, 3: base });
    if (mode === 'content') setTick({ 1: done, 2: chosen, 3: base });
    if (mode === 'price') setTick({ 1: done, 2: done, 3: chosen });
  }, [mode]);


  return (
    <div className="w-full min-h-[100vh] flex flex-col bg-white">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full h-[72px] sm:h-[90px] lg:h-[114px] border-b border-[#ECECEC] bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/70">
        <div className="mx-auto w-full max-w-[1200px] px-2 sm:px-4 lg:px-6">
          <div className= "flex flex-wrap sm:flex-nowrap items-center justify-between gap-3">
            <div className="min-w-[70px] flex items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/klub-image.png" alt="klub" className="w-[75px] h-[30px]" />
            </div>
            <div className="order-3 sm:order-none flex-1 min-w-0 flex justify-center">
              <span className="truncate text-center font-[500] text-[14px] sm:text-[18px] lg:text-[20px] text-[#000] leading-tight">
                Setup your <span className="text-[#0A5DBC]">Waitlist</span>
              </span>
            </div>
            <div className="flex items-center justify-end">
              <div className="bg-[#F6F6F6] border border-[#ECECEC] flex w-[150px] sm:w-[192px] h-[50px] sm:h-[60px] rounded-[20px] px-2">
                <div className="flex items-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image || "/user.jpg"}
                    alt="user"
                    className="rounded-full border-2 border-[#0A5DBC] w-[36px] h-[36px] sm:w-[45px] sm:h-[45px] object-cover"
                  />
                </div>
                <div className="flex items-center ml-2">
                  <div className="flex flex-col items-start leading-tight">
                    <span className="font-[500] text-[10px] sm:text-[14px]">{name}</span>
                    <span className="text-[#787878] text-[9px] sm:text-[12px]">@{handle}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="w-full flex justify-center pb-4 h-[calc(100vh-72px)] sm:h-[calc(100vh-90px)] lg:h-[calc(100vh-114px)]">
        <div className="w-[92%] max-w-[1200px] h-[100%] flex flex-col md:flex-row gap-6 md:gap-8 mt-6">

          {/* Stepper */}
          <nav aria-label="Progress" className="flex md:flex-col md:w-[220px] items-center md:items-start justify-center md:justify-start gap-3 md:gap-0">
            {/* Mobile */}
            <div className="flex md:hidden w-full items-center justify-center gap-3">
              <button onClick={() => router.push('/wait-list/setup/course')}
                className={`flex items-center gap-2 py-1.5 px-3 border rounded-[15px] ${tick['1'].status}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={tick['1'].icon} className="w-[16px] h-[16px]" alt="" />
                <span className="font-[500] text-[12px]">Course</span>
              </button>
              <div className="h-[1px] w-6 border border-[#DADADA]" />
              <button onClick={() => router.push('/wait-list/setup/content')}
                className={`flex items-center gap-2 py-1.5 px-3 border rounded-[15px] ${tick['2'].status}`}>
                <img src={tick['2'].icon} className="w-[16px] h-[16px]" alt="" />
                <span className="font-[500] text-[12px]">Content</span>
              </button>
              <div className="h-[1px] w-6 border border-[#DADADA]" />
              <button onClick={() => router.push('/wait-list/setup/price')}
                className={`flex items-center gap-2 py-1.5 px-3 border rounded-[15px] ${tick['3'].status}`}>
                <img src={tick['3'].icon} className="w-[16px] h-[16px]" alt="" />
                <span className="font-[500] text-[12px]">Pricing</span>
              </button>
            </div>

            {/* Desktop */}
            <div className="hidden md:flex md:flex-col md:items-start">
              <button onClick={() => router.push('/wait-list/setup/course')}
                className={`flex items-center gap-2 py-1.5 px-4 w-fit border rounded-[15px] ${tick['1'].status}`}>
                <img src={tick['1'].icon} className="w-[18px] h-[18px]" alt="" />
                <span className="font-[500] text-[16px]">Course details</span>
              </button>
              <div className="border border-[#DADADA] w-0 h-[35px] ml-[30px]" />
              <button onClick={() => router.push('/wait-list/setup/content')}
                className={`flex items-center gap-2 py-1.5 px-4 w-fit border rounded-[15px] ${tick['2'].status}`}>
                <img src={tick['2'].icon} className="w-[18px] h-[18px]" alt="" />
                <span className="font-[500] text-[16px]">Page Content</span>
              </button>
              <div className="border border-[#DADADA] w-0 h-[35px] ml-[30px]" />
              <button onClick={() => router.push('/wait-list/setup/price')}
                className={`flex items-center gap-2 py-1.5 px-4 w-fit border rounded-[15px] ${tick['3'].status}`}>
                <img src={tick['3'].icon} className="w-[18px] h-[18px]" alt="" />
                <span className="font-[500] text-[16px]">Pricing</span>
              </button>
            </div>
          </nav>

          {/* Content Area */}
          <section className="w-full h-[calc(100%-24px)] flex flex-col rounded-[16px]">
              {mode === 'course' && (
                <CourseDetailsForm />
              )}
              {mode === 'content' && <ContentSection />}
              {
                mode === 'price' && <PriceSection />}
              
          </section>
        </div>
      </main>
    </div>
  );
}
