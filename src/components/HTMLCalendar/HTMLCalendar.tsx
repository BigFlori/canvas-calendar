import dayjs from "dayjs";
import React, { useRef, useState } from "react";
import { Booking, DateRange, Group } from "../../types/types";
import { CALENDAR } from "../../constants";
import { HTMLGroupContainer } from "./HTMLGroupContainer";
import { HTMLGridContainer } from "./HTMLGridContainer";

interface CalendarProps {
  bookings: Booking[];
  groups: Group[];
  onAddBooking: (groupId: string, date: dayjs.Dayjs) => void;
}

export const HTMLCalendar: React.FC<CalendarProps> = ({ bookings, groups }) => {
  const today = dayjs().startOf("day");
  const GROUP_HEIGHT = CALENDAR.GRID_HEIGHT * groups.length;

  const [renderRange, setRenderRange] = useState<DateRange>({
    startDate: today.subtract(3, "month"),
    endDate: today.add(9, "month"),
  });
  const [scrollPosition, setScrollPosition] = useState({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="bg-gray-200 relative w-full flex text-black" ref={containerRef}>
      {/* Header Filter */}
      <a
        style={{ height: CALENDAR.HEADER_HEIGHT, width: CALENDAR.GROUP_WIDTH }}
        className="bg-white p-2 border-b border-r border-gray-300 shadow z-10"
      >
        Szűrő
      </a>

      {/* Groups Column */}
      <div
        style={{
          height: GROUP_HEIGHT,
          width: CALENDAR.GROUP_WIDTH,
          top: CALENDAR.HEADER_HEIGHT,
        }}
        className="bg-gray-200 absolute left-0 cursor-pointer"
      >
        <HTMLGroupContainer groups={groups} />
      </div>

      {/* Calendar Grid */}
      <div
        style={{
          left: CALENDAR.GROUP_WIDTH,
          top: CALENDAR.HEADER_HEIGHT,
        }}
        className="absolute cursor-pointer"
      >
        <div className="calendar-grid">
          <HTMLGridContainer
            groups={groups}
            bookings={bookings}
            containerRef={containerRef}
            renderRangeState={{ renderRange, setRenderRange }}
            scrollPositionState={{ scrollPosition, setScrollPosition }}
          />
        </div>
      </div>

      {/* Calendar Header */}
      <div
        style={{
          height: CALENDAR.HEADER_HEIGHT,
          left: CALENDAR.GROUP_WIDTH,
          top: 0,
        }}
        className="absolute cursor-pointer"
      >
        <div className="calendar-header">{/* Header content will be implemented in a separate component */}</div>
      </div>
    </div>
  );
};
