import dayjs from "dayjs";
import React, { useRef, useState } from "react";
import { Booking, DateRange, Group } from "../../types/types";
import { PixiGroupContainer } from "./PixiGroupContainer";
import { PixiGridContainer } from "./PixiGridContainer";
import { PixiHeaderContainer } from "./PixiHeaderContainer";
import { CALENDAR } from "../../constants";

interface CalendarProps {
  bookings: Booking[];
  groups: Group[];
  onAddBooking: (groupId: string, date: dayjs.Dayjs) => void;
}

export const PixiCalendar: React.FC<CalendarProps> = ({ bookings, groups }) => {
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
      <a
        style={{ height: CALENDAR.HEADER_HEIGHT, width: CALENDAR.GROUP_WIDTH }}
        className="bg-white p-2 border-b border-r border-gray-300 shadow z-10"
      >
        Szűrő
      </a>
      <div
        style={{
          height: GROUP_HEIGHT,
          width: CALENDAR.GROUP_WIDTH,
          top: CALENDAR.HEADER_HEIGHT,
        }}
        className="bg-gray-200 absolute left-0 cursor-pointer"
      >
        <PixiGroupContainer
          groups={groups}
          onAddGroup={() => {
            console.log("Add group");
          }}
        />
      </div>
      <div
        style={{
          left: CALENDAR.GROUP_WIDTH,
          top: CALENDAR.HEADER_HEIGHT,
        }}
        className="absolute cursor-pointer"
      >
        <PixiGridContainer
          groups={groups}
          bookings={bookings}
          onAddGroup={() => {
            console.log("Add group");
          }}
          containerRef={containerRef}
          renderRangeState={{ renderRange, setRenderRange }}
          scrollPositionState={{ scrollPosition, setScrollPosition }}
        />
      </div>
      <div
        style={{
          height: CALENDAR.HEADER_HEIGHT,
          left: CALENDAR.GROUP_WIDTH,
          top: 0,
        }}
        className="absolute cursor-pointer"
      >
        <PixiHeaderContainer
          containerRef={containerRef}
          renderRangeState={{ renderRange, setRenderRange }}
          scrollPositionState={{ scrollPosition, setScrollPosition }}
        />
      </div>
    </div>
  );
};
