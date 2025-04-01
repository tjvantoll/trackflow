"use client";

import dynamic from "next/dynamic";
import { formatDate } from "@/lib/utils";

interface NotehubEvent {
  uid: string;
  file: string;
  captured: string;
  received: string;
  when: string;
  best_lat?: number;
  best_lon?: number;
  best_location?: string;
  best_country?: string;
  best_timezone?: string;
  body: {
    voltage?: number;
    temperature?: number;
    when?: string;
    time?: string;
  };
}

// Import EventMap dynamically to avoid SSR issues with Leaflet
const EventMap = dynamic(() => import("./EventMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] w-full mb-8 rounded-lg overflow-hidden shadow-lg bg-gray-100 flex items-center justify-center">
      <p className="text-gray-500">Loading map...</p>
    </div>
  ),
});

function getEventTime(event: NotehubEvent): string {
  // Try to find the timestamp in various places
  const whenInBody = event.body.when;
  const timeInBody = event.body.time;

  if (typeof whenInBody === "string") return whenInBody;
  if (typeof timeInBody === "string") return timeInBody;
  if (event.when) return event.when;
  return event.captured;
}

interface EventsDisplayProps {
  events: NotehubEvent[];
}

export default function EventsDisplay({ events }: EventsDisplayProps) {
  // Sort events by when timestamp in descending order
  const sortedEvents = [...events].sort((a, b) => {
    const timeA = parseInt(getEventTime(a)) || 0;
    const timeB = parseInt(getEventTime(b)) || 0;
    return timeB - timeA;
  });

  if (events.length === 0) {
    return (
      <p className="text-gray-500">
        No events found. Make sure your Notehub credentials are properly
        configured.
      </p>
    );
  }

  return (
    <>
      <EventMap events={sortedEvents} />

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow rounded-lg">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                When
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Voltage
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Temperature
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Latitude
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Longitude
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedEvents.map((event) => (
              <tr key={event.uid} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(getEventTime(event))}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {typeof event.body.voltage === "number"
                    ? event.body.voltage.toFixed(2) + "V"
                    : "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {typeof event.body.temperature === "number"
                    ? event.body.temperature.toFixed(1) + "°C"
                    : "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {typeof event.best_lat === "number"
                    ? event.best_lat.toFixed(6)
                    : "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {typeof event.best_lon === "number"
                    ? event.best_lon.toFixed(6)
                    : "N/A"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
