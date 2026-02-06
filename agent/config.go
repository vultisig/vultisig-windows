package agent

import (
	"github.com/vultisig/vultisig-win/agent/shared"
)

const ClaudeModel = shared.ClaudeModel

func GetVerifierURL() string {
	return shared.GetVerifierURL()
}

func GetClaudeAPIKey() string {
	return shared.GetClaudeAPIKey()
}

func ResolvePluginID(input string) string {
	return shared.ResolvePluginID(input)
}

func GetPluginName(input string) string {
	return shared.GetPluginName(input)
}

func ResolveAsset(input string) *shared.AssetInfo {
	return shared.ResolveAsset(input)
}
