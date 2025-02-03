const TrashIcon = ({ stroke = '#EE2B2B', width = 24, height = 24 }) => (
  <svg
    xmlns="http://www.w3.height/2000/svg"
    width={width}
    height={height}
    fill="none"
    viewBox="0 0 24 24"
  >
    <path
      stroke={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M20.25 5.25H3.75M9.75 9.75v6M14.25 9.75v6M18.75 5.25V19.5a.75.75 0 0 1-.75.75H6a.75.75 0 0 1-.75-.75V5.25M15.75 5.25v-1.5a1.5 1.5 0 0 0-1.5-1.5h-4.5a1.5 1.5 0 0 0-1.5 1.5v1.5"
    />
  </svg>
);
export default TrashIcon;
