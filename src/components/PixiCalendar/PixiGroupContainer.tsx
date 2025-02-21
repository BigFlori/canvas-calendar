import { Container, Graphics, Stage, Text } from "@pixi/react";
import { Group } from "../../types/types";
import { CALENDAR } from "../../constants";
import { TextStyle } from "pixi.js";
import { useCallback, useMemo } from "react";
import { Graphics as Graphic } from "pixi.js";

interface GroupContainerProps {
  groups: Group[];
  onAddGroup: () => void;
}

// Konstans stílusokat komponensen kívülre helyezzük
const groupNameStyle = new TextStyle({
  fontSize: 12,
  fill: "black",
});

export const PixiGroupContainer: React.FC<GroupContainerProps> = ({ groups }) => {
  // Magasság számítás memorizálása
  const GROUP_HEIGHT = useMemo(() => CALENDAR.GRID_HEIGHT * groups.length, [groups.length]);

  // Háttér rajzolás memorizálása
  const drawBackground = useCallback(
    (g: Graphic) => {
      g.beginFill(CALENDAR.BACKGROUND_COLOR);
      g.drawRect(0, 0, CALENDAR.GROUP_WIDTH, GROUP_HEIGHT);
      g.endFill();
    },
    [GROUP_HEIGHT]
  );

  // Csoportok rajzolásának memorizálása
  const groupItems = useMemo(
    () =>
      groups.map((group, index) => {
        const drawGroupBorders = (g: Graphic) => {
          // Right border
          g.lineStyle(1, CALENDAR.GRID_BORDER_COLOR);
          g.moveTo(CALENDAR.GROUP_WIDTH, 0);
          g.lineTo(CALENDAR.GROUP_WIDTH, CALENDAR.GRID_HEIGHT);

          // Bottom border - only if not the last group
          if (index !== groups.length - 1) {
            g.moveTo(0, CALENDAR.GRID_HEIGHT);
            g.lineTo(CALENDAR.GROUP_WIDTH, CALENDAR.GRID_HEIGHT);
          }
        };

        return (
          <Container key={group.id} y={index * CALENDAR.GRID_HEIGHT}>
            <Graphics draw={drawGroupBorders} />
            <Text text={group.name} x={CALENDAR.GROUP_PADDING} y={CALENDAR.GROUP_PADDING} style={groupNameStyle} />
          </Container>
        );
      }),
    [groups]
  );

  // Stage style memorizálása
  const stageStyle = useMemo(
    () => ({
      width: CALENDAR.GROUP_WIDTH,
      height: GROUP_HEIGHT,
    }),
    [GROUP_HEIGHT]
  );

  return (
    <Stage {...stageStyle}>
      <Container>
        <Graphics draw={drawBackground} />
        {groupItems}
      </Container>
    </Stage>
  );
};
