import { StakeContract, StakeId } from './types'

export const stakeModeById: { [K in StakeId]: StakeContract } = {
  ruji: 'wasm',
  'native-tcy': 'memo',
  stcy: 'wasm',
}
