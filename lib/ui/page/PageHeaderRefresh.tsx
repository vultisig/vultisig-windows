import { RefreshCwIcon } from '@lib/ui/icons/RefreshCwIcon'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { PageHeaderIconButton } from '@lib/ui/page/PageHeaderIconButton'
import { OnClickProp } from '@lib/ui/props'

type PageHeaderRefreshProps = OnClickProp & {
  isPending?: boolean
}

export const PageHeaderRefresh: React.FC<PageHeaderRefreshProps> = ({
  onClick,
  isPending,
}) => (
  <PageHeaderIconButton
    onClick={onClick}
    icon={isPending ? <Spinner /> : <RefreshCwIcon />}
  />
)
