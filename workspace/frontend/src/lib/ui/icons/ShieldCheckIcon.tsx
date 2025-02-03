const ShieldCheckIcon = ({ color = '#fff' }: { color?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    fill="none"
    viewBox="0 0 20 20"
  >
    <path
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M3.125 8.333V3.75a.625.625 0 0 1 .625-.625h12.5a.625.625 0 0 1 .625.625v4.583c0 6.564-5.57 8.739-6.683 9.107a.59.59 0 0 1-.384 0c-1.112-.368-6.683-2.543-6.683-9.107Z"
    />
    <path
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="m13.438 7.5-4.584 4.375-2.291-2.188"
    />
  </svg>
);
export default ShieldCheckIcon;
