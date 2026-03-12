import type { Meta, StoryObj } from '@storybook/react-vite'

import { AgentMessageTimeline } from './AgentMessageTimeline'
import type { TimelineEntry } from './TimelineEntry'

const meta: Meta<typeof AgentMessageTimeline> = {
  title: 'Agent/AgentMessageTimeline',
  component: AgentMessageTimeline,
  parameters: {
    layout: 'centered',
    backgrounds: { default: 'dark' },
  },
  decorators: [
    Story => (
      <div style={{ width: 328, padding: 16 }}>
        <Story />
      </div>
    ),
  ],
}
export default meta

type Story = StoryObj<typeof AgentMessageTimeline>

const planningSteps: TimelineEntry[] = [
  {
    kind: 'step',
    id: 'analyzed',
    label: 'Analyzed for 9s',
    category: 'planning',
    iconType: 'loader',
  },
  {
    kind: 'step',
    id: 'plan',
    label: 'Prepared execution plan',
    category: 'planning',
    iconType: 'noteText',
  },
]

const swapProposalText =
  "I've prepared a swap proposal for you. I found the best route via THORChain with minimal slippage. Please review and approve."

const swapProposalStep: TimelineEntry = {
  kind: 'step',
  id: 'swap-proposal',
  label: 'Swap 10 ETH → USDC',
  description: 'Route: THORChain\nEst. Fee: 0.001 ETH',
  category: 'proposing',
  iconType: 'proposalCube',
}

export const Analyzing: Story = {
  args: {
    entries: [],
    isAnalyzing: true,
  },
}

export const AnalyzedWithPlan: Story = {
  args: {
    entries: [...planningSteps, { kind: 'content', text: swapProposalText }],
    analysisDuration: 9,
  },
}

export const Proposing: Story = {
  args: {
    entries: [
      ...planningSteps,
      { kind: 'content', text: swapProposalText },
      swapProposalStep,
      { kind: 'content', text: 'Should I execute the swap?' },
    ],
    analysisDuration: 9,
  },
}

export const ApproveProposal: Story = {
  args: {
    entries: [
      {
        kind: 'step',
        id: 'analyzed',
        label: 'Analyzed for 9s',
        category: 'planning',
        iconType: 'loader',
      },
      {
        kind: 'step',
        id: 'plan',
        label: 'Prepared execution plan',
        category: 'planning',
        iconType: 'noteText',
      },
      { kind: 'content', text: swapProposalText },
      {
        kind: 'step',
        id: 'approve',
        label: 'Approve 1000 USDT',
        description: 'Gas: 0.002 ETH',
        category: 'proposing',
        iconType: 'proposalCube',
      },
    ],
    analysisDuration: 9,
  },
}

export const SendProposal: Story = {
  args: {
    entries: [
      ...planningSteps,
      { kind: 'content', text: swapProposalText },
      {
        kind: 'step',
        id: 'send',
        label: 'Send 10 ETH to 0xABC...',
        category: 'proposing',
        iconType: 'arrowUp',
      },
    ],
    analysisDuration: 9,
  },
}

export const ExecutingSwap: Story = {
  args: {
    entries: [
      {
        kind: 'step',
        id: 'executing',
        label: 'Executing swap',
        description: 'Broadcasting to Ethereum.',
        category: 'executing',
        iconType: 'swapArrows',
        isActive: true,
      },
    ],
    isAnalyzing: false,
  },
}

export const SendingFunds: Story = {
  args: {
    entries: [
      {
        kind: 'step',
        id: 'sending',
        label: 'Sending funds',
        description: 'Transmitting 0.5 ETH to 0xABC...',
        category: 'executing',
        iconType: 'arrowUp',
        isActive: true,
      },
    ],
    isAnalyzing: false,
  },
}

export const SwapCompleted: Story = {
  args: {
    entries: [
      {
        kind: 'step',
        id: 'completed',
        label: 'Swap completed',
        description: '10 ETH → 18,940 USDC',
        category: 'success',
        iconType: 'check',
      },
    ],
  },
}

export const SwapExecutedWithBalance: Story = {
  args: {
    entries: [
      {
        kind: 'step',
        id: 'swap-done',
        label: 'Swap executed',
        category: 'success',
        iconType: 'check',
      },
      { kind: 'content', text: 'New balance:' },
      {
        kind: 'step',
        id: 'balance',
        label: 'ETH: 0.004\nUSDC: 5,000',
        category: 'balance',
        iconType: 'wallet',
      },
    ],
  },
}

export const FundsSent: Story = {
  args: {
    entries: [
      {
        kind: 'step',
        id: 'sent',
        label: 'Funds sent',
        description: '0.5 ETH to 0xABC...',
        category: 'success',
        iconType: 'check',
      },
    ],
  },
}

export const ExecutionError: Story = {
  args: {
    entries: [
      {
        kind: 'step',
        id: 'error-gas',
        label: 'Execution failed',
        description: 'Insufficient gas.',
        category: 'error',
        iconType: 'warning',
      },
    ],
  },
}

export const InvalidAddress: Story = {
  args: {
    entries: [
      {
        kind: 'step',
        id: 'error-addr',
        label: 'Invalid address',
        description: 'The provided address is not valid.',
        category: 'error',
        iconType: 'warning',
      },
    ],
  },
}

export const NetworkUnavailable: Story = {
  args: {
    entries: [
      {
        kind: 'step',
        id: 'error-net',
        label: 'Network unavailable',
        description: 'Unable to reach Ethereum node.',
        category: 'error',
        iconType: 'warning',
      },
    ],
  },
}

