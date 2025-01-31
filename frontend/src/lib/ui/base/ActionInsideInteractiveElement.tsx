import { Dimensions } from '@floating-ui/react';
import {
  ComponentProps,
  CSSProperties,
  forwardRef,
  ReactNode,
  Ref,
} from 'react';
import styled from 'styled-components';

import { ActionProp } from '../props';
import { ElementSizeAware } from './ElementSizeAware';

interface ActionInsideInteractiveElementRenderParams<
  T extends CSSProperties = CSSProperties,
> {
  actionSize: Dimensions;
  actionPlacerStyles: T;
}

const Container = styled.div`
  position: relative;
`;

type ActionInsideInteractiveElementProps<
  T extends CSSProperties = CSSProperties,
> = ComponentProps<typeof Container> &
  ActionProp & {
    render: (
      params: ActionInsideInteractiveElementRenderParams<T>
    ) => ReactNode;
    actionPlacerStyles: T;
  };

const ActionPlacer = styled.div`
  position: absolute;
`;

export const ActionInsideInteractiveElement = forwardRef(
  function ActionInsideInteractiveElement<
    T extends CSSProperties = CSSProperties,
  >(
    {
      render,
      action,
      actionPlacerStyles,
      ...rest
    }: ActionInsideInteractiveElementProps<T>,
    ref: Ref<HTMLDivElement>
  ) {
    return (
      <Container ref={ref} {...rest}>
        <ElementSizeAware
          render={({ setElement, size }) => (
            <>
              {render({
                actionPlacerStyles,
                actionSize: size ?? { width: 0, height: 0 },
              })}
              <ActionPlacer
                ref={setElement}
                style={{ opacity: size ? 1 : 0, ...actionPlacerStyles }}
              >
                {action}
              </ActionPlacer>
            </>
          )}
        />
      </Container>
    );
  }
);
