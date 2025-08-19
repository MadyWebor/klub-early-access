'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { GoCopy } from "react-icons/go";
import { useRouter } from 'next/navigation';
import { signOut } from "next-auth/react";

// ──────────────────────────────────────────────────────────────
// Types matching the payload built in page.tsx
// ──────────────────────────────────────────────────────────────
type Money = { amount: number; currency: string; formatted: string };
type SubscriberRow = {
  id: string;
  fullName: string | null;
  email: string;
  status: 'LEAD' | 'PAID' | 'REFUNDED' | 'FAILED';
  createdAt: string;              // ISO
  price: Money | null;            // already formatted server-side
};
type Waitlist = {
  id: string;
  title: string | null;
  slug: string | null;
  publicUrl: string;
  thumbnailUrl: string | null;
  courseBio: string | null;
  about: string | null;
  bannerVideoUrl: string | null;
  price: Money | null;
  currency: string;
  launchDate: string | null;      // ISO or null
  buttonLabel: string | null;
  published: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  counts: { subscribers: number };
  subscribers: SubscriberRow[];
};
type DashboardPayload = {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    username: string | null;
    fullName: string | null;
    handle: string | null;
    bio: string | null;
    onboardingStatus: string;
    progress: { profileDone: boolean; courseDone: boolean; contentDone: boolean; priceDone: boolean };
  };
  waitlists: Waitlist[];
};

type Props = { initialData: DashboardPayload };

// Small helper
const fmtDateTime = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleString() : null;

// ──────────────────────────────────────────────────────────────

