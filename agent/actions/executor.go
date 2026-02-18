package actions

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/vultisig/vultisig-win/agent/backend"
	"github.com/vultisig/vultisig-win/agent/portfoliobridge"
	"github.com/vultisig/vultisig-win/agent/toolbridge"
	"github.com/vultisig/vultisig-win/agent/tools"
	"github.com/vultisig/vultisig-win/storage"
)

type PasswordProvider func() (string, error)
type ConfirmProvider func(action, details string) (bool, error)
type ProgressCallback func(step string)

type Executor struct {
	store        *storage.Store
	toolRegistry *tools.Registry
}

func NewExecutor(store *storage.Store, toolRegistry *tools.Registry) *Executor {
	return &Executor{
		store:        store,
		toolRegistry: toolRegistry,
	}
}

type ExecuteParams struct {
	AppCtx     context.Context
	Ctx        context.Context
	Vault      *storage.Vault
	AuthToken  string
	Password   string
	Confirmed  bool
	OnProgress ProgressCallback
}

func (e *Executor) Execute(action backend.Action, params *ExecuteParams) (*backend.ActionResult, error) {
	result := &backend.ActionResult{
		Action:   action.Type,
		ActionID: action.ID,
	}

	data, err := e.dispatch(action, params)
	if err != nil {
		result.Success = false
		result.Error = err.Error()
		return result, nil
	}

	result.Success = true
	result.Data = data
	return result, nil
}

func (e *Executor) dispatch(action backend.Action, params *ExecuteParams) (map[string]any, error) {
	switch action.Type {
	case "get_market_price":
		return e.executeBridged("get_market_price", action.Params, params)
	case "get_balances":
		return e.executeGetBalances(action.Params, params)
	case "get_portfolio":
		return e.executeGetPortfolio(params)
	case "add_chain":
		return e.executeBridged("add_chain", action.Params, params)
	case "add_coin":
		return e.executeBridged("add_coin", action.Params, params)
	case "remove_coin":
		return e.executeBridged("remove_coin", action.Params, params)
	case "remove_chain":
		return e.executeBridged("remove_chain", action.Params, params)
	case "search_token":
		return e.executeBridged("search_token", action.Params, params)
	case "initiate_send":
		return e.executeBridged("initiate_send", action.Params, params)
	case "rename_vault":
		return e.executeBridged("rename_vault", action.Params, params)
	case "list_vaults":
		return e.executeBridged("list_vaults", action.Params, params)
	case "address_book_add":
		return e.executeBridged("add_address_book_entry", action.Params, params)
	case "address_book_remove":
		return e.executeBridged("remove_address_book_entry", action.Params, params)
	case "plugin_install":
		return e.executeGoTool("plugin_install", action.Params, params)
	case "create_policy":
		return e.executeGoTool("policy_add", action.Params, params)
	case "delete_policy":
		return e.executeGoTool("policy_delete", action.Params, params)
	case "sign_swap_tx":
		return e.executeGoTool("sign_swap_tx", action.Params, params)
	default:
		return nil, fmt.Errorf("unknown action type: %s", action.Type)
	}
}

func (e *Executor) executeBridged(toolName string, actionParams map[string]any, params *ExecuteParams) (map[string]any, error) {
	input := make(map[string]any)
	for k, v := range actionParams {
		input[k] = v
	}

	coins := make([]toolbridge.CoinInfo, 0, len(params.Vault.Coins))
	for _, c := range params.Vault.Coins {
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
		ToolName: toolName,
		Input:    input,
		Context: toolbridge.ToolContext{
			VaultPubKey: params.Vault.PublicKeyECDSA,
			VaultName:   params.Vault.Name,
			AuthToken:   params.AuthToken,
			Coins:       coins,
		},
	}

	resp, err := toolbridge.RequestToolExecution(params.AppCtx, params.Ctx, req)
	if err != nil {
		return nil, err
	}

	var result map[string]any
	if err := json.Unmarshal([]byte(resp.Result), &result); err != nil {
		return map[string]any{"result": resp.Result}, nil
	}
	return result, nil
}

func (e *Executor) executeGoTool(toolName string, actionParams map[string]any, params *ExecuteParams) (map[string]any, error) {
	input := make(map[string]any)
	for k, v := range actionParams {
		input[k] = v
	}

	ctx := &tools.ExecutionContext{
		AppCtx:      params.AppCtx,
		Ctx:         params.Ctx,
		Vault:       params.Vault,
		VaultPubKey: params.Vault.PublicKeyECDSA,
		Password:    params.Password,
		Confirmed:   params.Confirmed,
		AuthToken:   params.AuthToken,
		OnProgress:  params.OnProgress,
	}

	result, err := e.toolRegistry.Execute(toolName, input, ctx)
	if err != nil {
		return nil, err
	}

	return toMapAny(result), nil
}

func (e *Executor) executeGetBalances(actionParams map[string]any, params *ExecuteParams) (map[string]any, error) {
	input := make(map[string]any)
	for k, v := range actionParams {
		input[k] = v
	}

	ctx := &tools.ExecutionContext{
		AppCtx:      params.AppCtx,
		Ctx:         params.Ctx,
		Vault:       params.Vault,
		VaultPubKey: params.Vault.PublicKeyECDSA,
	}

	result, err := e.toolRegistry.Execute("get_balances", input, ctx)
	if err != nil {
		return nil, err
	}

	return toMapAny(result), nil
}

func (e *Executor) executeGetPortfolio(params *ExecuteParams) (map[string]any, error) {
	resp, err := portfoliobridge.RequestPortfolio(params.AppCtx, params.Ctx, params.Vault.PublicKeyECDSA)
	if err != nil {
		return nil, err
	}

	var result map[string]any
	raw, _ := json.Marshal(resp)
	_ = json.Unmarshal(raw, &result)
	return result, nil
}

func (e *Executor) NeedsPassword(actionType string) bool {
	switch actionType {
	case "plugin_install", "create_policy", "delete_policy", "sign_swap_tx":
		return true
	default:
		return false
	}
}

func (e *Executor) NeedsConfirmation(actionType string) bool {
	switch actionType {
	case "plugin_install", "create_policy", "delete_policy":
		return true
	default:
		return false
	}
}

func toMapAny(v any) map[string]any {
	if m, ok := v.(map[string]any); ok {
		return m
	}
	raw, err := json.Marshal(v)
	if err != nil {
		return map[string]any{"result": fmt.Sprintf("%v", v)}
	}
	var result map[string]any
	if err := json.Unmarshal(raw, &result); err != nil {
		return map[string]any{"result": string(raw)}
	}
	return result
}
