export default function ProductsLoading() {
  return (
    <div className="max-w-[1200px] mx-auto px-5 py-10">
      <div className="h-8 w-40 bg-[#f5f5f7] rounded-xl animate-pulse mb-8" />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <div className="aspect-square bg-[#f5f5f7] rounded-2xl animate-pulse" />
            <div className="h-4 bg-[#f5f5f7] rounded-lg animate-pulse w-3/4" />
            <div className="h-4 bg-[#f5f5f7] rounded-lg animate-pulse w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}
