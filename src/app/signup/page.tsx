'use client';
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Signup() {

    const router = useRouter()
  return (
    <div className="w-full h-full min-h-screen flex flex-col items-center justify-center overflow-hidden bg-white">
      <div className="w-full max-w-[100vw] px-2 sm:px-6 md:px-8 lg:px-0 lg:w-[50%] h-full md:h-[80%] flex flex-col gap-8 md:gap-[48px] py-6 md:py-0">
        <div className="w-full flex justify-end">
          <div className="w-fit h-[34px] rounded-[10px] border border-[#D4E4F3] bg-[#E6EFF8] flex px-[10px] py-[5px] text-[#0A5DBC] gap-[6px]">
            <div className="flex flex-col items-center justify-center">
              <div className="w-[12px] h-[12px] rounded-full bg-[#0A5DBC]" />
            </div>
            <div className="flex flex-col items-center justify-center">
              <span className="text-[12px] font-medium">Early Access</span>
            </div>
          </div>
        </div>
        <div className="w-full h-full flex flex-col md:flex-row justify-between gap-4 md:gap-[24px]">
          {/* Left Side - Hides on mobile */}
          <div className="hidden md:flex w-[40%] h-auto rounded-[20px] bg-[url('/auth_image.jpg')] bg-cover flex-col items-center justify-center relative overflow-hidden">
            <div className="w-[80%] h-[90%] flex flex-col text-[#2A2A2A] relative py-6">
              <Image src={'/klub.png'} alt="klub" width={90} height={48} className="mt-[50px]" />
              <span className="text-white border-t border-white pt-3 mt-4 w-full max-w-[200px]">
                <span className="text-[18px] font-normal">
                  A Platform to <span className="font-semibold underline">Create</span>, <span className="font-semibold underline">Manage</span> & <span className="font-semibold underline">Monetize your Community</span>
                </span>
              </span>
              <span className="text-[#CBCBCB] absolute bottom-0 border-t border-[#CBCBCB] pt-3 w-full">
                <span className="text-[12px] font-medium">
                  All rights reserved @2025
                </span>
              </span>
            </div>
          </div>
          {/* Right Side */}
          <div className="w-full md:w-[60%] h-full md:h-full rounded-[20px] bg-[url('/papyrus.png')] flex flex-col items-center justify-center">
            <div className="w-[90%] md:w-[90%] h-[90%] md:h-[90%] flex flex-col text-[#2A2A2A] relative py-8 md:py-0">
              <span className="font-[600] text-[26px]">Let&apos;s <span className="text-[#0A5DBC]">Create your account</span></span>
              <span className="text-[16px] mt-[12px] w-[80%]">
                <span className="text-[#787878] font-[500]">The first step to setting up your early-access waitlist</span>
              </span>
              <div className="flex justify-center items-center w-full h-[48px] md:h-[50px] bg-white border border-[#ECECEC] mt-6 rounded-[15px] cursor-pointer hover:opacity-85 transition-all" onClick={()=>router.push('/profile')}>
                <div className="flex items-center mr-3">
                  <Image src={'/google.png'} alt="google" width={36} height={24} />
                </div>
                <span className="font-semibold text-[15px] md:text-[16px]">Continue with Google</span>
              </div>
              <span className="text-[#787878] mt-4">
                <span className="font-medium text-[13px] md:text-[14px]">Don’t have an account,{' '}
                  <Link href={'/signin'} className="text-[#0A5DBC] underline">Sign in</Link>
                </span>
              </span>
              <span className="text-[#787878] absolute bottom-0 left-0 w-full border-t border-[#DCDCDC] pt-6 bg-opacity-60">
                <span className="text-[12px] md:text-[14px] font-medium">
                  By Signing up with us, you agree to Klub’s{' '}
                  <span className="text-[#2A2A2A]">
                    <Link className='underline' href={''}>Terms of Service</Link> &{' '}
                    <Link className='underline' href={''}>Privacy Policy</Link>
                  </span>
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



