'use client';

import Image from 'next/image';
import Link from 'next/link';
import { signIn } from 'next-auth/react';

export default function Signin() {
  return (
    <div className='flex flex-col justify-center items-center w-screen h-screen'>
      <div className='flex-col flex w-[85%] sm:w-[70%] md:w-[80%] lg:w-[45%] h-[65%] sm:h-[70%] gap-4'>
        {/* Early Access Badge */}
        <div className='w-full flex justify-end'>
          <div className="w-fit h-[28px] rounded-[10px] border border-[#D4E4F3] bg-[#E6EFF8] flex px-[10px] py-[5px] text-[#0A5DBC] gap-[6px]">
            <div className="flex items-center justify-center">
              <div className="w-[12px] h-[12px] rounded-full bg-[#0A5DBC]" />
            </div>
            <div className="flex items-center justify-center">
              <span className="text-[12px] font-medium">Early Access</span>
            </div>
          </div>
        </div>
        {/* Early Access Badge */}

        {/* Content */}
        <div className='w-full h-full flex gap-4'>

          {/* Left Panel */}
          <div className='hidden md:flex flex-col h-full w-[40%]'>
             <div className="relative rounded-[20px] overflow-hidden bg-[url('/auth_image.jpg')] bg-cover bg-center h-full">
              <div className="absolute inset-0 p-6 md:p-8 lg:p-10 flex flex-col text-[#2A2A2A]">
                <Image src="/klub.png" alt="klub" width={90} height={48} className="mt-[50px]" />
                <span className="text-white border-t border-white pt-3 mt-4 w-full max-w-[260px]">
                  <span className="text-[18px] leading-6">
                    A Platform to <span className="font-semibold underline">Create</span>,{' '}
                    <span className="font-semibold underline">Manage</span> &{' '}
                    <span className="font-semibold underline">Monetize your Community</span>
                  </span>
                </span>
                <span className="text-[#CBCBCB] mt-auto border-t border-[#CBCBCB] pt-3">
                  <span className="text-[12px] font-medium">All rights reserved @2025</span>
                </span>
              </div>
            </div>
          </div>
          {/* Left Panel */}

          {/* Right Panel */}
          <div className='flex flex-col h-full w-full md:w-[60%]'>
            <div className="rounded-[20px] bg-[url('/papyrus.png')] bg-contain h-full">
              <div className="flex flex-col h-full p-5 sm:p-6 md:p-8">
                <div>
                  <span className="font-semibold text-[20px] sm:text-[22px] md:text-[26px] leading-tight">
                    <span className="text-[#0A5DBC]">Sign in </span>to your account
                  </span>
                  <p className="text-[14px] sm:text-[15px] md:text-[16px] mt-2 max-w-[48ch] text-[#787878] font-medium">
                    Welcome!
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                  className="mt-6 h-[48px] sm:h-[50px] w-full bg-white border border-[#ECECEC] rounded-[15px] flex items-center justify-center gap-3 hover:opacity-85 transition"
                >
                  <Image src="/google.png" alt="google" width={24} height={24} />
                  <span className="font-semibold text-[15px] sm:text-[16px] text-[#2A2A2A]">
                    Continue with Google
                  </span>
                </button>

                <p className="text-[#787878] mt-4">
                  <span className="font-medium text-[13px] sm:text-[14px]">
                    Don’t have an account,{' '}
                    <Link href="/signup" className="text-[#0A5DBC] underline">
                      Sign up
                    </Link>
                  </span>
                </p>

                <div className="mt-auto pt-5 sm:pt-6 border-t border-[#DCDCDC]">
                  <p className="text-[12px] sm:text-[13px] md:text-[14px] font-medium text-[#787878]">
                    By Signing up with us, you agree to Klub’s{' '}
                    <span className="text-[#2A2A2A]">
                      <Link className="underline" href="">
                        Terms of Service
                      </Link>{' '}
                      &{' '}
                      <Link className="underline" href="">
                        Privacy Policy
                      </Link>
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
          {/* Right Panel */}

        </div>
        {/* Content */}
      </div>
    </div>
  );
}
