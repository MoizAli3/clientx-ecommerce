export default function OrdersLoading() {
  return (
    <div className="max-w-[1200px] mx-auto px-5 py-10">
      <div className="h-8 w-36 bg-[#f5f5f7] rounded-xl animate-pulse mb-8" />
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="border border-[#d2d2d7] rounded-2xl p-5 bg-white">
            <div className="flex justify-between">
              <div className="space-y-2">
                <div className="h-3 w-28 bg-[#f5f5f7] rounded animate-pulse" />
                <div className="h-4 w-40 bg-[#f5f5f7] rounded animate-pulse" />
                <div className="h-3 w-24 bg-[#f5f5f7] rounded animate-pulse" />
              </div>
              <div className="h-6 w-20 bg-[#f5f5f7] rounded-full animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
