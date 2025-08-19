export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F6F6F6]">
      <div className="max-w-xl w-[92%] text-center bg-white border border-[#ECECEC] rounded-[24px] p-8 shadow-[0px_8px_16px_0px_#2A2A2A0D]">
        <h1 className="text-[28px] sm:text-[34px] font-semibold text-[#0A5DBC]">
          This waitlist isn’t available
        </h1>
        <p className="mt-3 text-[#787878]">
          The page you’re looking for doesn’t exist or isn’t published yet.
        </p>
      </div>
    </div>
  );
}
