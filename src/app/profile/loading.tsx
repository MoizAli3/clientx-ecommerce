export default function ProfileLoading() {
  return (
    <div className="max-w-[900px] mx-auto px-5 py-10">
      <div className="h-8 w-44 bg-[#f5f5f7] rounded-xl animate-pulse mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-4">
          <div className="bg-white border border-[#d2d2d7] rounded-2xl p-5 flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-[#f5f5f7] animate-pulse" />
            <div className="h-4 w-28 bg-[#f5f5f7] rounded animate-pulse" />
            <div className="h-3 w-36 bg-[#f5f5f7] rounded animate-pulse" />
          </div>
          <div className="bg-white border border-[#d2d2d7] rounded-2xl h-40 animate-pulse" />
        </div>
        <div className="md:col-span-2">
          <div className="bg-white border border-[#d2d2d7] rounded-2xl h-80 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
