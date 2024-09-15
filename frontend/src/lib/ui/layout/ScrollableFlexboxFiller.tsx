import React from 'react';

import { ComponentWithChildrenProps, UIComponentProps } from '../props';

export const ScrollableFlexboxFiller = ({
  children,
  className,
  style,
}: ComponentWithChildrenProps & UIComponentProps) => (
  <div className={`flex-1 relative ${className}`} style={style}>
    <div className="absolute inset-0 overflow-auto">{children}</div>
  </div>
);
