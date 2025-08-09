'use client'
import React from 'react';
import { GoCopy } from "react-icons/go";
import { useRouter } from 'next/navigation';

const Dashboard: React.FC = () => {

    const router = useRouter();

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
            .then(() => {
                alert("Copied to clipboard!");
            })
            .catch((err) => {
                console.error("Failed to copy: ", err);
            });
    };
    return <div className='w-screen h-screen bg-[#F6F6F6] flex flex-col'>
        <div className="w-full flex border border-[#ECECEC] h-[70px] sm:h-[80px] md:h-[85px] justify-center">
            <div className="w-[95%] sm:w-[90%] md:w-[85%] flex">
                <div className="flex flex-col justify-center w-full">
                    <span className="text-[16px] sm:text-[18px] md:text-[20px] font-[600] hidden sm:block">
                        Home
                    </span>
                    <span className="text-[20px] sm:text-[22px] font-[700] italic text-[#111] block sm:hidden">
                        Klub
                    </span>
                </div>
            </div>
        </div>
        <div className="w-screen flex justify-center 
            mt-[40px] sm:mt-[50px] md:mt-[60px] 
            h-[calc(100%-60px-70px)] sm:h-[calc(100%-60px-80px)] md:h-[calc(100%-60px-85px)] px-2">

            <div className="flex flex-col w-full sm:w-[95%] md:w-[85%] lg:w-[60%] gap-[24px]">

                <div className="w-full border border-[#ECECEC] rounded-[30px] bg-[#fff] p-4 sm:p-6] ">

                    <div className="w-full flex  gap-4">
                        {/* Image */}
                        <img
                            className="h-[80px] w-[80px] sm:h-[100px] sm:w-[100px] border-2 border-[#0A5DBC] rounded-[20px] object-cover"
                            src="/user.jpg"
                            alt="user"
                        />

                        {/* Content */}
                        <div className="flex-1 flex flex-col justify-center sm:justify-between">
                            {/* Title & Meta */}
                            <div className="flex flex-col justify-center gap-2 text-[#000]">
                                <span className="text-[14px] sm:text-[16px] font-[600] leading-snug">
                                    Your guide to getting rid of Acid Reflux in 30 days
                                </span>
                                <span className="text-[12px] sm:text-[14px] font-[500] text-[#787878]">
                                    Published Aug, 13th, 2024, 9:00 PM | Rs. 49
                                </span>
                            </div>

                            {/* Footer Actions */}
                            <div className="justify-between gap-3 sm:gap-0 mt-4 sm:mt-0 hidden sm:flex">
                                <div className="flex flex-col justify-center items-center">
                                    <span className="flex gap-2 text-[12px] sm:text-[14px] font-[500] break-all text-center sm:text-left">
                                        klub.it.com/w/fitwithdranjali <GoCopy onClick={() => copyToClipboard(`${window.location.origin}/wait-list/7hi900`)} />
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
                                            onClick={() => router.push('/wait-list/799njj')}
                                            className="border border-[#0A5DBC] py-[8px] px-[12px] sm:py-[10px] sm:px-[15px] bg-[#0A5DBC] rounded-[15px] font-[500] text-[12px] sm:text-[14px] text-[#fff]"
                                        >
                                            Preview
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-between gap-3 sm:gap-0 mt-2 sm:hidden">
                        <div className="flex flex-col justify-center items-center">
                            <span className="text-[12px] flex gap-2 sm:text-[14px] font-[500] break-all text-center sm:text-left">
                                klub.it.com/w/fitwithdranjali <GoCopy onClick={() => copyToClipboard(`${window.location.origin}/wait-list/7hi900`)} />
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
                                    onClick={() => router.push('/wait-list/799njj')}

                                    className="border border-[#0A5DBC] py-[8px] px-[12px] sm:py-[10px] sm:px-[15px] bg-[#0A5DBC] rounded-[15px] font-[500] text-[12px] sm:text-[14px] text-[#fff]"
                                >
                                    Preview
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="w-full rounded-t-[20px] rounded-b-[15px] h-[60%]">
                    <div className="h-full flex flex-col overflow-hidden">
                        {/* Table wrapper (adds horizontal scroll on mobile) */}
                        <div className="flex-1 overflow-auto">
                            <div className="w-full overflow-x-auto rounded-t-[20px] rounded-b-[15px] border-[#ECECEC] border">
                                <table className="w-full text-sm sm:text-[15px]">
                                    <thead className="bg-[#FFF] font-[500] sticky top-0 z-10 h-[70px]">
                                        <tr className='rounded-t-[20px]'>
                                            <th className="text-left font-semibold px-4 sm:px-6 py-6 sm:py-4 whitespace-nowrap">
                                                Full name
                                            </th>
                                            <th className="text-left font-semibold px-4 sm:px-6 py-6 sm:py-4 whitespace-nowrap">
                                                Email
                                            </th>
                                            <th className="text-left font-semibold px-4 sm:px-6 py-6 sm:py-4 whitespace-nowrap">
                                                Date
                                            </th>
                                            <th className="text-left font-semibold px-4 sm:px-6 py-6 sm:py-4 whitespace-nowrap">
                                                Price
                                            </th>
                                            <th className="text-left font-semibold px-4 sm:px-6 py-6 sm:py-4 whitespace-nowrap">
                                                Action
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-[#EFEFEF]">
                                        {/* Row */}
                                        {[
                                            {
                                                name: "Maheep Kapoor",
                                                email: "Maheepkapoor087@gmail.com",
                                                date: "Aug 14, 2025, 12:03 PM",
                                                price: "Rs. 49",
                                            },
                                            {
                                                name: "Rahul Sehgal",
                                                email: "sehgalrahul223@gmail.com",
                                                date: "Aug 14, 2025, 12:12 PM",
                                                price: "Rs. 49",
                                            },
                                            {
                                                name: "Maheep Kapoor",
                                                email: "Maheepkapoor087@gmail.com",
                                                date: "Aug 14, 2025, 12:03 PM",
                                                price: "Rs. 49",
                                            },
                                        ].map((r, i) => (
                                            <tr key={i} className="hover:bg-[#FAFAFA] text-[14px] sm:text-[16px] md:text-[18px] font-[500]">
                                                <td className="px-4 sm:px-6 py-4 text-[#111] whitespace-nowrap">
                                                    {r.name}
                                                </td>
                                                <td className="px-4 sm:px-6 py-4 text-[#111]">
                                                    <span className="inline-block max-w-[200px] sm:max-w-[280px] lg:max-w-[360px] truncate align-middle">
                                                        {r.email}
                                                    </span>
                                                </td>
                                                <td className="px-4 sm:px-6 py-4 text-[#1b1a1a] whitespace-nowrap">
                                                    {r.date}
                                                </td>
                                                <td className="px-4 sm:px-6 py-4 text-[#111] whitespace-nowrap">
                                                    {r.price}
                                                </td>
                                                <td className="px-4 sm:px-6 py-4">
                                                    <button className="rounded-[20px] bg-[#fff] border border-[#FFF] px-4 py-2 text-[13px] sm:text-[14px] text-[#EF4444]">
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Optional bottom padding for aesthetics on short lists */}
                        <div className="h-2 sm:h-3" />
                    </div>
                </div>


                <div className='w-full flex flex-col justify-center items-center h-[20%]'>
                    <div
                        className="
      flex items-center flex-wrap gap-3 sm:gap-4
      rounded-[18px] border border-[#EFEFEF] bg-white
      px-4 sm:px-6 py-3 sm:py-4
    "
                    >
                        {/* Brand */}
                        <span className="text-[20px] sm:text-[22px] font-[700] italic text-[#111] hidden sm:block">
                            Klub
                        </span>

                        {/* Divider */}
                        <span className="hidden sm:block h-6 w-px bg-[#E7E7E8]" />

                        {/* Actions */}
                        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                            {/* Home (active) */}
                            <button
                                className="
          inline-flex items-center gap-2
          rounded-[12px] border
          px-3 py-2 sm:px-4
          text-[14px] sm:text-[15px]
          border-[#0A5DBC] bg-[#EAF3FF] text-[#0A5DBC]
          hover:bg-[#E2EEFF] transition
        "
                            >
                                {/* icon: grid/app */}
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                    <rect x="3" y="3" width="7" height="7" rx="2" stroke="#0A5DBC" strokeWidth="1.7" />
                                    <rect x="14" y="3" width="7" height="7" rx="2" stroke="#0A5DBC" strokeWidth="1.7" />
                                    <rect x="3" y="14" width="7" height="7" rx="2" stroke="#0A5DBC" strokeWidth="1.7" />
                                    <rect x="14" y="14" width="7" height="7" rx="2" stroke="#0A5DBC" strokeWidth="1.7" />
                                </svg>
                                Home
                            </button>

                            {/* Profile (neutral) */}
                            <button
                                className="
          inline-flex items-center gap-2
          rounded-[12px] border
          px-3 py-2 sm:px-4
          text-[14px] sm:text-[15px]
          border-[#ECECEC] bg-[#fff] text-[#666]
          hover:bg-[#EFEFF0] transition
        "
                                onClick={() => router.push('/profile')}

                            >
                                {/* icon: user circle */}
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                    <circle cx="12" cy="8" r="4" stroke="#777" strokeWidth="1.7" />
                                    <path d="M4 20c1.8-3.2 5-5 8-5s6.2 1.8 8 5" stroke="#777" strokeWidth="1.7" strokeLinecap="round" />
                                </svg>
                                Profile
                            </button>
                            <span className="hidden sm:block h-6 w-px bg-[#E7E7E8]" />

                            {/* Logout (danger) */}
                            <button
                                className="
          inline-flex items-center gap-2
          rounded-[12px] border
          px-3 py-2 sm:px-4
          text-[14px] sm:text-[15px]
          border-[#FFD3D7] text-[#E53935] bg-white
          hover:bg-[#FFF5F5] transition
        "
                                onClick={() => router.push('/signin')}
                            >
                                {/* icon: sign-out arrow */}
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
}

export default Dashboard;