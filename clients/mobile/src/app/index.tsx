import React from 'react'
import { SafeAreaView } from 'react-native'
import { useTheme } from 'styled-components/native'

import { Text } from '../lib/ui/components/Text'

const VaultPage = () => {
  return (
    <SafeAreaView>
      <Text size={24} color="regular" centerHorizontally>
        Hello World
      </Text>
    </SafeAreaView>
  )
}

export default VaultPage
