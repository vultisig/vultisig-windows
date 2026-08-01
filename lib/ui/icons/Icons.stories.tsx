import { SvgProps } from '@lib/ui/props'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { FC } from 'react'

import { AgentIcon } from './AgentIcon'
import { ArCubeIcon } from './ArCubeIcon'
import { ArrowDownIcon } from './ArrowDownIcon'
import { ArrowLeftRightIcon } from './ArrowLeftRightIcon'
import { ArrowSplitIcon } from './ArrowSplitIcon'
import { ArrowUndoIcon } from './ArrowUndoIcon'
import { ArrowUpDownIcon } from './ArrowUpDownIcon'
import { ArrowUpRightIcon } from './ArrowUpRightIcon'
import { ArrowWallDownIcon } from './ArrowWallDownIcon'
import { AsteriskIcon } from './AsteriskIcon'
import { BadgeCheckIcon } from './BadgeCheckIcon'
import { BellIcon } from './BellIcon'
import { BookIcon } from './BookIcon'
import { BooksIcon } from './BooksIcon'
import { BoxIcon } from './BoxIcon'
import { BrokenChainLink3Icon } from './BrokenChainLink3Icon'
import { BrowserExtensionIcon } from './BrowserExtensionIcon'
import { BubbleQuestionIcon } from './BubbleQuestionIcon'
import { CalendarClockIcon } from './CalendarClockIcon'
import { CalendarIcon } from './CalendarIcon'
import { CameraFilledIcon } from './CameraFilledIcon'
import { CameraIcon } from './CameraIcon'
import CaretDownIcon from './CaretDownIcon'
import { ChainLinkIcon3 } from './ChainLinkIcon3'
import { CheckIcon } from './CheckIcon'
import { CheckmarkIcon } from './CheckmarkIcon'
import { ChevronDownIcon } from './ChevronDownIcon'
import { ChevronLeftIcon } from './ChevronLeftIcon'
import { ChevronRightIcon } from './ChevronRightIcon'
import { CircleAlertIcon } from './CircleAlertIcon'
import { CircleCheckIcon } from './CircleCheckIcon'
import { CircleCrossFilledIcon } from './CircleCrossFilledIcon'
import { CircleCrossIcon } from './CircleCrossIcon'
import { CircleDollarSignIcon } from './CircleDollarSignIcon'
import { CircleHelpIcon } from './CircleHelpIcon'
import { CircleICloseIcon } from './CircleICloseIcon'
import { CircleIcon } from './CircleIcon'
import { CircleInfoIcon } from './CircleInfoIcon'
import { CircleMinusIcon } from './CircleMinusIcon'
import { CirclePlusIcon } from './CirclePlusIcon'
import { ClipboardCopyIcon } from './ClipboardCopyIcon'
import { CloseIcon } from './CloseIcon'
import { CloudIcon } from './CloudIcon'
import { CloudOffIcon } from './CloudOffIcon'
import { CloudUploadIcon } from './CloudUploadIcon'
import { CoinsAddIcon } from './CoinsAddIcon'
import { CoinsIcon } from './CoinsIcon'
import { ComputerUploadIcon } from './ComputerUploadIcon'
import { CopyIcon } from './CopyIcon'
import { CoSignIcon } from './CoSignIcon'
import { CrossIcon } from './CrossIcon'
import { CryptoIcon } from './CryptoIcon'
import { CryptoWalletPenIcon } from './CryptoWalletPenIcon'
import { CubeWithCornersIcon } from './CubeWithCornersIcon'
import { DAppsIcon } from './DAppsIcon'
import { DeviceIcon } from './DeviceIcon'
import { DevicesIcon } from './DevicesIcon'
import { DiscordIcon } from './DiscordIcon'
import { DollarIcon } from './DollarIcon'
import { DownloadSeedphraseIcon } from './DownloadSeedphraseIcon'
import { EmailIcon } from './EmailIcon'
import { EmailNotificationIcon } from './EmailNotificationIcon'
import { ExpandIcon } from './ExpandIcon'
import { EyeClosedIcon } from './EyeClosedIcon'
import { EyeIcon } from './EyeIcon'
import { EyeOffIcon } from './EyeOffIcon'
import { FacebookIcon } from './FacebookIcon'
import { FileIcon } from './FileIcon'
import { FileQuestionIcon } from './FileQuestionIcon'
import { FileTextIcon } from './FileTextIcon'
import { FileUpIcon } from './FileUpIcon'
import { FileWarningIcon } from './FileWarningIcon'
import { FilledAlertIcon } from './FilledAlertIcon'
import { FocusLockIcon } from './FocusLockIcon'
import { FolderIcon } from './FolderIcon'
import { FolderLockIcon } from './FolderLockIcon'
import { FolderUploadIcon } from './FolderUploadIcon'
import { FrameIcon } from './FrameIcon'
import { FuelIcon } from './FuelIcon'
import { GithubIcon } from './GithubIcon'
import { GlobusIcon } from './GlobusIcon'
import { GripVerticalIcon } from './GripVerticalIcon'
import { GroupOneIcon } from './GroupOneIcon'
import { IconFileEdit } from './IconFileEdit'
import { ImageAvatarSparkleIcon } from './ImageAvatarSparkleIcon'
import { InfoCircleIcon } from './InfoCircleIcon'
import { InfoIcon } from './InfoIcon'
import { KeyboardUpIcon } from './KeyboardUpIcon'
import { LanguagesIcon } from './LanguagesIcon'
import { LaptopIcon } from './LaptopIcon'
import { LeafIcon } from './LeafIcon'
import { LightbulbIcon } from './LightbulbIcon'
import { LightningIcon } from './LightningIcon'
import { LinkedinIcon } from './LinkedinIcon'
import { LinkTwoOffIcon } from './LinkTwoOffIcon'
import { LockClosedIcon } from './LockClosedIcon'
import { LockKeyholeIcon } from './LockKeyholeIcon'
import { LockKeyholeOpenIcon } from './LockKeyholeOpenIcon'
import { LogoBoxIcon } from './LogoBoxIcon'
import { MagnifyingGlassIcon } from './MagnifyingGlassIcon'
import { MegaphoneIcon } from './MegaphoneIcon'
import { MenuIcon } from './MenuIcon'
import { NavigationXIcon } from './NavigationXIcon'
import { PadlockIcon } from './PadlockIcon'
import { PageCheckIcon } from './PageCheckIcon'
import { PanelRightIcon } from './PanelRightIcon'
import { PasteIcon } from './PasteIcon'
import { PencilIcon } from './PenciIcon'
import { PercentIcon } from './PercentIcon'
import { PictureIcon } from './PictureIcon'
import { PlusIcon } from './PlusIcon'
import { QrCodeIcon } from './QrCodeIcon'
import { RadioTowerIcon } from './RadioTowerIcon'
import { RedditIcon } from './RedditIcon'
import { RefreshCwIcon } from './RefreshCwIcon'
import { ResendNotificationBellIcon } from './ResendNotificationBellIcon'
import { SearchIcon } from './SearchIcon'
import { SeedphraseIcon } from './SeedphraseIcon'
import { SendIcon } from './SendIcon'
import { SettingsIcon } from './SettingsIcon'
import { ShapesPlusXSquareCircleIcon } from './ShapesPlusXSquareCircleIcon'
import { ShareAndroidIcon } from './ShareAndroidIcon'
import { ShareIcon } from './ShareIcon'
import { ShieldCheckFilledIcon } from './ShieldCheckFilledIcon'
import { ShieldCheckIcon } from './ShieldCheckIcon'
import { ShieldIcon } from './ShieldIcon'
import { ShieldVerifiedIcon } from './ShieldVerifiedIcon'
import { SmartphoneIcon } from './SmartphoneIcon'
import { SparkledPenIcon } from './SparkledPenIcon'
import { SquareArrowOutUpRightIcon } from './SquareArrowOutUpRightIcon'
import { SquareArrowTopRightIcon } from './SquareArrowTopRightIcon'
import { SquareBehindSquare4Icon } from './SquareBehindSquare4Icon'
import { SquareBehindSquare6Icon } from './SquareBehindSquare6Icon'
import { SquarePenIcon } from './SquarePenIcon'
import {
  StationArrowDownFromLineIcon,
  StationArrowsRotateCenterIcon,
  StationArrowToCornerTopRightIcon,
  StationCheckmarkSmallIcon,
  StationChevronLeftIcon,
  StationChevronRightSmallIcon,
  StationCirclePlusFilledIcon,
  StationCircleXmarkFilledIcon,
  StationCopies3FilledIcon,
  StationCreditCardIcon,
  StationLayers2FilledIcon,
  StationMagnifierIcon,
  StationWalletFilledIcon,
} from './StationFigmaIcons'
import { StopCircleIcon } from './StopCircleIcon'
import { SwapLoadingIcon } from './SwapLoadingIcon'
import { TabletSmartphoneIcon } from './TabletSmartphoneIcon'
import { TransactionApproveIcon } from './TransactionApproveIcon'
import { TransactionReceiveIcon } from './TransactionReceiveIcon'
import { TransactionSendIcon } from './TransactionSendIcon'
import { TransactionSwapIcon } from './TransactionSwapIcon'
import { TrashCanIcon } from './TrashCanIcon'
import { TrashIcon } from './TrashIcon'
import { TrashIcon2 } from './TrashIcon2'
import { TriangleAlertIcon } from './TriangleAlertIcon'
import { TronBandwidthIcon } from './TronBandwidthIcon'
import { TronEnergyIcon } from './TronEnergyIcon'
import { TrophyIcon } from './TrophyIcon'
import { TwitterIcon } from './TwitterIcon'
import { UserLockIcon } from './UserLockIcon'
import { WalletIcon } from './WalletIcon'
import { WandSparklesIcon } from './WandSparklesIcon'
import { WarningIcon } from './WarningIcon'
import { WhatsAppIcon } from './WhatsAppIcon'
import { ZapIcon } from './ZapIcon'

