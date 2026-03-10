import { TriangleAlertIcon } from '@lib/ui/icons/TriangleAlertIcon'
import { SvgProps } from '@lib/ui/props'
import { ThemeColor } from '@lib/ui/theme/ThemeColors'
import { ComponentType } from 'react'

import { ArrowUpWallIcon } from '../icons/ArrowUpWallIcon'
import { BuildingBlockIcon } from '../icons/BuildingBlockIcon'
import { CalculatorIcon } from '../icons/CalculatorIcon'
import { ChatNotificationIcon } from '../icons/ChatNotificationIcon'
import { HistoryRefreshIcon } from '../icons/HistoryRefreshIcon'
import { LoaderIcon } from '../icons/LoaderIcon'
import { NoteTextIcon } from '../icons/NoteTextIcon'
import { PluginIcon } from '../icons/PluginIcon'
import { ProposalCubeIcon } from '../icons/ProposalCubeIcon'
import { ScanCubeIcon } from '../icons/ScanCubeIcon'
import { ScrollIcon } from '../icons/ScrollIcon'
import { StepCheckIcon } from '../icons/StepCheckIcon'
import { StepWalletIcon } from '../icons/StepWalletIcon'
import { SwapArrowsIcon } from '../icons/SwapArrowsIcon'
import type { AgentStepCategory, AgentStepIconType } from './TimelineEntry'

export const categoryColor: Record<AgentStepCategory, ThemeColor> = {
  planning: 'textShy',
  proposing: 'info',
  executing: 'info',
  success: 'success',
  error: 'danger',
  recurring: 'primaryAlt',
  plugin: 'success',
  balance: 'info',
  history: 'textShy',
}

export const stepIconComponent: Record<
  AgentStepIconType,
  ComponentType<SvgProps>
> = {
  loader: LoaderIcon,
  noteText: NoteTextIcon,
  scroll: ScrollIcon,
  calculator: CalculatorIcon,
  scanCube: ScanCubeIcon,
  buildingBlock: BuildingBlockIcon,
  proposalCube: ProposalCubeIcon,
  check: StepCheckIcon,
  wallet: StepWalletIcon,
  arrowUp: ArrowUpWallIcon,
  swapArrows: SwapArrowsIcon,
  chatNotification: ChatNotificationIcon,
  plugin: PluginIcon,
  historyRefresh: HistoryRefreshIcon,
  warning: TriangleAlertIcon,
}
