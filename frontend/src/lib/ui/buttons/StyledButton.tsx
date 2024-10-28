import { ReactNode } from 'react';

type StyledButtonProps = {
  label?: string;
  onClick?: () => void;
  children?: ReactNode;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  testId?: string;
};

export default function StyledButton({
  label,
  onClick,
  children,
  className = '',
  disabled = false,
  type = 'button',
  testId,
}: StyledButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`text-[16px] bg-persianBlue-500 hover:bg-persianBlue-300 disabled:opacity-50 disabled:bg-persianBlue-600 text-white rounded-[12px] py-[16px] font-semibold ${className}`}
      disabled={disabled}
      type={type}
      data-test-id={testId}
    >
      {children || <span className="text-center font-semibold">{label}</span>}
    </button>
  );
}
