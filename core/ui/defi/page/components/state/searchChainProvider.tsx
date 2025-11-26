import { ChildrenProp } from '@lib/ui/props'
import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useState,
} from 'react'

type SearchChainContextValue = [string, Dispatch<SetStateAction<string>>]

const SearchChainContext = createContext<SearchChainContextValue | undefined>(
  undefined
)

export const SearchChainProvider = ({ children }: ChildrenProp) => {
  const state = useState('')

  return (
    <SearchChainContext.Provider value={state}>
      {children}
    </SearchChainContext.Provider>
  )
}

export const useSearchChain = () => {
  const value = useContext(SearchChainContext)

  if (!value) {
    throw new Error('useSearchChain must be used within SearchChainProvider')
  }

  return value
}
