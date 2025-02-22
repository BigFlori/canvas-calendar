import { RefObject, useCallback, useEffect, useRef, useMemo } from "react";
import { Booking, DateRange, Group } from "../../types/types";
import { CALENDAR } from "../../constants";
import { useElementSize } from "../../hooks/useElementSize";
import { Graphics, Stage, Container } from "@pixi/react";
import { Graphics as Graphic } from "pixi.js";
import dayjs from "dayjs";

interface GridContainerProps {
  groups: Group[];
  bookings: Booking[];
  onAddGroup: () => void;
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

export const PixiGridContainer: React.FC<GridContainerProps> = ({
  groups,
  containerRef,
  renderRangeState,
  scrollPositionState,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const GRID_HEIGHT = useMemo(() => CALENDAR.GRID_HEIGHT * groups.length, [groups.length]);
  const containerWidth = useElementSize(containerRef, { debounceMs: 100 }).width;
  const GRID_CONTAINER_WIDTH = useMemo(() => containerWidth - CALENDAR.GROUP_WIDTH, [containerWidth]);

  const { renderRange, setRenderRange } = renderRangeState;
  const { scrollPosition, setScrollPosition } = scrollPositionState;

  // Teljes renderelési időszak számítása
  const totalRenderDays = useMemo(
    () => renderRange.endDate.diff(renderRange.startDate, "day"),
    [renderRange.startDate, renderRange.endDate]
  );

  // Látható időszak számítása
  const visibleStartDate = useMemo(
    () => renderRange.startDate.add(Math.floor(scrollPosition.x / CALENDAR.GRID_WIDTH), "day"),
    [renderRange.startDate, scrollPosition.x]
  );

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
    }),
    [GRID_HEIGHT, RENDER_WIDTH]
  );

  const stageStyle = useMemo(
    () => ({
      aspectRatio: `auto ${GRID_CONTAINER_WIDTH} / ${GRID_HEIGHT}`,
    }),
    [GRID_CONTAINER_WIDTH, GRID_HEIGHT]
  );

  const stageOptions = useMemo(
    () => ({
      //antialias: true,
      autoDensity: true,
      resolution: window.devicePixelRatio || 1,
      roundPixels: true,
    }),
    []
  );

  const drawCells = useCallback(
    (g: Graphic) => {
      g.clear();

      const startDayIndex = renderWindowStartDate.diff(renderRange.startDate, "day");
      const endDayIndex = renderWindowEndDate.diff(renderRange.startDate, "day");

      // Először rajzoljuk meg a cellák hátterét
      groups.forEach((_, index) => {
        const y = Math.round(index * CALENDAR.GRID_HEIGHT);

        for (let i = startDayIndex; i <= endDayIndex; i++) {
          if (i < 0 || i >= totalRenderDays) continue;

          const x = Math.round(i * CALENDAR.GRID_WIDTH);
          const date = renderRange.startDate.add(i, "day");
          const isToday = today.isSame(date, "day");
          const isWeekend = date.day() === 0 || date.day() === 6;

          // Cellák háttérszínének beállítása
          g.beginFill(isToday ? CALENDAR.TODAY_COLOR : isWeekend ? CALENDAR.WEEKEND_COLOR : CALENDAR.BACKGROUND_COLOR);
          g.drawRect(x, y, CALENDAR.GRID_WIDTH, CALENDAR.GRID_HEIGHT);
          g.endFill();
        }
      });

      // Állítsuk be a vonalak tulajdonságait
      g.lineStyle({
        width: CALENDAR.GRID_BORDER_WIDTH,
        color: CALENDAR.GRID_BORDER_COLOR,
        alignment: 0,
        native: true
      });

      // Rajzoljuk meg az összes függőleges vonalat
      for (let i = startDayIndex; i <= endDayIndex + 1; i++) {
        if (i < 0 || i >= totalRenderDays + 1) continue;

        const x = Math.round(i * CALENDAR.GRID_WIDTH);
        g.moveTo(x, 0);
        g.lineTo(x, GRID_HEIGHT);
      }

      // Rajzoljuk meg az összes vízszintes vonalat
      groups.forEach((_, index) => {
        const y = Math.round(index * CALENDAR.GRID_HEIGHT);
        const startX = Math.round(startDayIndex * CALENDAR.GRID_WIDTH);
        const endX = Math.round((endDayIndex + 1) * CALENDAR.GRID_WIDTH);

        g.moveTo(startX, y);
        g.lineTo(endX, y);
      });

      // Rajzoljuk meg az utolsó vízszintes vonalat
      const lastY = Math.round(groups.length * CALENDAR.GRID_HEIGHT);
      const startX = Math.round(startDayIndex * CALENDAR.GRID_WIDTH);
      const endX = Math.round((endDayIndex + 1) * CALENDAR.GRID_WIDTH);
      g.moveTo(startX, lastY);
      g.lineTo(endX, lastY);
    },
    [groups, GRID_HEIGHT, totalRenderDays, renderRange.startDate, renderWindowStartDate, renderWindowEndDate, today]
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

  return (
    <>
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
            <div style={renderWidthStyle} className="relative">
              <div style={containerStyle}></div>
            </div>
          </div>
        </div>
      </div>
      <div style={containerStyle} className="absolute top-0 left-0 z-1">
        <Stage width={GRID_CONTAINER_WIDTH} height={GRID_HEIGHT} style={stageStyle} options={stageOptions}>
          <Container position={[-Math.round(scrollPosition.x), 0]}>
            <Graphics draw={drawCells} />
          </Container>
        </Stage>
      </div>
    </>
  );
};
