import { RefreshIcon } from '@lib/ui/icons/RefreshIcon'
import { OnClickProp } from '@lib/ui/props'

import { Spinner } from '../../lib/ui/loaders/Spinner'
import { PageHeaderIconButton } from './PageHeaderIconButton'

type PageHeaderRefreshProps = OnClickProp & {
  isPending?: boolean
}

export const PageHeaderRefresh: React.FC<PageHeaderRefreshProps> = ({
  onClick,
  isPending,
}) => (
  <PageHeaderIconButton
    onClick={onClick}
    icon={isPending ? <Spinner /> : <RefreshIcon />}
  />
)
