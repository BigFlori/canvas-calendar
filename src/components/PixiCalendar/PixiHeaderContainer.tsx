import { RefObject, useCallback, useMemo } from "react";
import { DateRange } from "../../types/types";
import { useElementSize } from "../../hooks/useElementSize";
import { CALENDAR } from "../../constants";
import { Container, Graphics, Stage, Text } from "@pixi/react";
import { Graphics as Graphic, TextStyle } from "pixi.js";
import dayjs from "dayjs";

interface HeaderContainerProps {
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

const dayStyle = new TextStyle({
  fontSize: CALENDAR.HEADER_LABEL_FONT_SIZE,
  fill: 0x666666,
});

export const PixiHeaderContainer: React.FC<HeaderContainerProps> = ({
  containerRef,
  renderRangeState,
  scrollPositionState,
}) => {
  const containerWidth = useElementSize(containerRef).width;
  const HEADER_CONTAINER_WIDTH = containerWidth - CALENDAR.GROUP_WIDTH;
  const { renderRange } = renderRangeState;
  const { scrollPosition } = scrollPositionState;

  const renderDays = useMemo(
    () => renderRange.endDate.diff(renderRange.startDate, "day"),
    [renderRange.startDate, renderRange.endDate]
  );
  const today = useMemo(() => dayjs().startOf("day"), []);

  // Látható időszak számítása
  const visibleStartDate = useMemo(
    () => renderRange.startDate.add(Math.floor(scrollPosition.x / CALENDAR.GRID_WIDTH), "day"),
    [renderRange.startDate, scrollPosition.x]
  );

  const visibleEndDate = useMemo(
    () => visibleStartDate.add(Math.ceil(HEADER_CONTAINER_WIDTH / CALENDAR.GRID_WIDTH), "day"),
    [visibleStartDate, HEADER_CONTAINER_WIDTH]
  );

  // Renderelési ablak számítása (-/+ 14 nap a látható területhez képest)
  const renderWindowStartDate = useMemo(() => visibleStartDate.subtract(CALENDAR.RENDER_WINDOW, "day"), [visibleStartDate]);

  const renderWindowEndDate = useMemo(() => visibleEndDate.add(CALENDAR.RENDER_WINDOW, "day"), [visibleEndDate]);

  const drawCells = useCallback(
    (g: Graphic) => {
      g.clear();
      
      const startDayIndex = renderWindowStartDate.diff(renderRange.startDate, "day");
      const endDayIndex = renderWindowEndDate.diff(renderRange.startDate, "day");
      
      for (let i = startDayIndex; i <= endDayIndex; i++) {
        if (i < 0 || i >= renderDays) continue;
        
        const date = renderRange.startDate.add(i, "day");
        const isToday = today.isSame(date, "day");
        const isWeekend = date.day() === 0 || date.day() === 6;
        const x = Math.round(i * CALENDAR.GRID_WIDTH);
        
        g.beginFill(isToday ? CALENDAR.TODAY_COLOR : isWeekend ? CALENDAR.WEEKEND_COLOR : CALENDAR.BACKGROUND_COLOR);
        
        g.lineStyle(CALENDAR.GRID_BORDER_WIDTH, CALENDAR.GRID_BORDER_COLOR);
        g.drawRect(x, 0, CALENDAR.GRID_WIDTH, CALENDAR.HEADER_HEIGHT);
        g.endFill();
      }
    },
    [renderDays, renderRange.startDate, renderWindowStartDate, renderWindowEndDate, today]
  );

  // Memoize the dates array
  // const dates = useMemo(
  //   () =>
  //     Array.from({ length: renderDays }).map((_, index) => ({
  //       date: renderRange.startDate.add(index, "day"),
  //       index,
  //     })),
  //   [renderDays, renderRange.startDate]
  // );

  // Render the dates using memoized values
  const renderDates = useCallback(() => {
    const startDayIndex = renderWindowStartDate.diff(renderRange.startDate, "day");
    const endDayIndex = renderWindowEndDate.diff(renderRange.startDate, "day");
    
    return Array.from({ length: endDayIndex - startDayIndex + 1 }).map((_, index) => {
      const dayIndex = startDayIndex + index;
      if (dayIndex < 0 || dayIndex >= renderDays) return null;
      
      const date = renderRange.startDate.add(dayIndex, "day");
      const isToday = today.isSame(date, "day");
      
      return (
        <Container key={dayIndex} x={dayIndex * CALENDAR.GRID_WIDTH} y={0}>
          <Text
            text={date.format("D")}
            x={CALENDAR.GRID_WIDTH / 2}
            y={CALENDAR.HEADER_HEIGHT / 4}
            anchor={[0.5, 0.5]}
            style={new TextStyle({ 
              ...dayStyle, 
              fill: isToday ? 0xffffff : 0x666666 
            })}
          />
        </Container>
      );
    });
  }, [renderDays, renderRange.startDate, renderWindowStartDate, renderWindowEndDate, today]);

  // Memoize container style
  const containerStyle = useMemo(
    () => ({
      width: HEADER_CONTAINER_WIDTH,
    }),
    [HEADER_CONTAINER_WIDTH]
  );

  const stageStyle = useMemo(
    () => ({
      aspectRatio: `auto ${HEADER_CONTAINER_WIDTH} / ${CALENDAR.HEADER_HEIGHT}`,
    }),
    [HEADER_CONTAINER_WIDTH]
  );

  const stageOptions = useMemo(() => ({
    //antialias: true,
    autoDensity: true,
    resolution: window.devicePixelRatio || 1,
    roundPixels: true,
  }), []);

  return (
    <div style={containerStyle} className="bg-white shadow-2xl z-10">
      <Stage
        width={HEADER_CONTAINER_WIDTH}
        height={CALENDAR.HEADER_HEIGHT}
        options={stageOptions}
        style={stageStyle}
      >
        <Container position={[-Math.round(scrollPosition.x), 0]}>
          <Graphics draw={drawCells} />
          {renderDates()}
        </Container>
      </Stage>
    </div>
  );
};
