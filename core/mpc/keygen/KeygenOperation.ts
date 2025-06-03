import { ReshareType } from './ReshareType'

export type KeygenOperation =
  | { operation: 'create' }
  | { operation: 'reshare'; type: ReshareType }
