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

export const PixiHeaderContainer: React.FC<HeaderContainerProps> = ({
  containerRef,
  renderRangeState,
  scrollPositionState,
}) => {
  const containerWidth = useElementSize(containerRef, { debounceMs: 100 }).width;
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
  const renderWindowStartDate = useMemo(
    () => visibleStartDate.subtract(CALENDAR.RENDER_WINDOW, "day"),
    [visibleStartDate]
  );

  const renderWindowEndDate = useMemo(() => visibleEndDate.add(CALENDAR.RENDER_WINDOW, "day"), [visibleEndDate]);

  const drawCells = useCallback(
    (g: Graphic) => {
      g.clear();

      const startDayIndex = renderWindowStartDate.diff(renderRange.startDate, "day");
      const endDayIndex = renderWindowEndDate.diff(renderRange.startDate, "day");

      // Először rajzoljuk meg a cellák hátterét
      for (let i = startDayIndex; i <= endDayIndex; i++) {
        if (i < 0 || i >= renderDays) continue;

        const date = renderRange.startDate.add(i, "day");
        const isToday = today.isSame(date, "day");
        const isWeekend = date.day() === 0 || date.day() === 6;
        const x = Math.round(i * CALENDAR.GRID_WIDTH);

        // Cellák háttérszínének beállítása
        g.beginFill(isToday ? CALENDAR.TODAY_COLOR : isWeekend ? CALENDAR.WEEKEND_COLOR : CALENDAR.BACKGROUND_COLOR);
        g.drawRect(x, 0, CALENDAR.GRID_WIDTH, CALENDAR.HEADER_HEIGHT);
        g.endFill();
      }

      // Állítsuk be a vonalak tulajdonságait
      g.lineStyle({
        width: CALENDAR.GRID_BORDER_WIDTH,
        color: CALENDAR.GRID_BORDER_COLOR,
        alignment: 0,
        native: true,
      });

      // Rajzoljuk meg az összes függőleges vonalat
      for (let i = startDayIndex; i <= endDayIndex + 1; i++) {
        if (i < 0 || i >= renderDays + 1) continue;

        const x = Math.round(i * CALENDAR.GRID_WIDTH);
        g.moveTo(x, 0);
        g.lineTo(x, CALENDAR.HEADER_HEIGHT);
      }

      // Rajzoljuk meg a vízszintes vonalakat
      const startX = Math.round(startDayIndex * CALENDAR.GRID_WIDTH);
      const endX = Math.round((endDayIndex + 1) * CALENDAR.GRID_WIDTH);

      // Felső vonal
      g.moveTo(startX, 0);
      g.lineTo(endX, 0);

      // Alsó vonal
      g.moveTo(startX, CALENDAR.HEADER_HEIGHT);
      g.lineTo(endX, CALENDAR.HEADER_HEIGHT);
    },
    [renderDays, renderRange.startDate, renderWindowStartDate, renderWindowEndDate, today]
  );

  const dayStyle = useMemo(
    () => ({
      fontSize: CALENDAR.HEADER_LABEL_FONT_SIZE,
      fill: 0x666666,
      // Új beállítások a szöveg élesítéséhez
      fontFamily: "Arial", // Használj egy jól renderelhető rendszer fontot
      padding: 4, // Extra padding a szöveg körül
      letterSpacing: 0, // Betűk közötti távolság
      align: 'center' as const, // Középre igazítás
      resolution: 2, // Magasabb felbontás a szövegnek
      antialias: true, // Szöveg élsimítás bekapcsolása
      fontWeight: 'bold' as const, // Félkövér betűtípus
    }),
    []
  );

  const renderDates = useCallback(() => {
    const startDayIndex = renderWindowStartDate.diff(renderRange.startDate, "day");
    const endDayIndex = renderWindowEndDate.diff(renderRange.startDate, "day");

    return Array.from({ length: endDayIndex - startDayIndex + 1 }).map((_, index) => {
      const dayIndex = startDayIndex + index;
      if (dayIndex < 0 || dayIndex >= renderDays) return null;

      const date = renderRange.startDate.add(dayIndex, "day");
      const isToday = today.isSame(date, "day");
      const x = Math.round(dayIndex * CALENDAR.GRID_WIDTH);

      return (
        <Container key={dayIndex} x={x} y={0}>
          <Text
            text={date.format("D")}
            x={CALENDAR.GRID_WIDTH / 2}
            y={CALENDAR.HEADER_HEIGHT / 4}
            anchor={[0.5, 0.5]}
            style={
              new TextStyle({
                ...dayStyle,
                fill: isToday ? 0xffffff : 0x666666,
              })
            }
          />
        </Container>
      );
    });
  }, [renderDays, renderRange.startDate, renderWindowStartDate, renderWindowEndDate, today]);

  const stageOptions = useMemo(
    () => ({
      antialias: false,
      autoDensity: true,
      resolution: window.devicePixelRatio || 2,
      roundPixels: true,
      preserveDrawingBuffer: true,
      powerPreference: "high-performance" as const,
    }),
    []
  );

  const stageStyle = useMemo(
    () => ({
      aspectRatio: `auto ${HEADER_CONTAINER_WIDTH} / ${CALENDAR.HEADER_HEIGHT}`,
    }),
    [HEADER_CONTAINER_WIDTH]
  );

  return (
    <div style={{ width: HEADER_CONTAINER_WIDTH }} className="bg-white shadow-2xl z-10">
      <Stage width={HEADER_CONTAINER_WIDTH} height={CALENDAR.HEADER_HEIGHT} options={stageOptions} style={stageStyle}>
        <Container position={[-Math.round(scrollPosition.x), 0]}>
          <Graphics draw={drawCells} />
          {renderDates()}
        </Container>
      </Stage>
    </div>
  );
};
