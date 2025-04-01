const AddressBookIcon = ({ size = 20 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    fill="none"
    viewBox="0 0 20 20"
  >
    <path
      stroke="#fff"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M13.75 2.5V10l-2.5-1.875L8.75 10V2.5"
    />
    <path
      stroke="#fff"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M3.75 16.875A1.875 1.875 0 0 1 5.625 15H16.25V2.5H5.625A1.875 1.875 0 0 0 3.75 4.375v12.5ZM3.75 16.875v.625H15"
    />
  </svg>
)
export default AddressBookIcon
