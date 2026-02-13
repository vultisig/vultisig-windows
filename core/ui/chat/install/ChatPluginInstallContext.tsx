import { createContext, useContext } from 'react'

type ChatPluginInstallContextValue = {
  accessToken: string
  pluginId: string
}

const ChatPluginInstallContext = createContext<ChatPluginInstallContextValue>({
  accessToken: '',
  pluginId: '',
})

export const ChatPluginInstallProvider = ChatPluginInstallContext.Provider
export const useChatPluginInstall = () => useContext(ChatPluginInstallContext)
