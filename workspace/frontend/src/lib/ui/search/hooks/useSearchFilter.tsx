import { useMemo } from 'react';

type UseSearchFilterInput<T> = {
  searchQuery: string;
  items: T[];
  getSearchStrings: (item: T) => string[];
};

export function useSearchFilter<T>({
  searchQuery,
  items,
  getSearchStrings,
}: UseSearchFilterInput<T>) {
  const searchString = searchQuery.toLowerCase();

  return useMemo(() => {
    if (!searchString) return items;

    return items.filter(item =>
      getSearchStrings(item).find(itemSearchString =>
        itemSearchString.toLowerCase().includes(searchString)
      )
    );
  }, [searchString, items, getSearchStrings]);
}
