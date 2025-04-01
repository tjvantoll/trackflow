"use client";

import EventsDisplay from "@/components/EventsDisplay";
import Header from "@/components/Header";
import { useEffect, useState } from "react";

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

export default function Home() {
  const [events, setEvents] = useState<NotehubEvent[]>([]);
  const [eventCount, setEventCount] = useState(50);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEvents() {
      setIsLoading(true);
      setError(null);
      try {
        const timestamp = Date.now();
        const response = await fetch(
          `/api/events/${timestamp}?limit=${eventCount}`,
          {
            cache: "no-store",
            headers: {
              "Cache-Control": "no-cache",
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Error response:", errorData);
          throw new Error(errorData.error || "Failed to fetch events");
        }

        const data = await response.json();
        setEvents(data.events);
      } catch (err) {
        console.error("Error in fetchEvents:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch events");
      } finally {
        setIsLoading(false);
      }
    }

    fetchEvents();
  }, [eventCount]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex justify-end">
          <div className="relative inline-block text-left">
            <select
              id="eventCount"
              value={eventCount}
              onChange={(e) => {
                setEventCount(Number(e.target.value));
              }}
              className="appearance-none bg-white rounded-lg px-4 py-2 pr-8 text-sm text-gray-700 border border-gray-300 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
            >
              <option value={10}>10 events</option>
              <option value={25}>25 events</option>
              <option value={50}>50 events</option>
              <option value={100}>100 events</option>
              <option value={200}>200 events</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg
                className="fill-current h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
        </div>
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading events...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500">{error}</p>
          </div>
        ) : (
          <EventsDisplay events={events} />
        )}
      </main>
    </div>
  );
}
