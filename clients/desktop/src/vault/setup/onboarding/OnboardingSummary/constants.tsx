import { ArrowSplitIcon } from '../../../../lib/ui/icons/ArrowSplitIcon';
import { CloudStackIcon } from '../../../../lib/ui/icons/CloudStackIcon';
import { CloudWithToolkeyIcon } from '../../../../lib/ui/icons/CloudWithToolkeyIcon';
import { TriangleExclamationIcon } from '../../../../lib/ui/icons/TriangleExclamationIcon';

export const SUMMARY_ITEMS = [
  {
    title: 'summaryItemOneTitle',
    icon: CloudWithToolkeyIcon,
  },
  {
    title: 'summaryItemTwoTitle',
    icon: ArrowSplitIcon,
  },
  {
    title: 'summaryItemThreeTitle',
    icon: CloudStackIcon,
  },
  {
    title: 'summaryItemFourTitle',
    icon: () => (
      <div style={{ fontSize: 24 }}>
        <TriangleExclamationIcon />
      </div>
    ),
  },
];
