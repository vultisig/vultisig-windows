import { VStack } from '@lib/ui/layout/Stack'
import { List } from '@lib/ui/list'
import { ChildrenProp, TitleProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'

export const SettingsSection = ({
  title,
  children,
}: TitleProp & ChildrenProp) => (
  <VStack gap={12}>
    <Text color="light" size={12} weight={500}>
      {title}
    </Text>
    <List>{children}</List>
  </VStack>
)
