'use client';
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Profile () {

  const router = useRouter();
  

  return (
    <div className="w-full min-h-[100vh] bg-white flex items-center justify-center">
      <div className="w-[90%] max-w-[680px] px-3 sm:px-6 md:px-8 py-6 sm:py-8">
        {/* Top badge */}
        <div className="w-full flex justify-end">
          <div className="w-fit h-[34px] rounded-[10px] border border-[#D4E4F3] bg-[#E6EFF8] flex px-[10px] py-[5px] text-[#0A5DBC] gap-[6px]">
            <div className="flex items-center justify-center">
              <div className="w-[12px] h-[12px] rounded-full bg-[#0A5DBC]" />
            </div>
            <div className="flex items-center justify-center">
              <span className="text-[12px] font-medium">Early Access</span>
            </div>
          </div>
        </div>

        {/* Papyrus Container */}
        <div className="mt-6 w-full rounded-[20px] bg-[url('/papyrus.png')] bg-cover bg-center shadow-md">
          <div className="flex flex-col gap-4 sm:gap-5 p-4 sm:p-6 md:p-8 text-[#2A2A2A]">
            {/* Heading */}
            <div>
              <span className="font-semibold leading-tight text-[20px] sm:text-[22px] md:text-[26px]">
                Let&apos;s <span className="text-[#0A5DBC]">Setup your profile</span>
              </span>
              <p className="mt-2 sm:mt-3 text-[#787878] font-[500] text-[14px] sm:text-[15px] md:text-[16px]">
                Personalize how you will appear to people on Klub
              </p>
            </div>

            {/* Avatar + Edit */}
            <div className="w-full flex justify-center">
              <div className="relative w-[72px] h-[72px] sm:w-[85px] sm:h-[85px] border-2 rounded-[15px] border-[#000000] p-[2px] bg-white shadow">
                <div className="w-full h-full rounded-[15px] overflow-hidden">
                  <Image
                    src="/user.jpg"
                    alt="Profile"
                    width={240}
                    height={280}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* keeps button on-screen for narrow phones */}
                <button
                  type="button"
                  className="
                    absolute bottom-[-18px] right-1 sm:right-[-30px]
                    flex items-center gap-1 px-[8px] py-[4px]
                    bg-white rounded-[10px] border border-[#DADADA]
                    text-[12px] sm:text-[13px] md:text-[14px] font-medium
                    hover:bg-gray-100 transition shadow
                  "
                >
                  <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24" stroke="#fff" className="text-black">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L7.5 21H3v-4.5L16.732 3.732z" />
                  </svg>
                  Edit
                </button>
              </div>
            </div>

            {/* Form */}
            <form
              className="mt-6 sm:mt-7 flex flex-col gap-3 sm:gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                router.push('/wait-list/setup/course');
              }}
            >
              {/* Full name */}
              <div className="flex flex-col gap-1">
                <label className="text-[12px] sm:text-[13px] md:text-[14px] font-[500] text-[#444] opacity-60 mb-1" htmlFor="fullName">
                  Full name
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  className="
                    w-full h-[44px] sm:h-[46px]
                    bg-white rounded-[15px] indent-5
                    text-[14px] font-[500] text-[#2A2A2A]
                    border border-[#ECECEC] outline-none
                    focus:border-[#0A5DBC] transition
                  "
                />
              </div>

              {/* Username */}
              <div className="flex flex-col gap-1">
                <label className="text-[12px] sm:text-[13px] md:text-[14px] font-[500] text-[#444] opacity-60 mb-1" htmlFor="username">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Enter your username"
                  className="
                    w-full h-[44px] sm:h-[46px]
                    bg-white rounded-[15px] indent-5
                    text-[14px] font-[500] text-[#2A2A2A]
                    border border-[#ECECEC] outline-none
                    focus:border-[#0A5DBC] transition
                  "
                />
              </div>

              {/* Bio */}
              <div className="flex flex-col gap-1">
                <label className="text-[12px] sm:text-[13px] md:text-[14px] font-[500] text-[#444] opacity-60 mb-1" htmlFor="bio">
                  Enter your bio
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  placeholder="Tell us something about you"
                  className="
                    w-full h-[96px] sm:h-[110px]
                    py-[10px] bg-white rounded-[15px]
                    indent-5 text-[14px] font-[500] text-[#2A2A2A]
                    border border-[#ECECEC] outline-none
                    focus:border-[#0A5DBC] transition
                    resize-none
                  "
                />
              </div>

              {/* CTA */}
              <button
                className="mt-1 w-full h-[44px] sm:h-[46px] bg-[#0A5DBC] rounded-[15px] flex items-center justify-center"
                type="submit"
              >
                <span className="text-white font-[500] text-[15px] sm:text-[16px] leading-[24px]">Next</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
