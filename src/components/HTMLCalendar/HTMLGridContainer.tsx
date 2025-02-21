import { RefObject, useCallback, useEffect, useRef, useMemo } from "react";
import { Booking, DateRange, Group } from "../../types/types";
import { CALENDAR } from "../../constants";
import { useElementSize } from "../../hooks/useElementSize";
import dayjs from "dayjs";

interface GridContainerProps {
  groups: Group[];
  bookings: Booking[];
  containerRef: RefObject<HTMLDivElement>;
  renderRangeState: {
    renderRange: DateRange;
    setRenderRange: React.Dispatch<React.SetStateAction<DateRange>>;
  };
  scrollPositionState: {
    scrollPosition: { x: number; y: number };
    setScrollPosition: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
  };
}

export const HTMLGridContainer: React.FC<GridContainerProps> = ({
  groups,
  containerRef,
  renderRangeState,
  scrollPositionState,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const GRID_HEIGHT = useMemo(() => CALENDAR.GRID_HEIGHT * groups.length, [groups.length]);
  const containerWidth = useElementSize(containerRef).width;
  const GRID_CONTAINER_WIDTH = useMemo(() => containerWidth - CALENDAR.GROUP_WIDTH, [containerWidth]);

  const { renderRange, setRenderRange } = renderRangeState;
  const { scrollPosition, setScrollPosition } = scrollPositionState;

  const totalRenderDays = useMemo(
    () => renderRange.endDate.diff(renderRange.startDate, "day"),
    [renderRange.startDate, renderRange.endDate]
  );
  const visibleStartDate = useMemo(
    () => renderRange.startDate.add(Math.floor(scrollPosition.x / CALENDAR.GRID_WIDTH), "day"),
    [renderRange.startDate, scrollPosition.x]
  );
  // Látható időszak számítása
  const visibleEndDate = useMemo(
    () => visibleStartDate.add(Math.ceil(GRID_CONTAINER_WIDTH / CALENDAR.GRID_WIDTH), "day"),
    [visibleStartDate, GRID_CONTAINER_WIDTH]
  );

  // Renderelési ablak számítása (-/+ 14 nap a látható területhez képest)
  const renderWindowStartDate = useMemo(
    () => visibleStartDate.subtract(CALENDAR.RENDER_WINDOW, "day"),
    [visibleStartDate]
  );

  const renderWindowEndDate = useMemo(() => visibleEndDate.add(CALENDAR.RENDER_WINDOW, "day"), [visibleEndDate]);

  const RENDER_WIDTH = useMemo(() => totalRenderDays * CALENDAR.GRID_WIDTH, [totalRenderDays]);
  const today = useMemo(() => dayjs().startOf("day"), []);
  const scrollThreshold = useMemo(() => CALENDAR.GRID_WIDTH * 30, []);

  const containerStyle = useMemo(
    () => ({
      height: GRID_HEIGHT,
      width: GRID_CONTAINER_WIDTH,
    }),
    [GRID_HEIGHT, GRID_CONTAINER_WIDTH]
  );

  const renderWidthStyle = useMemo(
    () => ({
      height: GRID_HEIGHT,
      width: RENDER_WIDTH,
      display: "grid",
      gridTemplateColumns: `repeat(${totalRenderDays}, ${CALENDAR.GRID_WIDTH}px)`,
      gridTemplateRows: `repeat(${groups.length}, ${CALENDAR.GRID_HEIGHT}px)`,
    }),
    [GRID_HEIGHT, RENDER_WIDTH, totalRenderDays, groups.length]
  );

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const target = e.target as HTMLDivElement;
      const newScrollPosition = {
        x: Math.round(target.scrollLeft),
        y: Math.round(target.scrollTop),
      };
      setScrollPosition(newScrollPosition);

      if (newScrollPosition.x < scrollThreshold) {
        setRenderRange((prev) => ({
          startDate: prev.startDate.subtract(1, "year"),
          endDate: prev.endDate,
        }));
      } else if (newScrollPosition.x + GRID_CONTAINER_WIDTH > RENDER_WIDTH - scrollThreshold) {
        setRenderRange((prev) => ({
          startDate: prev.startDate,
          endDate: prev.endDate.add(1, "year"),
        }));
      }
    },
    [GRID_CONTAINER_WIDTH, RENDER_WIDTH, scrollThreshold, setRenderRange, setScrollPosition]
  );

  useEffect(() => {
    const todayIndex = today.diff(renderRange.startDate, "day");
    const todayPosition = todayIndex * CALENDAR.GRID_WIDTH;

    setScrollPosition({ x: todayPosition, y: 0 });

    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ left: todayPosition, behavior: "instant" });
    }
  }, [today, renderRange.startDate, setScrollPosition]);

const renderCells = useCallback(() => {
    const cells = [];
    const renderStartDayIndex = renderWindowStartDate.diff(renderRange.startDate, "day");
    const renderEndDayIndex = renderWindowEndDate.diff(renderRange.startDate, "day");

    for (let groupIndex = 0; groupIndex < groups.length; groupIndex++) {
        for (let dayIndex = renderStartDayIndex; dayIndex <= renderEndDayIndex; dayIndex++) {
            if (dayIndex < 0 || dayIndex >= totalRenderDays) continue;

            const date = renderRange.startDate.add(dayIndex, "day");
            const isToday = today.isSame(date, "day");
            const isWeekend = date.day() === 0 || date.day() === 6;
            const isTopRow = groupIndex === 0;

            const borderStyle = {
                borderRight: `1px solid #${CALENDAR.GRID_BORDER_COLOR.toString(16)}`,
                borderBottom: `1px solid #${CALENDAR.GRID_BORDER_COLOR.toString(16)}`,
                ...(isTopRow && {
                    borderTop: `1px solid #${CALENDAR.GRID_BORDER_COLOR.toString(16)}`,
                }),
            };

            cells.push(
                <div
                    key={`${groupIndex}-${dayIndex}`}
                    style={{
                        backgroundColor: isToday
                            ? `#${CALENDAR.TODAY_COLOR.toString(16)}`
                            : isWeekend
                            ? `#${CALENDAR.WEEKEND_COLOR.toString(16)}`
                            : `#${CALENDAR.BACKGROUND_COLOR.toString(16)}`,
                        ...borderStyle,
                        gridColumn: dayIndex + 1,
                        gridRow: groupIndex + 1,
                    }}
                />
            );
        }
    }
    return cells;
}, [groups.length, totalRenderDays, renderRange.startDate, today, renderWindowStartDate, renderWindowEndDate]);

  return (
    <div style={containerStyle}>
      <div className="relative overflow-hidden w-full h-full z-50">
        <div
          className="absolute inset-0 overflow-x-scroll overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar]:h-2
                        [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100/0 [&::-webkit-scrollbar-thumb]:rounded-full
                        [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-track]:bg-neutral-700/0 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500
                        [&::-webkit-scrollbar-thumb]:hover:bg-neutral-400 dark:[&::-webkit-scrollbar-thumb]:hover:bg-neutral-400 [&::-webkit-scrollbar-thumb]:min-w-10"
          onScroll={handleScroll}
          ref={scrollContainerRef}
        >
          <div style={renderWidthStyle}>{renderCells()}</div>
        </div>
      </div>
    </div>
  );
};
