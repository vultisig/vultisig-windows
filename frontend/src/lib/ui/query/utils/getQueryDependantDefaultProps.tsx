import { QueryDependantProps } from '../components/QueryDependant';

export const getQueryDependantDefaultProps = (
  entityName: string
): Pick<QueryDependantProps<unknown>, 'error' | 'pending'> => ({
  error: () => <p>Failed to load {entityName}</p>,
  pending: () => <p>Loading {entityName}...</p>,
});
