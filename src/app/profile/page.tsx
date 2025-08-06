'use client';
import Image from "next/image";
import { useRouter } from "next/navigation";
export default function Profile() {
  const router = useRouter()
  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="w-full flex flex-col items-center justify-center px-2 sm:px-6 md:px-8 py-8">
        <div className="w-full max-w-[600px] flex flex-col gap-6 items-center">
          {/* Top badge */}
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

          {/* Papyrus Container */}
          <div className="w-full bg-[url('/papyrus.png')] rounded-[20px] flex flex-col items-center shadow-md py-8 px-3 sm:px-6">
            <div className="w-full flex flex-col text-[#2A2A2A]">
              <span className="font-semibold text-[22px] sm:text-[26px]">
                Let&apos;s <span className="text-[#0A5DBC]">Setup your profile</span>
              </span>
              <span className="text-[15px] sm:text-[16px] mt-3 w-full">
                <span className="text-[#787878] font-[500]">Personalize how you will appear to people on Klub</span>
              </span>
              <div className="w-full flex justify-center my-7">
                <div className="relative w-[72px] sm:w-[85px] h-[72px] sm:h-[85px] border-2 rounded-[15px] border-[#000000] p-[2px] bg-white shadow">
                  {/* Profile Image */}
                  <div className="w-full h-full rounded-[15px] overflow-hidden">
                    <Image
                      src="/user.jpg"
                      alt="Profile"
                      width={240}
                      height={280}
                      className="object-cover w-full h-full"
                    />
                  </div>

                  {/* Edit Button */}
                  <button
                    className="
                      flex items-center gap-1 px-[8px] py-[4px]
                      bg-white rounded-[10px] border border-[#DADADA]
                      absolute right-[-30px] bottom-[-18px]
                      text-[13px] sm:text-[14px] font-medium
                      hover:bg-gray-100 transition
                      shadow
                    "
                  >
                    <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24" stroke="#fff" className="text-black">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L7.5 21H3v-4.5L16.732 3.732z" />
                    </svg>
                    Edit
                  </button>
                </div>
              </div>
              <form className="w-full flex flex-col gap-3" onSubmit={(e)=>{
                e.preventDefault();
                router.push('/wait-list/setup/course')
                }}>
                <div className="flex flex-col gap-1">
                  <label className="text-[13px] sm:text-[14px] font-[500] text-[#444] opacity-60 mb-1" htmlFor="fullName">
                    Full name
                  </label>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    className="
                      w-full
                      h-[44px]
                      bg-white
                      rounded-[15px]
                      indent-5
                      text-[14px] font-[500]
                      text-[#2A2A2A]
                      border border-[#ECECEC]
                      outline-none
                      focus:border-[#0A5DBC]
                      transition
                    "
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[13px] sm:text-[14px] font-[500] text-[#444] opacity-60 mb-1" htmlFor="username">
                    Username
                  </label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="Enter your username"
                    className="
                      w-full
                      h-[44px]
                      bg-white
                      rounded-[15px]
                      indent-5
                      text-[14px] font-[500]
                      text-[#2A2A2A]
                      border border-[#ECECEC]
                      outline-none
                      focus:border-[#0A5DBC]
                      transition
                    "
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[13px] sm:text-[14px] font-[500] text-[#444] opacity-60 mb-1" htmlFor="bio">
                    Enter your bio
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    placeholder="Tell us something about you"
                    className="
                      w-full
                      h-[90px] sm:h-[100px]
                      py-[10px]
                      bg-white
                      rounded-[15px]
                      indent-5
                      text-[14px] font-[500]
                      text-[#2A2A2A]
                      border border-[#ECECEC]
                      outline-none
                      focus:border-[#0A5DBC]
                      transition
                      resize-none
                    "
                  />
                </div>
                <button
                  className="w-full h-[44px] bg-[#0A5DBC] rounded-[15px] flex items-center justify-center mt-1"
                  type="submit"
                >
                  <span className="text-white font-[500] text-[16px] leading-[24px]">Next</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
