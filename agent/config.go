package agent

import (
	"github.com/vultisig/vultisig-win/agent/shared"
)

func GetVerifierURL() string {
	return shared.GetVerifierURL()
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
