package tools

import (
	"fmt"

	"github.com/vultisig/vultisig-win/agent/shared"
)

func enrichPolicyFields(policy map[string]any, config map[string]any) {
	if config == nil {
		return
	}

	if assetObj, ok := config["asset"].(map[string]any); ok {
		chain, token, ticker := resolveAssetObj(assetObj)
		if ticker != "" {
			policy["from_asset"] = ticker
			policy["fromAsset"] = ticker
			policy["from_chain"] = chain
		}
		if recipients, ok := config["recipients"].([]any); ok && len(recipients) > 0 {
			if r, ok := recipients[0].(map[string]any); ok {
				if addr, ok := r["toAddress"]; ok {
					policy["to_address"] = fmt.Sprintf("%v", addr)
				}
				if amt, ok := r["amount"]; ok {
					policy["amount"] = shared.FormatHumanAmount(fmt.Sprintf("%v", amt), chain, token)
				}
			}
		}
	} else {
		fromChain, fromToken, fromTicker := resolveConfigAsset(config, "from")
		if fromTicker != "" {
			policy["from_asset"] = fromTicker
			policy["fromAsset"] = fromTicker
			policy["from_chain"] = fromChain
		}

		toChain, _, toTicker := resolveConfigAsset(config, "to")
		if toTicker != "" {
			policy["to_asset"] = toTicker
			policy["toAsset"] = toTicker
			policy["to_chain"] = toChain
		}

		if rawAmount, ok := config["fromAmount"]; ok {
			amountStr := fmt.Sprintf("%v", rawAmount)
			policy["amount"] = shared.FormatHumanAmount(amountStr, fromChain, fromToken)
		}
	}

	if freq, ok := config["frequency"]; ok {
		policy["frequency"] = fmt.Sprintf("%v", freq)
		policy["schedule"] = fmt.Sprintf("%v", freq)
	}
}

func resolveAssetObj(obj map[string]any) (chain, token, ticker string) {
	chain = fmt.Sprintf("%v", obj["chain"])
	if t, ok := obj["token"]; ok && t != nil {
		token = fmt.Sprintf("%v", t)
	}
	ticker = shared.ResolveTickerByChainAndToken(chain, token)
	return chain, token, ticker
}

func resolveConfigAsset(config map[string]any, field string) (chain, token, ticker string) {
	raw, ok := config[field]
	if !ok {
		return "", "", ""
	}
	obj, ok := raw.(map[string]any)
	if !ok {
		return "", "", ""
	}
	return resolveAssetObj(obj)
}
