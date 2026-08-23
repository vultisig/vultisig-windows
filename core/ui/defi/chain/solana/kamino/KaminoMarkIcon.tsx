import { SvgProps } from '@lib/ui/props'

/**
 * The Kamino brand mark — a flat rendition of the tile the app already ships
 * as `banner-art-kamino.png`, drawn at `1em` so a call site sizes it with
 * `fontSize` like any other icon.
 *
 * Round rather than the brand's rounded square: it is always shown beside a
 * round token logo, and a square overlapping a circle reads as a rendering
 * fault rather than a pair. Its colors are fixed rather than `currentColor` —
 * a logo that recolors itself to the surrounding text is no longer the logo —
 * and the disc sits a step lighter than the surfaces it is drawn on so it
 * stays visible against them.
 */
export const KaminoMarkIcon = (props: SvgProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    fill="none"
    {...props}
  >
    <circle cx="12" cy="12" r="12" fill="#16274D" />
    <path
      d="M8.7 6.2V17.8"
      stroke="#E9EFFB"
      strokeWidth="2.2"
      strokeLinecap="round"
    />
    <path
      d="M16.2 6.5C13.1 9.2 12.1 10.9 12.1 12C12.1 13.1 13.1 14.8 16.2 17.5"
      stroke="#E9EFFB"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)
