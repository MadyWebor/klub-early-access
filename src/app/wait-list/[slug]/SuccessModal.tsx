'use client';

import React, { useEffect, useRef } from 'react';

type Avatar = { src: string; alt?: string };

type ModalWaitlistProps = {
  open: boolean;
  onClose: () => void;
  highlightText?: string;    // "early-access waitlist"
  titlePrefix?: string;       // "You have been added to"
  body?: string;              // paragraph text
  caption?: string;           // little line under avatars
  avatars?: Avatar[];
};

export default function ModalWaitlist({
  open,
  onClose,
  highlightText = 'early-access waitlist',
  titlePrefix = 'You have been added to',
  body = "Thanks for being a part, you’ll be the first to have access when we are ready! Check your email inbox to know more",
  caption = "Turns out, you're not alone",
  avatars = [
    { src: '/t1.png', alt: 'Member 1' },
    { src: '/t2.png', alt: 'Member 2' },
    { src: '/t3.png', alt: 'Member 3' },
  ],
}: ModalWaitlistProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Lock body scroll while open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  // Close on ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      aria-labelledby="waitlist-title"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <button
        onClick={onClose}
        aria-label="Close modal"
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />

      {/* Card */}
      <div
        ref={dialogRef}
        className="
          relative z-[1] w-full max-w-[680px]
          rounded-[28px] bg-white shadow-[0_10px_40px_rgba(0,0,0,0.12)]
          px-6 py-8 sm:px-10 sm:py-12
        "
      >
        {/* Close (optional) */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 rounded-full p-2 hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-black/20"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>

        {/* Checkmark emblem */}
        <div className="mx-auto mb-6 sm:mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500 shadow-[0_6px_24px_rgba(16,185,129,0.45)]">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M20 6L9 17l-5-5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        {/* Title */}
        <h2
          id="waitlist-title"
          className="
            text-center font-semibold tracking-tight
            text-neutral-900
            text-[22px] leading-snug
            sm:text-[28px] md:text-[34px]
          "
        >
          {titlePrefix} <br className="hidden sm:block" />
          <span className="inline-block bg-gradient-to-b from-emerald-600 to-emerald-700 bg-clip-text text-transparent">
            {highlightText}
          </span>
        </h2>

        {/* Body */}
        <p className="mx-auto mt-4 max-w-[48ch] text-center text-sm leading-6 text-neutral-600 sm:text-base">
          {body}
        </p>

        {/* Avatars */}
        <div className="mt-6 flex items-center justify-center gap-2">
          {avatars.slice(0, 4).map((a, i) => (
            <img
              key={i}
              src={a.src}
              alt={a.alt ?? `Avatar ${i + 1}`}
              className="
                h-9 w-9 rounded-full ring-2 ring-white object-cover
                -ml-2 first:ml-0
              "
            />
          ))}
        </div>

        {/* Caption */}
        <p className="mt-3 text-center text-xs text-neutral-500">{caption}</p>
      </div>
    </div>
  );
}