export const RecurringSwap: Story = {
  args: {
    entries: [
      {
        kind: 'step',
        id: 'recurring',
        label: 'Recurring swap active',
        description: 'Runs every hour.',
        category: 'recurring',
        iconType: 'chatNotification',
      },
    ],
  },
}

export const Reminder: Story = {
  args: {
    entries: [
      {
        kind: 'step',
        id: 'reminder',
        label: 'Reminder',
        description: 'Meeting at two.\nScheduled yesterday at 14:00.',
        category: 'recurring',
        iconType: 'chatNotification',
      },
    ],
  },
}

export const PluginInstalled: Story = {
  args: {
    entries: [
      {
        kind: 'step',
        id: 'plugin',
        label: 'Plugin installed',
        description: 'Recurring swaps is now active.',
        category: 'plugin',
        iconType: 'plugin',
      },
    ],
  },
}

export const BalanceUpdate: Story = {
  args: {
    entries: [
      {
        kind: 'step',
        id: 'balance',
        label: 'Balance update',
        description: 'ETH: 0.004\nUSDC: 5,000',
        category: 'balance',
        iconType: 'wallet',
      },
    ],
  },
}

export const TransactionHistory: Story = {
  args: {
    entries: [
      {
        kind: 'step',
        id: 'tx-history',
        label: 'Transaction history',
        description:
          'Last swap:\n10 ETH → 18,940 USDC\n2 days ago • Fee 0.001 ETH',
        category: 'history',
        iconType: 'historyRefresh',
      },
    ],
  },
}

export const PluginHistory: Story = {
  args: {
    entries: [
      {
        kind: 'step',
        id: 'plugin-history',
        label: 'Plugin history',
        description: 'Recurring swaps installed\nMarch 12 • 14:23 CET',
        category: 'history',
        iconType: 'historyRefresh',
      },
    ],
  },
}

export const AutomationRun: Story = {
  args: {
    entries: [
      {
        kind: 'step',
        id: 'automation',
        label: 'Automation run',
        description: 'DCA executed\nToday • 09:00\n10 USDC → BTC',
        category: 'history',
        iconType: 'historyRefresh',
      },
    ],
  },
}

export const AllPlanningSteps: Story = {
  args: {
    entries: [
      {
        kind: 'step',
        id: 'analyzed',
        label: 'Analyzed for 9s',
        category: 'planning',
        iconType: 'loader',
      },
      {
        kind: 'step',
        id: 'plan',
        label: 'Prepared execution plan',
        category: 'planning',
        iconType: 'noteText',
      },
      {
        kind: 'step',
        id: 'route',
        label: 'Simulating route',
        category: 'planning',
        iconType: 'scroll',
      },
      {
        kind: 'step',
        id: 'fees',
        label: 'Calculating fees',
        category: 'planning',
        iconType: 'calculator',
      },
      {
        kind: 'step',
        id: 'scan',
        label: 'Security scan',
        category: 'planning',
        iconType: 'scanCube',
      },
      {
        kind: 'step',
        id: 'build',
        label: 'Building transaction',
        category: 'planning',
        iconType: 'buildingBlock',
      },
    ],
    analysisDuration: 9,
  },
}

export const FullSwapFlow: Story = {
  args: {
    entries: [
      {
        kind: 'step',
        id: 'analyzed',
        label: 'Analyzed for 9s',
        category: 'planning',
        iconType: 'loader',
      },
      {
        kind: 'step',
        id: 'plan',
        label: 'Prepared execution plan',
        category: 'planning',
        iconType: 'noteText',
      },
      {
        kind: 'content',
        text: "I've prepared a swap proposal for you. I found the best route via THORChain with minimal slippage. Please review and approve.",
      },
      {
        kind: 'step',
        id: 'proposal',
        label: 'Swap 10 ETH → USDC',
        description: 'Route: THORChain\nEst. Fee: 0.001 ETH',
        category: 'proposing',
        iconType: 'proposalCube',
      },
      { kind: 'content', text: 'Should I execute the swap?' },
    ],
    analysisDuration: 9,
  },
}

export const ContractApproval: Story = {
  args: {
    entries: [
      {
        kind: 'step',
        id: 'analyzed',
        label: 'Analyzed for 9s',
        category: 'planning',
        iconType: 'loader',
      },
      {
        kind: 'content',
        text: 'Building USDT approve transaction to set allowance to 500 for spender 0x3jDH72be394JeDs932',
      },
      {
        kind: 'step',
        id: 'build-custom',
        label: 'Building custom transaction',
        category: 'planning',
        iconType: 'noteText',
      },
      {
        kind: 'step',
        id: 'scan',
        label: 'Security scan: ethereum',
        category: 'planning',
        iconType: 'scanCube',
      },
      {
        kind: 'step',
        id: 'approve-details',
        label: 'Approve 500 USDT',
        description:
          'Spender: 0x3jDH72be394JeDs932...\nChain: Ethereum\nSecurity scan: No issues detected\nGas estimate: 0.002 ETH',
        category: 'proposing',
        iconType: 'proposalCube',
      },
      {
        kind: 'content',
        text: 'USDC approve transaction is ready! Ready to sign when you are.',
      },
    ],
    analysisDuration: 9,
  },
}

export const SavingReminder: Story = {
  args: {
    entries: [
      {
        kind: 'step',
        id: 'saving',
        label: 'Saving reminder',
        description: 'Scheduling notification...',
        category: 'executing',
        iconType: 'chatNotification',
        isActive: true,
      },
    ],
    isAnalyzing: false,
  },
}