const Dashboard: React.FC<Props> = ({ initialData }) => {
  const router = useRouter();

  const [activeWaitlistId, setActiveWaitlistId] = useState<string | null>(
    initialData.waitlists[0]?.id ?? null
  );

  const current = useMemo<Waitlist | null>(() => {
    if (!activeWaitlistId) return null;
    return initialData.waitlists.find(w => w.id === activeWaitlistId) ?? null;
  }, [activeWaitlistId, initialData.waitlists]);

  // Local, editable subscriber list (for DELETE UX)
  const [subs, setSubs] = useState<SubscriberRow[]>(current?.subscribers ?? []);
  useEffect(() => {
    setSubs(current?.subscribers ?? []);
  }, [current?.id]); // refresh when switching waitlists

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => alert("Copied to clipboard!"))
      .catch((err) => console.error("Failed to copy: ", err));
  };

  const remove = async (id: string) => {
    const ok = confirm("Delete this subscriber?");
    if (!ok || !current) return;
    try {
      // If your API needs waitlistId, add ?waitlistId=current.id
      await fetch(`/api/subscribers/${id}`, { method: "DELETE", headers: { 'Content-Type': 'application/json' } });
      setSubs(s => s.filter(x => x.id !== id));
    } catch (e: any) {
      alert(e?.message || "Failed to delete");
    }
  };

  // ─────────── Empty states ───────────
  if (!current) {
    return (
      <div className="min-h-screen w-full bg-[#F6F6F6] flex items-center justify-center p-6">
        <div className="max-w-lg w-full bg-white border border-[#ECECEC] rounded-2xl p-6 text-center">
          <h2 className="text-xl font-semibold mb-2">No waitlists yet</h2>
          <p className="text-[#666] mb-4">Create your first waitlist to get started.</p>
          <button
            onClick={() => router.push('/wait-list/setup/course')}
            className="px-4 py-2 rounded-[12px] bg-[#0A5DBC] text-white font-medium"
          >
            Create waitlist
          </button>
        </div>
      </div>
    );
  }

  const publishedMeta = current.publishedAt ? fmtDateTime(current.publishedAt) : null;

  return (
    <div className='w-screen h-screen bg-[#F6F6F6] flex flex-col'>
      {/* Top bar */}
      <div className="w-full flex border border-[#ECECEC] h-[70px] sm:h-[80px] md:h-[85px] justify-center bg-white">
        <div className="w-[95%] sm:w-[90%] md:w-[85%] flex items-center justify-between">
          <div className="flex flex-col justify-center">
            <span className="text-[16px] sm:text-[18px] md:text-[20px] font-[600] hidden sm:block">Home</span>
            <span className="text-[20px] sm:text-[22px] font-[700] italic text-[#111] block sm:hidden">Klub</span>
          </div>

          {/* Waitlist switcher if multiple */}
          {initialData.waitlists.length > 1 && (
            <div className="flex items-center gap-2">
              <label className="text-sm text-[#666]">Waitlist:</label>
              <select
                className="border rounded-md px-2 py-1 text-sm"
                value={activeWaitlistId ?? ''}
                onChange={(e) => setActiveWaitlistId(e.target.value)}
              >
                {initialData.waitlists.map(w => (
                  <option key={w.id} value={w.id}>
                    {w.title || 'Untitled'} {w.published ? '• Published' : '• Draft'}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Main */}
      <div className="w-screen flex justify-center 
        mt-[40px] sm:mt-[50px] md:mt-[60px] 
        h-[calc(100%-60px-70px)] sm:h-[calc(100%-60px-80px)] md:h-[calc(100%-60px-85px)] px-2">

        <div className="flex flex-col w-full sm:w-[95%] md:w-[85%] lg:w-[60%] gap-[24px]">

          {/* Header card */}
          <div className="w-full border border-[#ECECEC] rounded-[30px] bg-[#fff] p-4 sm:p-6">
            <div className="w-full flex gap-4">
              <img
                className="h-[80px] w-[80px] sm:h-[100px] sm:w-[100px] border-2 border-[#0A5DBC] rounded-[20px] object-cover"
                src={current.thumbnailUrl || "/user.jpg"}
                alt="waitlist"
              />

              <div className="flex-1 flex flex-col justify-center sm:justify-between">
                {/* Title & Meta */}
                <div className="flex flex-col justify-center gap-2 text-[#000]">
                  <span className="text-[14px] sm:text-[16px] font-[600] leading-snug">
                    {current.title || "Untitled waitlist"}
                  </span>
                  <span className="text-[12px] sm:text-[14px] font-[500] text-[#787878]">
                    {current.published
                      ? `Published ${publishedMeta ?? ''}${publishedMeta ? ' | ' : ''}${current.price?.formatted ?? ''}`.trim()
                      : `Draft${current.price?.formatted ? ' | ' + current.price.formatted : ''}`}
                  </span>
                </div>

                {/* Actions */}
                <div className="justify-between gap-3 sm:gap-0 mt-4 sm:mt-0 hidden sm:flex">
                  <div className="flex flex-col justify-center items-center">
                    <span className="flex gap-2 text-[12px] sm:text-[14px] font-[500] break-all text-center sm:text-left">
                      {current.publicUrl}
                      <GoCopy onClick={() => copyToClipboard(current.publicUrl)} className="cursor-pointer" />
                    </span>
                  </div>
                  <div className="flex flex-col justify-center items-center">
                    <div className="flex gap-2">
                      <button
                        onClick={() => router.push('/wait-list/setup/course')}
                        className="border border-[#ECECEC] py-[8px] px-[12px] sm:py-[10px] sm:px-[15px] rounded-[15px] font-[500] text-[12px] sm:text-[14px]"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => router.push(current.publicUrl.replace(window.location.origin, ''))}
                        className="border border-[#0A5DBC] py-[8px] px-[12px] sm:py-[10px] sm:px-[15px] bg-[#0A5DBC] rounded-[15px] font-[500] text-[12px] sm:text-[14px] text-[#fff]"
                      >
                        Preview
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* mobile footer */}
            <div className="flex justify-between gap-3 sm:gap-0 mt-2 sm:hidden">
              <div className="flex flex-col justify-center items-center">
                <span className="text-[12px] flex gap-2 sm:text-[14px] font-[500] break-all text-center sm:text-left">
                  {current.publicUrl} <GoCopy onClick={() => copyToClipboard(current.publicUrl)} className="cursor-pointer" />
                </span>
              </div>
              <div className="flex flex-col justify-center items-center">
                <div className="flex gap-2">
                  <button
                    onClick={() => router.push('/wait-list/setup/course')}
                    className="border border-[#ECECEC] py-[8px] px-[12px] sm:py-[10px] sm:px-[15px] rounded-[15px] font-[500] text-[12px] sm:text-[14px]"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => router.push(current.publicUrl.replace(window.location.origin, ''))}
                    className="border border-[#0A5DBC] py-[8px] px-[12px] sm:py-[10px] sm:px-[15px] bg-[#0A5DBC] rounded-[15px] font-[500] text-[12px] sm:text-[14px] text-[#fff]"
                  >
                    Preview
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Subscribers table */}
          <div className="w-full rounded-t-[20px] rounded-b-[15px] h-[60%]">
            <div className="h-full flex flex-col overflow-hidden">
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-[14px] sm:text-[16px] font-[600] text-[#111]">
                  Subscribers ({current.counts.subscribers})
                </span>
              </div>

              {/* Table wrapper (scrollable) */}
              <div className="flex-1 overflow-auto">
                <div className="w-full overflow-x-auto rounded-t-[20px] rounded-b-[15px] border-[#ECECEC] border bg-white">

                  {subs.length === 0 ? (
                    <div className="py-10 text-center text-[#666]">No subscribers yet.</div>
                  ) : (
                    <table className="w-full text-sm sm:text-[15px]">
                      <thead className="bg-[#FFF] font-[500] sticky top-0 z-10 h-[70px]">
                        <tr className='rounded-t-[20px]'>
                          <th className="text-left font-semibold px-4 sm:px-6 py-6 sm:py-4 whitespace-nowrap">Full name</th>
                          <th className="text-left font-semibold px-4 sm:px-6 py-6 sm:py-4 whitespace-nowrap">Email</th>
                          <th className="text-left font-semibold px-4 sm:px-6 py-6 sm:py-4 whitespace-nowrap">Date</th>
                          <th className="text-left font-semibold px-4 sm:px-6 py-6 sm:py-4 whitespace-nowrap">Price</th>
                          <th className="text-left font-semibold px-4 sm:px-6 py-6 sm:py-4 whitespace-nowrap">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#EFEFEF]">
                        {subs.map((r) => (
                          <tr key={r.id} className="hover:bg-[#FAFAFA] text-[14px] sm:text-[16px] md:text-[18px] font-[500]">
                            <td className="px-4 sm:px-6 py-4 text-[#111] whitespace-nowrap">{r.fullName || "-"}</td>
                            <td className="px-4 sm:px-6 py-4 text-[#111]">
                              <span className="inline-block max-w-[200px] sm:max-w-[280px] lg:max-w-[360px] truncate align-middle">{r.email}</span>
                            </td>
                            <td className="px-4 sm:px-6 py-4 text-[#1b1a1a] whitespace-nowrap">{fmtDateTime(r.createdAt)}</td>
                            <td className="px-4 sm:px-6 py-4 text-[#111] whitespace-nowrap">{r.price?.formatted ?? "—"}</td>
                            <td className="px-4 sm:px-6 py-4">
                              <button
                                onClick={() => remove(r.id)}
                                className="rounded-[20px] bg-[#fff] border border-[#FFF] px-4 py-2 text-[13px] sm:text-[14px] text-[#EF4444]"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

              <div className="h-2 sm:h-3" />
            </div>
          </div>

          {/* Bottom bar */}
          <div className='w-full flex flex-col justify-center items-center h-[20%]'>
            <div className="flex items-center flex-wrap gap-3 sm:gap-4 rounded-[18px] border border-[#EFEFEF] bg-white px-4 sm:px-6 py-3 sm:py-4">
              <span className="text-[20px] sm:text-[22px] font-[700] italic text-[#111] hidden sm:block">Klub</span>
              <span className="hidden sm:block h-6 w-px bg-[#E7E7E8]" />
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <button className="inline-flex items-center gap-2 rounded-[12px] border px-3 py-2 sm:px-4 text-[14px] sm:text-[15px] border-[#0A5DBC] bg-[#EAF3FF] text-[#0A5DBC] hover:bg-[#E2EEFF] transition">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="3" width="7" height="7" rx="2" stroke="#0A5DBC" strokeWidth="1.7" />
                    <rect x="14" y="3" width="7" height="7" rx="2" stroke="#0A5DBC" strokeWidth="1.7" />
                    <rect x="3" y="14" width="7" height="7" rx="2" stroke="#0A5DBC" strokeWidth="1.7" />
                    <rect x="14" y="14" width="7" height="7" rx="2" stroke="#0A5DBC" strokeWidth="1.7" />
                  </svg>
                  Home
                </button>

                <button
                  className="inline-flex items-center gap-2 rounded-[12px] border px-3 py-2 sm:px-4 text-[14px] sm:text-[15px] border-[#ECECEC] bg-[#fff] text-[#666] hover:bg-[#EFEFF0] transition"
                  onClick={() => router.push('/profile')}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="8" r="4" stroke="#777" strokeWidth="1.7" />
                    <path d="M4 20c1.8-3.2 5-5 8-5s6.2 1.8 8 5" stroke="#777" strokeWidth="1.7" strokeLinecap="round" />
                  </svg>
                  Profile
                </button>
                <span className="hidden sm:block h-6 w-px bg-[#E7E7E8]" />

                <button
                  className="inline-flex items-center gap-2 rounded-[12px] border px-3 py-2 sm:px-4 text-[14px] sm:text-[15px] border-[#FFD3D7] text-[#E53935] bg-white hover:bg-[#FFF5F5] transition"
                  onClick={() => { document.cookie = "onboardingStatus=; Max-Age=0; path=/"; signOut({ callbackUrl: "/" }) }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M15 12H4" stroke="#E53935" strokeWidth="1.7" strokeLinecap="round" />
                    <path d="M11 8l4 4-4 4" stroke="#E53935" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M20 4v16" stroke="#E53935" strokeWidth="1.7" strokeLinecap="round" opacity=".2" />
                  </svg>
                  Log out
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
