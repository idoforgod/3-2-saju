export default function Loading() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        <div className="h-64 bg-gray-200 rounded" />
        <div className="h-48 bg-gray-200 rounded" />
      </div>
    </div>
  );
}
