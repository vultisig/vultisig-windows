import React from 'react'
import { SafeAreaView } from 'react-native'

import { Button } from '../../lib/ui/components/Button'

const NoVaultPage = () => {
  return (
    <SafeAreaView
      style={{
        backgroundColor: 'white',
        flex: 1,
      }}
    >
      <Button kind="primary">Yo</Button>
    </SafeAreaView>
  )
}

export default NoVaultPage
