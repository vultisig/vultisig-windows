import { Button } from '../buttons/Button';
import { UniformColumnGrid } from '../css/uniformColumnGrid';
import { InputProps, UIComponentProps } from '../props';

interface RadioInputProps<T extends string>
  extends InputProps<T>,
    UIComponentProps {
  options: readonly T[];
  renderOption: (option: T) => React.ReactNode;
  minOptionHeight?: number;
}

export const RadioInput = <T extends string>({
  value,
  onChange,
  options,
  renderOption,
  ...rest
}: RadioInputProps<T>) => {
  return (
    <UniformColumnGrid gap={8} {...rest}>
      {options.map(option => {
        const isActive = option === value;

        return (
          <Button
            kind={isActive ? 'primary' : 'outlined'}
            key={option}
            onClick={() => onChange(option)}
          >
            {renderOption(option)}
          </Button>
        );
      })}
    </UniformColumnGrid>
  );
};