/**
 * Visual gallery of every icon in `lib/ui/icons`.
 * Added in the Icons V3 foundation (Phase 0) so reviewers can eyeball the full
 * set side by side during the V3 migration — see docs/icons-v3/PLAN.md.
 */
const vultisigIcons: Record<string, FC<SvgProps>> = {
  CaretDownIcon,
  AgentIcon,
  ArCubeIcon,
  ArrowDownIcon,
  ArrowLeftRightIcon,
  ArrowSplitIcon,
  ArrowUndoIcon,
  ArrowUpDownIcon,
  ArrowUpRightIcon,
  ArrowWallDownIcon,
  AsteriskIcon,
  BadgeCheckIcon,
  BellIcon,
  BookIcon,
  BooksIcon,
  BoxIcon,
  BrokenChainLink3Icon,
  BrowserExtensionIcon,
  BubbleQuestionIcon,
  CalendarClockIcon,
  CalendarIcon,
  CameraFilledIcon,
  CameraIcon,
  ChainLinkIcon3,
  CheckIcon,
  CheckmarkIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CircleAlertIcon,
  CircleCheckIcon,
  CircleCrossFilledIcon,
  CircleCrossIcon,
  CircleDollarSignIcon,
  CircleHelpIcon,
  CircleICloseIcon,
  CircleIcon,
  CircleInfoIcon,
  CircleMinusIcon,
  CirclePlusIcon,
  ClipboardCopyIcon,
  CloseIcon,
  CloudIcon,
  CloudOffIcon,
  CloudUploadIcon,
  CoSignIcon,
  CoinsAddIcon,
  CoinsIcon,
  ComputerUploadIcon,
  CopyIcon,
  CrossIcon,
  CryptoIcon,
  CryptoWalletPenIcon,
  CubeWithCornersIcon,
  DAppsIcon,
  DeviceIcon,
  DevicesIcon,
  DiscordIcon,
  DollarIcon,
  DownloadSeedphraseIcon,
  EmailIcon,
  EmailNotificationIcon,
  ExpandIcon,
  EyeClosedIcon,
  EyeIcon,
  EyeOffIcon,
  FacebookIcon,
  FileIcon,
  FileQuestionIcon,
  FileTextIcon,
  FileUpIcon,
  FileWarningIcon,
  FilledAlertIcon,
  FocusLockIcon,
  FolderIcon,
  FolderLockIcon,
  FolderUploadIcon,
  FrameIcon,
  FuelIcon,
  GithubIcon,
  GlobusIcon,
  GripVerticalIcon,
  GroupOneIcon,
  IconFileEdit,
  ImageAvatarSparkleIcon,
  InfoCircleIcon,
  InfoIcon,
  KeyboardUpIcon,
  LanguagesIcon,
  LaptopIcon,
  LeafIcon,
  LightbulbIcon,
  LightningIcon,
  LinkTwoOffIcon,
  LinkedinIcon,
  LockClosedIcon,
  LockKeyholeIcon,
  LockKeyholeOpenIcon,
  LogoBoxIcon,
  MagnifyingGlassIcon,
  MegaphoneIcon,
  MenuIcon,
  NavigationXIcon,
  PadlockIcon,
  PageCheckIcon,
  PanelRightIcon,
  PasteIcon,
  PencilIcon,
  PercentIcon,
  PictureIcon,
  PlusIcon,
  QrCodeIcon,
  RadioTowerIcon,
  RedditIcon,
  RefreshCwIcon,
  ResendNotificationBellIcon,
  SearchIcon,
  SeedphraseIcon,
  SendIcon,
  SettingsIcon,
  ShapesPlusXSquareCircleIcon,
  ShareAndroidIcon,
  ShareIcon,
  ShieldCheckFilledIcon,
  ShieldCheckIcon,
  ShieldIcon,
  ShieldVerifiedIcon,
  SmartphoneIcon,
  SparkledPenIcon,
  SquareArrowOutUpRightIcon,
  SquareArrowTopRightIcon,
  SquareBehindSquare4Icon,
  SquareBehindSquare6Icon,
  SquarePenIcon,
  StopCircleIcon,
  SwapLoadingIcon,
  TabletSmartphoneIcon,
  TransactionApproveIcon,
  TransactionReceiveIcon,
  TransactionSendIcon,
  TransactionSwapIcon,
  TrashCanIcon,
  TrashIcon,
  TrashIcon2,
  TriangleAlertIcon,
  TronBandwidthIcon,
  TronEnergyIcon,
  TrophyIcon,
  TwitterIcon,
  UserLockIcon,
  WalletIcon,
  WandSparklesIcon,
  WarningIcon,
  WhatsAppIcon,
  ZapIcon,
}

