import { Edge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import { createContext, useContext } from 'react';

type ListContextValue = {
  registerItem: (entry: { itemId: string; element: HTMLElement }) => () => void;
  reorderItem: (args: {
    startIndex: number;
    indexOfTarget: number;
    closestEdgeOfTarget: Edge | null;
  }) => void;
  getItemIndex: (id: string) => number;
};

export const ListContext = createContext<ListContextValue | null>(null);

export const useListContext = (): ListContextValue => {
  const context = useContext(ListContext);
  if (!context) {
    throw new Error(
      'useListContext must be used within a ListContext.Provider'
    );
  }
  return context;
};
