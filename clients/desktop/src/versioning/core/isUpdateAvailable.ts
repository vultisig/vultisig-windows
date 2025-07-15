type IsUpdateAvailableInput = {
  current: string
  latest: string
}

export const isUpdateAvailable = ({
  current,
  latest,
}: IsUpdateAvailableInput) => {
  const [currentSubVersions, latestSubVersions] = [current, latest].map(v =>
    v.split('.').map(Number)
  )

  const firstDifferentIndex = latestSubVersions.findIndex(
    (latest, i) => latest !== currentSubVersions[i]
  )

  return (
    firstDifferentIndex >= 0 &&
    latestSubVersions[firstDifferentIndex] >
      currentSubVersions[firstDifferentIndex]
  )
}
