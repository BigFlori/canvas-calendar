import { CalendarConstants } from "./types/types";

// Type assertion for the existing CALENDAR object
export const CALENDAR: CalendarConstants = {
  BACKGROUND_COLOR: 0xffffff,
  TODAY_COLOR: 0x00ff00,
  WEEKEND_COLOR: 0xebedef,
  GRID_BORDER_WIDTH: 1,
  GRID_BORDER_COLOR: 0xd5d5d5,
  GRID_HEIGHT: 48,
  GRID_WIDTH: 45,
  GROUP_WIDTH: 200,
  GROUP_PADDING: 5,
  HEADER_HEIGHT: 37,
  HEADER_LABEL_FONT_SIZE: 12,
  HEADER_TEXT_GAP: 2,
  RENDER_WINDOW: 30,
} as const;