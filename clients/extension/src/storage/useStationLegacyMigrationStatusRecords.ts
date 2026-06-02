import { useEffect, useState } from 'react'

import {
  getStationLegacyMigrationStatusRecords,
  StationLegacyMigrationStatusRecords,
  stationLegacyMigrationStatusStorageKey,
} from './stationLegacyMigrationStatus'

type UseStationLegacyMigrationStatusRecordsInput = {
  enabled: boolean
}

export const useStationLegacyMigrationStatusRecords = ({
  enabled,
}: UseStationLegacyMigrationStatusRecordsInput) => {
  const [records, setRecords] = useState<StationLegacyMigrationStatusRecords>(
    {}
  )

  useEffect(() => {
    if (!enabled || typeof chrome === 'undefined') {
      setRecords({})
      return
    }

    const refreshRecords = () => {
      getStationLegacyMigrationStatusRecords().then(setRecords)
    }

    refreshRecords()

    const onChromeStorageChanged = (
      changes: Record<string, chrome.storage.StorageChange>,
      areaName: string
    ) => {
      if (
        areaName === 'local' &&
        stationLegacyMigrationStatusStorageKey in changes
      ) {
        refreshRecords()
      }
    }

    chrome.storage.onChanged?.addListener(onChromeStorageChanged)

    return () => {
      chrome.storage.onChanged?.removeListener(onChromeStorageChanged)
    }
  }, [enabled])

  return records
}
