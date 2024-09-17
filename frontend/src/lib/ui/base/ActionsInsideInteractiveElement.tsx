import {
  ComponentProps,
  CSSProperties,
  forwardRef,
  ReactNode,
  Ref,
  useState,
} from 'react';
import styled from 'styled-components';

import { Dimensions } from '../../utils/entities/Dimensions';
import { getRecordKeys } from '../../utils/record/getRecordKeys';
import { getRecordSize } from '../../utils/record/getRecordSize';
import { makeRecord } from '../../utils/record/makeRecord';
import { pick } from '../../utils/record/pick';
import { toEntries } from '../../utils/record/toEntries';
import { useStateCorrector } from '../state/useStateCorrector';
import { ElementSizeAware } from './ElementSizeAware';

type RenderParams<K extends string> = {
  actions: Record<K, { size: Dimensions; placerStyles: CSSProperties }>;
};

const Container = styled.div`
  position: relative;
`;

type ActionInsideInteractiveElementProps<K extends string> = ComponentProps<
  typeof Container
> & {
  render: (params: RenderParams<K>) => ReactNode;
  actions: Record<
    K,
    {
      placerStyles: CSSProperties;
      node: ReactNode;
    }
  >;
};

const ActionPlacer = styled.div`
  position: absolute;
`;

export const ActionsInsideInteractiveElement = forwardRef(
  function ActionInsideInteractiveElement<K extends string>(
    { render, actions, ...rest }: ActionInsideInteractiveElementProps<K>,
    ref: Ref<HTMLDivElement>
  ) {
    const [sizes, setSizes] = useStateCorrector(
      useState<Record<K, Dimensions>>(() =>
        makeRecord(getRecordKeys(actions), () => ({ width: 0, height: 0 }))
      ),
      sizes => {
        let result = sizes;

        const keys = getRecordKeys(actions);

        keys.forEach(key => {
          if (!sizes[key]) {
            result = {
              ...result,
              [key]: { width: 0, height: 0 },
            };
          }
        });

        if (getRecordSize(result) !== keys.length) {
          return pick(result, keys);
        }

        return result;
      }
    );

    return (
      <Container ref={ref} {...rest}>
        {render({
          actions: makeRecord(getRecordKeys(actions), key => ({
            size: sizes[key],
            placerStyles: actions[key].placerStyles,
          })),
        })}
        {toEntries(actions).map(({ key, value }) => {
          const { node, placerStyles } = value;
          return (
            <ElementSizeAware
              key={key}
              onChange={size => {
                if (size) {
                  setSizes(sizes => ({
                    ...sizes,
                    [key]: size,
                  }));
                }
              }}
              render={({ setElement, size }) => {
                return (
                  <ActionPlacer
                    ref={setElement}
                    style={{ opacity: size ? 1 : 0, ...placerStyles }}
                  >
                    {node}
                  </ActionPlacer>
                );
              }}
            />
          );
        })}
      </Container>
    );
  }
);
