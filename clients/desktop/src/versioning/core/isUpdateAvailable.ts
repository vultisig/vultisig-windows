type IsUpdateAvailableInput = {
  local: string
  remote: string
}

export const isUpdateAvailable = ({
  local,
  remote,
}: IsUpdateAvailableInput) => {
  const [localSubVersions, remoteSubVersions] = [local, remote].map(v =>
    v.split('.').map(Number)
  )

  const firstDifferentIndex = remoteSubVersions.findIndex(
    (remote, i) => remote !== localSubVersions[i]
  )

  return (
    firstDifferentIndex >= 0 &&
    remoteSubVersions[firstDifferentIndex] >
      localSubVersions[firstDifferentIndex]
  )
}
