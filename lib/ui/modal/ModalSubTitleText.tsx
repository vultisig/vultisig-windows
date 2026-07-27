import { ChildrenProp, UiProps } from '@lib/ui/props'
import { Text, TextProps } from '@lib/ui/text'

export const ModalSubTitleText = (
  props: TextProps & ChildrenProp & UiProps
) => <Text color="supporting" as="div" {...props} />
