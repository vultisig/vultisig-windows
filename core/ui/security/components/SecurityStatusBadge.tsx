import { BlockaidResultTypes } from '@core/config/security/blockaid/constants'
import { BlockaidScanResult } from '@core/config/security/blockaid/types'
import { useBlockaidEnabledQuery } from '@core/ui/storage/blockaid'
import { Spinner } from '@lib/ui/loaders/Spinner'

export const SecurityStatusBadge = ({
  scanResult,
}: {
  scanResult?: BlockaidScanResult
}) => {
  const query = useBlockaidEnabledQuery()

  if (query.isFetching) return <Spinner size={12} />

  if (!scanResult) return null

  const validation = scanResult.validation
  if (validation?.result_type === BlockaidResultTypes.Warning) {
    return <span className="text-yellow-600">⚠️ Warning</span>
  }

  if (validation?.result_type === BlockaidResultTypes.Malicious) {
    return <span className="text-red-600">🚨 Malicious</span>
  }

  return <span className="text-green-600">✅ Safe</span>
}