const stationV3Icons: Record<string, FC<SvgProps>> = {
  StationArrowsRotateCenterIcon,
  StationArrowToCornerTopRightIcon,
  StationCirclePlusFilledIcon,
  StationArrowDownFromLineIcon,
  StationMagnifierIcon,
  StationCircleXmarkFilledIcon,
  StationChevronLeftIcon,
  StationChevronRightSmallIcon,
  StationCheckmarkSmallIcon,
  StationCopies3FilledIcon,
  StationWalletFilledIcon,
  StationLayers2FilledIcon,
  StationCreditCardIcon,
}

const IconCell: FC<{ name: string; Icon: FC<SvgProps> }> = ({ name, Icon }) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 8,
      padding: 12,
      borderRadius: 8,
      border: '1px solid rgba(255,255,255,0.08)',
      textAlign: 'center',
    }}
  >
    <span style={{ fontSize: 28, lineHeight: 1, color: '#F0F4FC' }}>
      <Icon />
    </span>
    <span style={{ fontSize: 10, color: '#8295AE', wordBreak: 'break-all' }}>
      {name}
    </span>
  </div>
)

const IconGrid: FC<{ icons: Record<string, FC<SvgProps>> }> = ({ icons }) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(96px, 1fr))',
      gap: 12,
      padding: 24,
      background: '#02122B',
    }}
  >
    {Object.entries(icons).map(([name, Icon]) => (
      <IconCell key={name} name={name} Icon={Icon} />
    ))}
  </div>
)

const meta: Meta = {
  title: 'Foundation/Icons',
  parameters: { layout: 'fullscreen' },
}
export default meta

type Story = StoryObj

/** Every icon currently shipped in `lib/ui/icons` (the legacy + in-progress set). */
export const AllIcons: Story = {
  render: () => <IconGrid icons={vultisigIcons} />,
}

/**
 * The Station-branded icons, which are already drawn in the Icons V3 style.
 * They are the visual target the default set converges on during the migration.
 */
export const StationV3Preview: Story = {
  render: () => <IconGrid icons={stationV3Icons} />,
}
