/**
 * Consolidated SVG icon definitions for pikcell
 *
 * All SVG icons should be defined here and imported where needed.
 * Icons use the pixel-perfect 24x24 viewBox from pixel-icons sets.
 */

// ============================================================================
// Main Tool Icons (toolbar-card)
// ============================================================================

export const TOOL_ICONS = {
  /** Pencil/draw tool */
  pencil: `<svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M18 2h-2v2h-2v2h-2v2h-2v2H8v2H6v2H4v2H2v6h6v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2V8h2V6h-2V4h-2V2zm0 8h-2v2h-2v2h-2v2h-2v2H8v-2H6v-2h2v-2h2v-2h2V8h2V6h2v2h2v2zM6 16H4v4h4v-2H6v-2z" fill="currentColor"/></svg>`,

  /** Selection/marquee tool */
  selection: `<svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M4 4h4v2H6v2H4V4zm12 0h4v4h-2V6h-2V4zM6 16H4v4h4v-2H6v-2zm14 0v4h-4v-2h2v-2h2zM10 4h4v2h-4V4zm0 14h4v2h-4v-2zM4 10h2v4H4v-4zm14 0h2v4h-2v-4z" fill="currentColor"/></svg>`,

  /** Shape tool (squares/circles) */
  shape: `<svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M2 2h12v2H4v10H2V2zm8 8h12v12H10V10zm2 2v8h8v-8h-8z" fill="currentColor"/></svg>`,

  /** Eraser tool */
  eraser: `<svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M8 2h8v2h2v2h2v8h-2v2h-2v2h-2v2H8v-2H6v-2H4v-2H2V6h2V4h2V2h2zm0 2v2H6v2H4v4h2v2h2v2h2v2h4v-2h2v-2h2v-4h-2V8h-2V6h-4V4H8z" fill="currentColor"/></svg>`,

  /** Fill/bucket tool */
  fill: `<svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M6 2h4v2h2v2h2v2h2v2h2v2h2v8h-2v2H6v-2H4v-8h2v-2h2V8H6V6h2V4H6V2zm2 4v2h2v2h2v2h2v2h2v-2h-2v-2h-2V8h-2V6H8zM6 14v4h12v-4H6z" fill="currentColor"/></svg>`,

  /** Eyedropper/color picker tool */
  eyedrop: `<svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M14 2h4v2h2v4h-2v2h-2v2h-2v2h-2v2H8v2H6v2H4v2H2v-4h2v-2h2v-2h2v-2h2v-2h2V8h2V6h-2V4h2V2zm0 4v2h2v2h-2v2h-2v2h-2v2H8v2H6v-2h2v-2h2v-2h2v-2h2V8h2V6h-2z" fill="currentColor"/></svg>`
} as const;

export type ToolIconType = keyof typeof TOOL_ICONS;

// ============================================================================
// Sprite Sheet Tool Icons (spt-toolbar-card)
// ============================================================================

export const SPT_ICONS = {
  /** Pan/hand tool for dragging viewport */
  pan: `<svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M13 0h-2v2H9v2H7v2h2V4h2v7H4V9h2V7H4v2H2v2H0v2h2v2h2v2h2v-2H4v-2h7v7H9v-2H7v2h2v2h2v2h2v-2h2v-2h2v-2h-2v2h-2v-7h7v2h-2v2h2v-2h2v-2h2v-2h-2V9h-2V7h-2v2h2v2h-7V4h2v2h2V4h-2V2h-2V0z" fill="currentColor"/></svg>`,

  /** Zoom/magnifier tool */
  zoom: `<svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M6 2h8v2h2v2h2v8h-2v2h-1v1h1v1h2v2h2v2h-2v-2h-2v-2h-2v-1h-1v1H6v-2H4v-2H2V6h2V4h2V2zm0 2v2H4v6h2v2h6v-2h2V6h-2V4H6zm2 2h4v2h2v4h-2v-2H8v-2H6V6h2z" fill="currentColor"/></svg>`
} as const;

export type SPTIconType = keyof typeof SPT_ICONS;

// ============================================================================
// Action Icons (for commander bar, dialogs, etc.)
// ============================================================================

export const ACTION_ICONS = {
  /** New/create document */
  new: `<svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M4 2h10v2h2v2h2v2h2v14H4V2zm2 2v16h12V10h-6V4H6zm8 0v4h4V6h-2V4h-2z" fill="currentColor"/></svg>`,

  /** Save document */
  save: `<svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M4 2h14v2h2v2h2v16H2V2h2zm2 2v16h12V8h-2V6h-2V4H6zm4 4h4v6h2v2H8v-2h2v-6zm2 2v4h2v-4h-2z" fill="currentColor"/></svg>`,

  /** Load/open document */
  load: `<svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M2 4h8v2h2v2h8v2h2v12H2V4zm2 2v14h16v-8H10V8H8V6H4z" fill="currentColor"/></svg>`,

  /** Export document */
  export: `<svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M4 2h10v2h2v2h2v2h2v14H4V2zm2 2v16h12V10h-6V4H6zm8 0v4h4V6h-2V4h-2zm-3 6h2v4h4v2h-4v4h-2v-4H7v-2h4v-4z" fill="currentColor"/></svg>`,

  /** Settings/gear */
  settings: `<svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M10 2h4v2h2v2h2v2h2v4h-2v2h-2v2h-2v2h-4v-2H8v-2H6v-2H4V8h2V6h2V4h2V2zm0 6v2H8v4h2v2h4v-2h2v-4h-2V8h-4z" fill="currentColor"/></svg>`,

  /** Layout/grid */
  layout: `<svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M2 2h20v20H2V2zm2 2v7h7V4H4zm9 0v7h7V4h-7zM4 13v7h7v-7H4zm9 0v7h7v-7h-7z" fill="currentColor"/></svg>`,

  /** Theme/palette */
  theme: `<svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M8 2h8v2h2v2h2v8h-2v2h-2v2H8v-2H6v-2H4V6h2V4h2V2zm0 2v2H6v6h2v2h8v-2h2V6h-2V4H8z" fill="currentColor"/></svg>`,

  /** Undo action */
  undo: `<svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M14 4h-2v2H8V4H6v2H4v2H2v4h2v2h2v2h2v-2H6v-2H4V8h2V6h4v4H8v2h2v-2h4v8h2v-2h2v-4h-2V8h-2V4z" fill="currentColor"/></svg>`,

  /** Redo action */
  redo: `<svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M10 4h2v2h4V4h2v2h2v2h2v4h-2v2h-2v2h-2v-2h2v-2h2V8h-2V6h-4v4h2v2h-2v-2h-4v8H8v-2H6v-4h2V8h2V4z" fill="currentColor"/></svg>`
} as const;

export type ActionIconType = keyof typeof ACTION_ICONS;

// ============================================================================
// Utility: Get any icon by category and name
// ============================================================================

export const ALL_ICONS = {
  tool: TOOL_ICONS,
  spt: SPT_ICONS,
  action: ACTION_ICONS
} as const;

/**
 * Get an icon SVG string by category and name
 */
export function getIcon(category: keyof typeof ALL_ICONS, name: string): string | undefined {
  const icons = ALL_ICONS[category] as Record<string, string>;
  return icons[name];
}
