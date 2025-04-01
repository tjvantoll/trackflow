"use client";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  Tooltip,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useState } from "react";
import { Slider } from "@mui/material";

interface NotehubEvent {
  event: string;
  file: string;
  captured: string;
  received: string;
  when: string;
  best_lat?: number;
  best_lon?: number;
  body: {
    temperature?: number;
    voltage?: number;
  };
}

interface EventMapProps {
  events: NotehubEvent[];
}

export default function EventMap({ events }: EventMapProps) {
  const [mapReady, setMapReady] = useState(false);

  // Find the earliest and latest timestamps
  const timestamps = events
    .map((event) => parseInt(event.when, 10))
    .sort((a, b) => a - b);
  const minTime = timestamps[0];
  const maxTime = timestamps[timestamps.length - 1];

  // State for the time range
  const [timeRange, setTimeRange] = useState<[number, number]>([
    minTime,
    maxTime,
  ]);

  useEffect(() => {
    // Initialize Leaflet icons
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "/marker-icon-2x.png",
      iconUrl: "/marker-icon.png",
      shadowUrl: "/marker-shadow.png",
    });
    setMapReady(true);
  }, []);

  // Sort events by timestamp in ascending order for the line
  const filteredEvents = [...events]
    .filter((event) => {
      const eventTime = parseInt(event.when, 10);
      return eventTime >= timeRange[0] && eventTime <= timeRange[1];
    })
    .sort((a, b) => parseInt(a.when, 10) - parseInt(b.when, 10));

  // Find center point from first event with valid coordinates
  const firstValidEvent = filteredEvents.find(
    (event) =>
      typeof event.best_lat === "number" && typeof event.best_lon === "number"
  );

  const center = firstValidEvent
    ? [firstValidEvent.best_lat, firstValidEvent.best_lon]
    : [0, 0];

  const customIcon = L.icon({
    iconUrl: "/marker-icon.png",
    iconRetinaUrl: "/marker-icon-2x.png",
    shadowUrl: "",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [0, 0],
    className: "rounded-lg",
  });

  // Create array of coordinates for the polyline
  const lineCoordinates = filteredEvents
    .filter(
      (event): event is NotehubEvent & { best_lat: number; best_lon: number } =>
        typeof event.best_lat === "number" && typeof event.best_lon === "number"
    )
    .map((event) => [event.best_lat, event.best_lon] as [number, number]);

  if (!mapReady) {
    return (
      <div className="h-[600px] w-full mb-8 rounded-lg overflow-hidden shadow-lg bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">Loading map...</p>
      </div>
    );
  }

  function formatTimestamp(timestamp: string) {
    const date = new Date(parseInt(timestamp, 10) * 1000);
    const dateStr = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const timeStr = date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    return { dateStr, timeStr };
  }

  function formatSliderLabel(value: number) {
    const { dateStr, timeStr } = formatTimestamp(value.toString());
    return `${dateStr} ${timeStr}`;
  }

  const handleTimeRangeChange = (
    _event: Event,
    value: number | number[],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _activeThumb: number
  ) => {
    setTimeRange(value as [number, number]);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
        <div className="mb-4 flex justify-between">
          <div className="text-left">
            <div className="text-sm font-medium text-gray-900">Start Time</div>
            <div className="text-sm text-gray-500">
              {formatSliderLabel(timeRange[0])}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-gray-900">End Time</div>
            <div className="text-sm text-gray-500">
              {formatSliderLabel(timeRange[1])}
            </div>
          </div>
        </div>
        <div className="px-2">
          <Slider
            value={timeRange}
            onChange={handleTimeRangeChange}
            min={minTime}
            max={maxTime}
            valueLabelDisplay="auto"
            valueLabelFormat={formatSliderLabel}
            sx={{
              color: "#3B82F6",
              "& .MuiSlider-thumb": {
                height: 24,
                width: 24,
                backgroundColor: "#fff",
                border: "2px solid #3B82F6",
                "&:focus, &:hover, &.Mui-active, &.Mui-focusVisible": {
                  boxShadow: "inherit",
                },
                "&:before": {
                  display: "none",
                },
              },
              "& .MuiSlider-track": {
                height: 4,
                borderRadius: 2,
              },
              "& .MuiSlider-rail": {
                height: 4,
                borderRadius: 2,
                backgroundColor: "#E5E7EB",
              },
            }}
          />
        </div>
      </div>
      <div className="h-[600px] w-full mb-8 rounded-lg overflow-hidden shadow-lg">
        <MapContainer
          center={center as [number, number]}
          zoom={14}
          style={{ height: "100%", width: "100%" }}
          className="z-0"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {/* Draw the connecting line */}
          <Polyline
            positions={lineCoordinates}
            color="#3B82F6"
            weight={3}
            opacity={0.6}
          />
          {filteredEvents.map((event, index) => {
            if (
              typeof event.best_lat === "number" &&
              typeof event.best_lon === "number"
            ) {
              const { dateStr, timeStr } = formatTimestamp(event.when);
              const isEndpoint =
                index === 0 || index === filteredEvents.length - 1;
              return (
                <Marker
                  key={event.event}
                  position={[event.best_lat, event.best_lon]}
                  icon={customIcon}
                >
                  <Tooltip
                    permanent
                    direction="top"
                    offset={[0, -45]}
                    className={`bg-white px-2 py-1 rounded shadow-sm border-0 text-sm font-medium ${
                      isEndpoint ? "font-bold" : ""
                    }`}
                  >
                    <div className="flex flex-col items-center gap-0.5">
                      <div>{dateStr}</div>
                      <div>{timeStr}</div>
                    </div>
                  </Tooltip>
                  <Popup className="rounded-lg shadow-lg">
                    <div className="p-2">
                      <ul className="text-sm space-y-1">
                        <li>
                          <span className="font-semibold">Latitude:</span>{" "}
                          {event.best_lat?.toFixed(6)}°
                        </li>
                        <li>
                          <span className="font-semibold">Longitude:</span>{" "}
                          {event.best_lon?.toFixed(6)}°
                        </li>
                        <li>
                          <span className="font-semibold">Time:</span> {dateStr}{" "}
                          {timeStr}
                        </li>
                        <li>
                          <span className="font-semibold">Temperature:</span>{" "}
                          {event.body.temperature?.toFixed(1)}°C
                        </li>
                        <li>
                          <span className="font-semibold">Voltage:</span>{" "}
                          {event.body.voltage?.toFixed(2)}V
                        </li>
                        <li>
                          <span className="font-semibold">Event:</span>{" "}
                          {event.event}
                        </li>
                      </ul>
                    </div>
                  </Popup>
                </Marker>
              );
            }
            return null;
          })}
        </MapContainer>
      </div>
    </div>
  );
}
