export type MobileTssModuleEvents = {
  onChange: (params: ChangeEventPayload) => void
  onProgress: (params: ProgressEventPayload) => void
  onError: (params: ErrorEventPayload) => void
}

export type ChangeEventPayload = {
  value: string
}

export type ProgressEventPayload = {
  value: string
}

export type ErrorEventPayload = {
  error: string
}
