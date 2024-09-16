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
