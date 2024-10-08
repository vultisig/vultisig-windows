import { FormEvent, KeyboardEvent } from 'react';

import { withoutUndefinedFields } from '../../../utils/record/withoutUndefinedFields';
import { preventDefault } from '../../utils/preventDefault';
import { stopPropagation } from '../../utils/stopPropagation';

type GetFormPropsInput = {
  onClose?: () => void;
  onSubmit?: () => void;
  isDisabled?: boolean | string;
};

export const getFormProps = ({
  onClose,
  onSubmit,
  isDisabled = false,
}: GetFormPropsInput) => {
  return withoutUndefinedFields({
    onKeyDown: onClose
      ? (event: KeyboardEvent<HTMLFormElement>) => {
          if (event.key === 'Escape') {
            event.stopPropagation();
            onClose();
          }
        }
      : undefined,
    onSubmit: onSubmit
      ? stopPropagation<FormEvent>(
          preventDefault(() => {
            if (isDisabled) return;

            onSubmit();
          })
        )
      : undefined,
  });
};
