const ShareIcon = ({ strokeColor = '#fff' }: { strokeColor: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    fill="none"
    viewBox="0 0 20 20"
  >
    <path
      stroke={strokeColor}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="m13.75 11.875 3.75-3.75-3.75-3.75M15 16.875H3.125a.625.625 0 0 1-.625-.625V6.875"
    />
    <path
      stroke={strokeColor}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M5.861 13.75a7.503 7.503 0 0 1 7.264-5.625H17.5"
    />
  </svg>
)
export default ShareIcon
