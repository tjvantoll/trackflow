import { FaLocationDot } from "react-icons/fa6";

export default function Header() {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center space-x-3">
          <FaLocationDot className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">TrackFlow</h1>
            <p className="text-sm text-gray-500">
              View tracking events from Notehub projects
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
