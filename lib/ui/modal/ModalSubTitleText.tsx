import { AsProp, ChildrenProp, UiProps } from '@lib/ui/props'
import { Text, TextProps } from '@lib/ui/text'

export const ModalSubTitleText = (
  props: TextProps & ChildrenProp & UiProps & AsProp
) => <Text color="supporting" as="div" {...props} />
