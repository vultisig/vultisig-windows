const DownloadIcon = ({
  width = 22,
  height = 22,
}: {
  width?: number;
  height?: number;
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={width}
    height={height}
    fill="none"
    viewBox="0 0 22 22"
  >
    <path
      stroke="#fff"
      strokeDasharray="2 2"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M11 21c5.523 0 10-4.477 10-10S16.523 1 11 1 1 5.477 1 11s4.477 10 10 10Z"
    />
    <path
      stroke="#fff"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="m6 12.667 5 5 5-5M11 3.5v14.167"
    />
  </svg>
);
export default DownloadIcon;
