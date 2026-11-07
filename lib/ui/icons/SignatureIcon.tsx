import { SvgProps } from '@lib/ui/props'

/** Pen beside a handwritten signature stroke. */
export const SignatureIcon = (props: SvgProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 20 20"
    fill="none"
    {...props}
  >
    <path
      d="M9.00065 17.0003C10.6547 14.0633 11.5357 13.3063 12.0187 13.4573C12.7927 13.6983 12.5677 16.2883 13.3867 16.4393C13.9907 16.5513 14.5257 15.2203 15.1757 15.3863C15.7007 15.5203 15.6687 16.4663 16.2627 16.6493C16.5017 16.7223 16.7587 16.6493 16.9997 16.5143"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      stroke="currentColor"
    />
    <path
      d="M5.99967 13.9997L4.49967 16.9997L2.99967 13.9997V3.99967C2.99967 3.44767 3.44767 2.99967 3.99967 2.99967H4.99967C5.55167 2.99967 5.99967 3.44767 5.99967 3.99967V13.9997Z"
      fill="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      stroke="currentColor"
    />
    <path
      d="M4.00065 6.00016H7.50065C8.32865 6.00016 9.00065 6.67216 9.00065 7.50016V11.0002"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      stroke="currentColor"
    />
  </svg>
)
