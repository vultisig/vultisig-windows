import { ElementType, ReactNode } from 'react';

export type ComponentWithChildrenProps = {
  children: ReactNode;
};

export type UIComponentProps = {
  style?: React.CSSProperties;
  className?: string;
};

export type ClickableComponentProps = {
  onClick: () => void;
  className?: string;
};

export type ComponentWithValueProps<T> = {
  value: T;
};

export type InputProps<T> = {
  value: T;
  onChange: (value: T) => void;
};

export type RemovableComponentProps = {
  onRemove: () => void;
};

export type AsElementComponent<T extends ElementType = ElementType> = {
  as?: T;
};

export type TitledComponentProps = {
  title: ReactNode;
};

export type ComponentWithActiveState = {
  isActive?: boolean;
};

export type ComponentWithBackActionProps = {
  onBack: () => void;
};

export type ComponentWithForwardActionProps = {
  onForward: () => void;
};

export type LabeledComponentProps = {
  label: ReactNode;
};

export type ComponentWithIndexProps = {
  index: number;
};

export type ComponentWithActionProps = {
  action: ReactNode;
};

export type ClosableComponentProps = {
  onClose: () => void;
};

export type ComponentWithMessageProps = {
  message: ReactNode;
};

export type ComponentWithDisabledState = {
  isDisabled?: boolean | string;
};

export type ComponentWithStatusProps<T> = {
  status: T;
};

export type ComponentWithOptionsProps<T> = {
  options: readonly T[];
};

export type ValueFinishProps<T> = {
  onFinish: (value: T) => void;
};
