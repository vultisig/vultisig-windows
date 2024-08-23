import { ReactNode } from 'react';

export type ComponentWithChildrenProps = {
  children: ReactNode;
};

export type UIComponentProps = {
  style?: React.CSSProperties;
  className?: string;
};

export type ClickableComponentProps = {
  onClick: () => void;
};

export type ComponentWithValueProps<T> = {
  value: T;
};
