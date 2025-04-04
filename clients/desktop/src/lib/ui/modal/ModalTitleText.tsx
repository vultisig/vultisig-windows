import { ChildrenProp } from '@lib/ui/props'
import { Text, TextProps } from '@lib/ui/text'

export const ModalTitleText = (props: TextProps & ChildrenProp) => (
  <Text color="contrast" as="div" weight="500" size={18} {...props} />
)
