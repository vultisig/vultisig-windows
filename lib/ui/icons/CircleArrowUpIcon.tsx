import { SvgProps } from '@lib/ui/props'

/**
 * A filled circle enclosing an upward arrow, used to mark upgrade prompts.
 */
export const CircleArrowUpIcon = (props: SvgProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 16 16"
    fill="none"
    {...props}
  >
    <path
      d="M8 0.5C12.1349 0.5 15.5 3.86514 15.5 8C15.5 12.1349 12.1349 15.5 8 15.5C3.86514 15.5 0.5 12.1349 0.5 8C0.5 3.86514 3.86514 0.5 8 0.5ZM9.06055 3.43945C8.47428 2.85319 7.52572 2.85319 6.93945 3.43945L4.43945 5.93945C3.85319 6.52572 3.85319 7.47428 4.43945 8.06055C5.00636 8.62745 5.91072 8.6447 6.5 8.11523V12C6.5 12.8281 7.17186 13.5 8 13.5C8.82814 13.5 9.5 12.8281 9.5 12V8.11523C10.0893 8.6447 10.9936 8.62745 11.5605 8.06055C11.8529 7.76823 12 7.38351 12 7C12 6.61649 11.8529 6.23177 11.5605 5.93945L9.06055 3.43945Z"
      fill="currentColor"
      stroke="currentColor"
    />
  </svg>
)
