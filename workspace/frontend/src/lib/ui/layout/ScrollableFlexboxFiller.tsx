import React from 'react';

import { ChildrenProp, UiProps } from '../props';

export const ScrollableFlexboxFiller = ({
  children,
  className,
  style,
}: ChildrenProp & UiProps) => (
  <div className={`flex-1 relative ${className}`} style={style}>
    <div className="absolute inset-0 overflow-auto">{children}</div>
  </div>
);
