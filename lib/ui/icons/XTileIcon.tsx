import { SvgProps } from '@lib/ui/props'

/** A white X logo on a black rounded tile. */
export const XTileIcon = (props: SvgProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 38 38"
    fill="none"
    {...props}
  >
    <g clipPath="url(#x-tile-icon-clip)">
      <g>
        <path
          d="M33.894 0H4.10598C1.83837 0 0 1.83837 0 4.10598V33.894C0 36.1616 1.83837 38 4.10598 38H33.894C36.1616 38 38 36.1616 38 33.894V4.10598C38 1.83837 36.1616 0 33.894 0ZM24.2376 32.2247L17.1762 21.9477L8.33522 32.2247H6.05027L16.1616 20.4717L6.05027 5.75575H13.7624L20.4491 15.4874L28.8208 5.75575H31.1058L21.464 16.9637L31.9497 32.2247H24.2376Z"
          fill="black"
        />
        <path
          d="M24.2376 32.2247L17.1762 21.9477L8.33522 32.2247H6.05027L16.1616 20.4717L6.05027 5.75575H13.7624L20.4491 15.4874L28.8208 5.75575H31.1058L21.464 16.9637L31.9497 32.2247H24.2376Z"
          fill="white"
        />
      </g>
      <path
        d="M20.2707 18.35L28.8221 30.5815H25.3126L18.3345 20.6006V20.5999L17.31 19.1348L9.15845 7.47461H12.668L19.2463 16.8848L20.2707 18.35Z"
        fill="black"
      />
    </g>
    <defs>
      <clipPath id="x-tile-icon-clip">
        <rect width="38" height="38" fill="white" />
      </clipPath>
    </defs>
  </svg>
)
