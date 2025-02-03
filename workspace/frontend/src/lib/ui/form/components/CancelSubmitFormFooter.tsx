import { Button } from '../../buttons/Button';
import { HStack } from '../../layout/Stack';

type CancelSubmitFormFooterProps = {
  onCancel?: () => void;
  isDisabled?: string | boolean;
  isPending?: boolean;
  submitText?: string;
  cancelText?: string;
};

export const CancelSubmitFooter = ({
  onCancel,
  isDisabled,
  isPending,
  submitText = 'Submit',
  cancelText = 'Cancel',
}: CancelSubmitFormFooterProps) => {
  return (
    <HStack justifyContent="end" gap={8}>
      {onCancel && (
        <Button onClick={onCancel} kind="outlined">
          {cancelText}
        </Button>
      )}
      <Button type="submit" isLoading={isPending} isDisabled={isDisabled}>
        {submitText}
      </Button>
    </HStack>
  );
};
