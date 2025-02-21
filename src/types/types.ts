import { Dayjs } from "dayjs";

export interface Group {
    id: string;
    name: string;
}

export interface Customer {
    id: string;
    name: string;
}

export interface Booking {
    id: string;
    groupId: string;
    customerId: string;
    startDate: Dayjs;
    endDate: Dayjs;
}

export interface DateRange {
    startDate: Dayjs;
    endDate: Dayjs;
}

export interface CalendarConstants {
    /** Background color for calendar grid (hex) */
    BACKGROUND_COLOR: number;

    /** Color for today's date in calendar grid (hex) */
    TODAY_COLOR: number;

    /** Color for weekend dates in calendar grid (hex) */
    WEEKEND_COLOR: number;
    
    /** Width of grid border lines in pixels */
    GRID_BORDER_WIDTH: number;
    
    /** Color of grid border lines (hex) */
    GRID_BORDER_COLOR: number;
    
    /** Height of each grid cell in pixels */
    GRID_HEIGHT: number;
    
    /** Width of each grid cell in pixels */
    GRID_WIDTH: number;
    
    /** Width of the group column in pixels */
    GROUP_WIDTH: number;
    
    /** Padding inside group cells in pixels */
    GROUP_PADDING: number;
    
    /** Height of the calendar header in pixels */
    HEADER_HEIGHT: number;
    
    /** Font size for header labels in pixels */
    HEADER_LABEL_FONT_SIZE: number;
    
    /** Vertical gap between header text elements in pixels */
    HEADER_TEXT_GAP: number;

    /** Number of days to render outside the visible range */
    RENDER_WINDOW: number;
  }