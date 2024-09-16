import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useState,
} from 'react';

import { capitalizeFirstLetter } from '../../utils/capitalizeFirstLetter';
import { ComponentWithChildrenProps } from '../props';

export function getStateProviderSetup<T>(name: string) {
  type ContextState = { value: T; setValue: Dispatch<SetStateAction<T>> };

  const Context = createContext<ContextState | undefined>(undefined);

  type Props = ComponentWithChildrenProps & { initialValue: T };

  const Provider = ({ children, initialValue }: Props) => {
    const [value, setValue] = useState(initialValue);

    return (
      <Context.Provider value={{ value, setValue }}>
        {children}
      </Context.Provider>
    );
  };

  return {
    provider: Provider,
    useState: (): [T, Dispatch<SetStateAction<T>>] => {
      const context = useContext(Context);

      if (!context) {
        throw new Error(`${capitalizeFirstLetter(name)} is not provided`);
      }

      return [context.value, context.setValue];
    },
  };
}
