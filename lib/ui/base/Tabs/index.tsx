import * as RovingFocusGroup from '@radix-ui/react-roving-focus'
import * as RadixTabs from '@radix-ui/react-tabs'
import { ComponentType, ReactNode, useMemo } from 'react'
import { createPortal } from 'react-dom'

import { HStack } from '../../layout/Stack'
import { ChildrenProp } from '../../props'
import { TabsRoot } from './TabsRootWrapper'

export type Tab<V extends string = string> = {
  value: V
  label: ReactNode
  renderContent: ComponentType
  disabled?: boolean
}

type TriggerSlotProps<T extends readonly Tab<string>[]> = {
  tab: T[number]
  isActive: boolean
} & React.ComponentPropsWithoutRef<'button'>

type TabsLayoutOrientation = React.ComponentPropsWithoutRef<
  typeof RovingFocusGroup.Root
>['orientation']

type TabsProps<T extends readonly Tab<string>[]> = {
  tabs: T
  value: T[number]['value']
  onValueChange?: (v: T[number]['value']) => void
  orientation?: TabsLayoutOrientation
  className?: string
  triggersContainer?: ComponentType<ChildrenProp>
  triggerSlot: ComponentType<TriggerSlotProps<T>>
  contentTarget?: Element | DocumentFragment | null
  contentContainer?: ComponentType<ChildrenProp>
}

export function Tabs<T extends readonly Tab<string>[]>({
  tabs,
  value,
  orientation = 'horizontal',
  className,
  onValueChange,
  triggersContainer: TriggersContainer,
  triggerSlot: TriggerComponent,
  contentTarget,
  contentContainer: ContentContainer,
}: TabsProps<T>) {
  const triggerContent = useMemo(
    () =>
      tabs.map(tab => (
        <RadixTabs.Trigger key={tab.value} value={tab.value} asChild>
          <TriggerComponent tab={tab} isActive={tab.value === value} />
        </RadixTabs.Trigger>
      )),
    [TriggerComponent, tabs, value]
  )

  const tabsContent = useMemo(
    () =>
      tabs.map(({ value: val, renderContent: Content }) => {
        const node = (
          <RadixTabs.Content key={val} value={val}>
            <Content />
          </RadixTabs.Content>
        )
        return contentTarget ? createPortal(node, contentTarget, val) : node
      }),
    [contentTarget, tabs]
  )

  return (
    <TabsRoot
      value={value}
      orientation={orientation}
      onValueChange={onValueChange}
      className={className}
    >
      <RadixTabs.List>
        <RovingFocusGroup.Root orientation={orientation} asChild>
          {TriggersContainer ? (
            <TriggersContainer>{triggerContent}</TriggersContainer>
          ) : (
            <HStack gap={24}>{triggerContent}</HStack>
          )}
        </RovingFocusGroup.Root>
      </RadixTabs.List>

      {ContentContainer ? (
        <ContentContainer>{tabsContent}</ContentContainer>
      ) : (
        <>{tabsContent}</>
      )}
    </TabsRoot>
  )
}
