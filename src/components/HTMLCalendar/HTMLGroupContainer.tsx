import { Group } from "../../types/types";
import { CALENDAR } from "../../constants";

// filepath: /c:/Users/Thurneer/Documents/React/canvas-calendar/src/components/HTMLCalendar/HTMLGroupContainer.tsx

interface GroupContainerProps {
    groups: Group[];
}

export const HTMLGroupContainer: React.FC<GroupContainerProps> = ({ groups }) => {
    const containerHeight = CALENDAR.GRID_HEIGHT * groups.length;

    return (
        <div
            className="relative"
            style={{
            width: CALENDAR.GROUP_WIDTH,
            height: containerHeight,
            backgroundColor: `#${CALENDAR.BACKGROUND_COLOR.toString(16)}`,
            }}
        >
            {groups.map((group, index) => (
            <div
                key={group.id}
                className="absolute w-full border-r border-gray-200"
                style={{
                height: CALENDAR.GRID_HEIGHT,
                top: index * CALENDAR.GRID_HEIGHT,
                borderBottom:
                    index !== groups.length - 1 ? "1px solid rgb(229, 231, 235)" : "none",
                }}
            >
                <span
                className="absolute text-xs text-black"
                style={{
                    left: CALENDAR.GROUP_PADDING,
                    top: CALENDAR.GROUP_PADDING,
                }}
                >
                {group.name}
                </span>
            </div>
            ))}
        </div>
    );
};