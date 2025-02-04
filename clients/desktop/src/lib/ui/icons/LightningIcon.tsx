export const LightningIcon = ({ color = '#fff' }: { color?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="0.8em"
    height="1em"
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
