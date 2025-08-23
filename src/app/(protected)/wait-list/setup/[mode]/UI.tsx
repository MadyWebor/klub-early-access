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

export default function WaitListSetupPage({ name, image, handle, status }: { name: string | null; image: string | null; handle: string | null; status:string }) {
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
    <div className="w-screen h-screen flex flex-col bg-white">
      <header className="
        w-full 
        h-[72px] 
        sm:h-[90px] 
        lg:h-[114px] 
        border-b 
        border-[#ECECEC] 
        bg-white/95 
        flex
        justify-center
        backdrop-blur 
        supports-[backdrop-filter]:bg-white/70
      ">
        <div className='flex justify-between h-full w-full max-w-[1200px] px-4 sm:px-4 lg:px-6'>
          <div className="flex flex-col justify-center items-center">
            <img src="/klub-image.png" alt="klub" className="w-[45px] h-[20px] sm:w-[70px] sm:h-[25px]" />
          </div>

          <div className="flex flex-col justify-center items-center">
            <span className="truncate text-center font-[500] text-[12px] sm:text-[18px] lg:text-[20px] text-[#000] leading-tight">
              Setup your <span className="text-[#0A5DBC]">Waitlist</span>
            </span>
          </div>
          <div className="flex flex-col justify-center items-center">
            <div className="bg-[#F6F6F6] border border-[#ECECEC] flex rounded-[20px] p-[7px] sm:p-[10px]">
              <div className="flex items-center">
                <img
                  src={image || "/user.jpg"}
                  alt="user"
                  className="rounded-full border-2 border-[#0A5DBC] w-[20px] h-[20px] sm:w-[45px] sm:h-[45px] object-cover"
                />
              </div>
              <div className="flex items-center ml-2">
                <div className="flex flex-col items-start leading-tight">
                  <span className="font-[500] text-[8px] sm:text-[14px]">{name}</span>
                  <span className="text-[#787878] text-[8px] sm:text-[12px]">@{handle}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
      <main className="w-full flex justify-center h-[calc(100vh-72px)] sm:h-[calc(100vh-90px)] lg:h-[calc(100vh-114px)] overflow-hidden">
        <div className="w-full h-full max-w-[1200px] px-4 sm:px-4 lg:px-6 overflow-hidden">
          <div className='flex flex-col md:flex-row w-full h-[100%]'>
            <div className='md:w-[30%] w-full h-[50px] md:h-fit pt-5'>
              <nav aria-label="Progress" className="flex md:flex-col md:w-[220px] items-center md:items-start justify-center md:justify-start gap-3 md:gap-0">
                <div className="flex md:hidden w-full items-center justify-center gap-3">
                  <button onClick={() => router.push('/wait-list/setup/course')}
                    className={`flex items-center gap-1 py-1.5 px-2 border rounded-[10px] ${tick['1'].status}`}>
                    <img src={tick['1'].icon} className="w-[16px] h-[16px]" alt="" />
                    <span className="font-[500] text-[12px]">Course</span>
                  </button>
                  <div className="h-[1px] w-6 border border-[#DADADA]" />
                  <button onClick={() => router.push('/wait-list/setup/content')}
                    className={`flex items-center gap-1 py-1.5 px-2 border rounded-[10px] ${tick['2'].status}`}>
                    <img src={tick['2'].icon} className="w-[16px] h-[16px]" alt="" />
                    <span className="font-[500] text-[12px]">Content</span>
                  </button>
                  <div className="h-[1px] w-6 border border-[#DADADA]" />
                  <button onClick={() => router.push('/wait-list/setup/price')}
                    className={`flex items-center gap-1 py-1.5 px-2 border rounded-[10px] ${tick['3'].status}`}>
                    <img src={tick['3'].icon} className="w-[16px] h-[16px]" alt="" />
                    <span className="font-[500] text-[12px]">Pricing</span>
                  </button>
                </div>

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
            </div>


            <div className='md:w-[70%] w-full h-[calc(100%-50px)] md:h-full pt-5'>
                            {mode === 'course' && (
                <CourseDetailsForm status={status}/>
              )}
              {mode === 'content' && <ContentSection status={status}/>}
              {
                mode === 'price' && <PriceSection  status={status}/>}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
