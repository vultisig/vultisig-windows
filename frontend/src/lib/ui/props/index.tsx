import { ReactNode } from 'react';

export type ComponentWithChildrenProps = {
  children: ReactNode;
};

export type UIComponentProps = {
  style?: React.CSSProperties;
  className?: string;
};