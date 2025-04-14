import { RefreshIcon } from '@lib/ui/icons/RefreshIcon'
import { PageHeaderIconButton } from '@lib/ui/page/PageHeaderIconButton'
import { OnClickProp } from '@lib/ui/props'

import { Spinner } from '../../lib/ui/loaders/Spinner'

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
