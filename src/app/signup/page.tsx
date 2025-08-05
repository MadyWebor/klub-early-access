'use client';
import Image from "next/image";
import Link from "next/link";

export default function Signup() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center overflow-hidden">
      <div className="w-[90%] lg:w-[50%] h-[80%] flex flex-col gap-[48px]">
        <div className="w-full flex justify-end">
          <div className="w-[116px] h-[34px] rounded-[10px] border border-[#D4E4F3] bg-[#E6EFF8] flex px-[10px] py-[5px] text-[#0A5DBC] gap-[6px]">
            <div className="flex flex-col items-center justify-center">
              <div className="w-[12px] h-[12px] rounded-full bg-[#0A5DBC]"></div>
            </div>
            <div className="flex flex-col items-center justify-center">
              <span className="text-[12px] font-[500]">Early Access</span>
            </div>
          </div>
        </div>
        <div className="w-full h-full flex justify-between gap-[24px]">
          {/* Left Side */}
          <div className="w-[40%] h-full rounded-[20px]  bg-[url('/auth_image.jpg')] flex flex-col items-center justify-center bg-cover">
            <div className="w-[80%] h-[90%] flex flex-col text-[#2A2A2A] relative">
              <Image src={'/klub.png'} alt="google" width={110} height={60} className="mt-[50px]" />
              <span className="text-[#FFFFFF] border-t border-[#fff] pt-[12px] mt-[18px] w-[200px]">
                <span className="text-[18px] font-[400]">
                  A Platform to <span className="font-[600] underline">Create</span>, <span className="font-[600] underline">Manage</span> & <span className="font-[600] underline">Monetize your Community</span>
                </span>
              </span>
              <span className="text-[#CBCBCB] absolute bottom-0 border-t-1 border-[#CBCBCB] pt-[26px]">
                <span className="text-[12px] font-[500]">
                  All rights reserved @2025
                </span>
              </span>
            </div>
          </div>

          {/* Right Side */}
          <div className="w-[60%] h-full rounded-[20px] bg-[url('/papyrus.png')] bg-center flex flex-col items-center justify-center">
            <div className="w-[90%] h-[90%] flex flex-col text-[#2A2A2A] relative ">
              <span className="font-[600] text-[26px]">Let&apos;s <span className="text-[#0A5DBC]">Create your account</span></span>
              <span className="text-[16px] mt-[12px] w-[400px]">
                <span className="text-[#787878] font-[500]">The first step to setting up your early-access waitlist</span>
              </span>
              <div className="flex justify-center w-[100%] h-[50px] bg-[#FFFFFF] border border-[#ECECEC] mt-[26px] rounded-[15px] cursor-pointer hover:opacity-85">
                <div className="flex flex-col items-center justify-center">
                  <Image src={'/google.png'} alt="google" width={50} height={32} />
                </div>
                <div className="flex flex-col items-center justify-center">
                  <span className="font-[600] text-[16px]">Continue with google</span>
                </div>
              </div>
              <span className="text-[#787878] mt-[16px]">
                <span className="font-[500] text-[14px]">Already have an account, <Link href={'/signin'} className="text-[#0A5DBC] underline">Sign in</Link></span>
              </span>
              <span className="text-[#787878] absolute bottom-0 border-t-1 border-[#DCDCDC] pt-[26px]">
                <span className="text-[14px] font-[500]">
                  By Signing up with us, you agree to Klub’s <span className="text-[#2A2A2A]"><Link className='underline' href={''}>Terms of Service</Link> & <Link className='underline' href={''}>Privacy Policy</Link></span>
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
