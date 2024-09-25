import { useBoolean } from '../hooks/useBoolean';
import {
  ComponentWithBackActionProps,
  ComponentWithForwardActionProps,
} from '../props';

type StepTransitionProps = {
  from: React.ComponentType<ComponentWithForwardActionProps>;
  to: React.ComponentType<ComponentWithBackActionProps>;
};

export const StepTransition = ({
  from: FromComponent,
  to: ToComponent,
}: StepTransitionProps) => {
  const [value, { set: onForward, unset: onBack }] = useBoolean(false);

  return (
    <>
      {value ? (
        <ToComponent onBack={onBack} />
      ) : (
        <FromComponent onForward={onForward} />
      )}
    </>
  );
};
