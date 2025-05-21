export const deriveThorchainActionFromMemo = (memo: string) => {
  if (memo.startsWith('merge:')) {
    return 'merge'
  }

  if (memo.includes('tcy')) {
    return 'tcy'
  }

  return 'unknown'
}
