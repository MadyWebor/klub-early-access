'use client';

import React, { useEffect, useRef, useState } from 'react';

type ModalProps = {
  open: boolean;
  onClose: () => void;
  email: string;
  fullName: string;
  onConfirm: (fullName: string, email: string) => void; // pass data to parent
};

export default function ModalWaitlistConfirm({ open, onClose, email, fullName, onConfirm }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [localFullName, setLocalFullName] = useState(fullName);
  const [localEmail, setLocalEmail] = useState(email);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, [open]);

  // Update local state when props change
  useEffect(() => {
    setLocalFullName(fullName);
    setLocalEmail(email);
  }, [fullName, email]);

  const handleConfirm = () => {
    if (!localFullName && !localEmail) {
      setErrorMsg("Please enter your full name and email");
      return;
    } else if (!localFullName) {
      setErrorMsg("Please enter your full name");
      return;
    } else if (!localEmail) {
      setErrorMsg("Please enter your email");
      return;
    }

    setErrorMsg("");
    onConfirm(localFullName, localEmail); // pass data to parent
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <button
        onClick={onClose}
        aria-label="Close modal"
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />

      <div
        ref={dialogRef}
        className="relative z-[1] w-full max-w-[500px] rounded-[28px] bg-white shadow-[0_10px_40px_rgba(0,0,0,0.12)] px-6 py-8 sm:px-10 sm:py-12"
      >
        <h2 className="text-center font-semibold text-[24px] sm:text-[28px] md:text-[32px] leading-snug">
          Confirm Your Details
        </h2>

        <p className="mt-4 text-center text-sm sm:text-base text-neutral-600">
          Please confirm your email and full name before proceeding.
        </p>

        <div className="mt-6 flex flex-col gap-2">
          <input
            type="text"
            value={localFullName}
            onChange={(e) => setLocalFullName(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0A5DBC]"
            placeholder="Full Name"
          />
          <input
            type="email"
            value={localEmail}
            onChange={(e) => setLocalEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0A5DBC]"
            placeholder="Email"
          />
          {errorMsg && <p className="text-red-500 text-sm mt-1">{errorMsg}</p>}
        </div>

        <button
          onClick={handleConfirm}
          className="mt-6 w-full bg-[#0A5DBC] hover:bg-[#094c9a] text-white font-semibold py-3 rounded-lg shadow-md transition"
        >
          Proceed to Payment
        </button>
      </div>
    </div>
  );
}
