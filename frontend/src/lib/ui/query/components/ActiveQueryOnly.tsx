import {
  ComponentWithChildrenProps,
  ComponentWithValueProps,
} from '../../props';
import { Query } from '../Query';

export const ActiveQueryOnly: React.FC<
  ComponentWithChildrenProps & ComponentWithValueProps<Query<any>>
> = ({ children, value }) => {
  const isActive =
    value.data !== undefined ||
    value.error ||
    (value.isPending && value.isLoading);

  if (isActive) {
    return <>{children}</>;
  }

  return null;
};
