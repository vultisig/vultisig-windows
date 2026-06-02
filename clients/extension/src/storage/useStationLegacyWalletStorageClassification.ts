import { useEffect, useState } from 'react'

import {
  getEmptyStationLegacyWalletStorageClassification,
  getStationLegacyWalletStorageClassification,
} from './stationLegacyWalletStorageSnapshot'

type UseStationLegacyWalletStorageClassificationInput = {
  enabled: boolean
}

export const useStationLegacyWalletStorageClassification = ({
  enabled,
}: UseStationLegacyWalletStorageClassificationInput) => {
  const [classification, setClassification] = useState(() =>
    enabled
      ? getStationLegacyWalletStorageClassification()
      : getEmptyStationLegacyWalletStorageClassification()
  )

  useEffect(() => {
    if (!enabled) {
      setClassification(getEmptyStationLegacyWalletStorageClassification())
      return
    }

    setClassification(getStationLegacyWalletStorageClassification())

    const refreshClassification = () => {
      setClassification(getStationLegacyWalletStorageClassification())
    }

    window.addEventListener('storage', refreshClassification)

    return () => {
      window.removeEventListener('storage', refreshClassification)
    }
  }, [enabled])

  return classification
}
