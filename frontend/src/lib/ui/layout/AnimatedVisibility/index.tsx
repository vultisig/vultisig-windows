import { animated, useTransition } from '@react-spring/web';
import { CSSProperties, FC, ReactNode, useLayoutEffect, useState } from 'react';

import { ConfigKey, configsMap, ConfigValue } from './animationConfigs';

type AnimatedVisibilityProps = {
  customAnimationConfig?: ConfigValue;
  children: ReactNode;
  className?: string;
  animationConfig?: ConfigKey;
  isOpen?: boolean;
  delay?: number;
  overlayStyles?: CSSProperties;
};

export const AnimatedVisibility: FC<AnimatedVisibilityProps> = ({
  isOpen = true,
  children,
  overlayStyles,
  customAnimationConfig,
  animationConfig = 'scale',
  className,
  delay = 0,
}) => {
  const [delayedIsOpen, setDelayedIsOpen] = useState(false);

  useLayoutEffect(() => {
    if (isOpen) {
      const timeout = setTimeout(() => setDelayedIsOpen(true), delay);
      return () => clearTimeout(timeout);
    } else {
      setDelayedIsOpen(false);
    }
  }, [isOpen, delay]);

  const animationConfigDerived =
    customAnimationConfig ?? configsMap[animationConfig];

  const transitions = useTransition(delayedIsOpen, {
    config: {
      duration: animationConfigDerived.duration,
      easing: animationConfigDerived.easing,
    },
    enter: animationConfigDerived.enter,
    from: animationConfigDerived.from,
    leave: animationConfigDerived.leave,
  });

  return transitions(
    (styles, item) =>
      item && (
        <animated.div
          className={className}
          style={{
            ...styles,
            ...overlayStyles,
          }}
        >
          {children}
        </animated.div>
      )
  );
};
