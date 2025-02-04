export const LightningIcon = ({
  color = '#fff',
  height = '1em',
  width = '1em',
}: {
  color?: string;
  height?: string | number;
  width?: string | number;
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={width}
    height={height}
    fill="none"
  >
    <path
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M8.75 1v7h6l-8 11v-7h-6l8-11Z"
    />
  </svg>
);
