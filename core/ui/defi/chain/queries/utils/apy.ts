import { daysInYear } from '../../constants/time'

export const convertAPYtoAPR = (apyPercent: number) => {
  if (!apyPercent || apyPercent <= 0) return 0
  const apyDecimal = apyPercent / 100
  const dailyRate = Math.pow(1 + apyDecimal, 1 / daysInYear) - 1
  return dailyRate * daysInYear * 100
}
