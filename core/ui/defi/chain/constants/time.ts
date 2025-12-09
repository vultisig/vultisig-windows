export const nanosecondsInSecond = 1_000_000_000

const secondsInMinute = 60
const minutesInHour = 60
const hoursInDay = 24
const secondsInHour = secondsInMinute * minutesInHour
export const secondsInDay = secondsInHour * hoursInDay

export const daysInYear = 365.25
export const thorchainBlockTimeSeconds = 6
export const blocksPerDay = secondsInDay / thorchainBlockTimeSeconds
