package tools

import (
	"encoding/json"

	"github.com/vultisig/vultisig-win/agent/toolbridge"
)

type BridgedTool struct {
	name                 string
	description          string
	inputSchema          map[string]any
	requiresPassword     bool
	requiresConfirmation bool
}

func NewBridgedTool(name, description string, inputSchema map[string]any, requiresPassword, requiresConfirmation bool) *BridgedTool {
	return &BridgedTool{
		name:                 name,
		description:          description,
		inputSchema:          inputSchema,
		requiresPassword:     requiresPassword,
		requiresConfirmation: requiresConfirmation,
	}
}

func (t *BridgedTool) Name() string        { return t.name }
func (t *BridgedTool) Description() string  { return t.description }
func (t *BridgedTool) InputSchema() map[string]any { return t.inputSchema }
func (t *BridgedTool) RequiresPassword() bool      { return t.requiresPassword }
func (t *BridgedTool) RequiresConfirmation() bool   { return t.requiresConfirmation }

func (t *BridgedTool) Execute(input map[string]any, ctx *ExecutionContext) (any, error) {
	coins := make([]toolbridge.CoinInfo, 0, len(ctx.Vault.Coins))
	for _, c := range ctx.Vault.Coins {
		coins = append(coins, toolbridge.CoinInfo{
			Chain:           c.Chain,
			Ticker:          c.Ticker,
			Address:         c.Address,
			ContractAddress: c.ContractAddress,
			Decimals:        int(c.Decimals),
			Logo:            c.Logo,
			PriceProviderID: c.PriceProviderID,
			IsNativeToken:   c.IsNativeToken,
		})
	}

	req := toolbridge.ToolRequest{
		ToolName: t.name,
		Input:    input,
		Context: toolbridge.ToolContext{
			VaultPubKey: ctx.VaultPubKey,
			VaultName:   ctx.Vault.Name,
			AuthToken:   ctx.AuthToken,
			Coins:       coins,
		},
	}

	resp, err := toolbridge.RequestToolExecution(ctx.AppCtx, ctx.Ctx, req)
	if err != nil {
		return nil, err
	}

	if resp.VaultModified {
		ctx.VaultModified = true
	}

	var result any
	err = json.Unmarshal([]byte(resp.Result), &result)
	if err != nil {
		return resp.Result, nil
	}

	return result, nil
}
