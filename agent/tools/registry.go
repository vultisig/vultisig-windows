package tools

import (
	"context"
	"errors"
	"fmt"

	"github.com/anthropics/anthropic-sdk-go"

	"github.com/vultisig/vultisig-win/agent/verifier"
	"github.com/vultisig/vultisig-win/storage"
	"github.com/vultisig/vultisig-win/tss"
)

var (
	ErrPasswordRequired     = errors.New("password required")
	ErrConfirmationRequired = errors.New("confirmation required")
	ErrToolNotFound         = errors.New("tool not found")
)

type ExecutionContext struct {
	AppCtx      context.Context
	Ctx         context.Context
	Vault       *storage.Vault
	VaultPubKey string
	Password    string
	Confirmed   bool
	AuthToken   string
	OnProgress  func(step string)
}

type Tool interface {
	Name() string
	Description() string
	InputSchema() map[string]any
	Execute(input map[string]any, ctx *ExecutionContext) (any, error)
	RequiresPassword() bool
	RequiresConfirmation() bool
}

type Registry struct {
	tools          map[string]Tool
	store          *storage.Store
	tss            *tss.TssService
	verifierClient *verifier.Client
	authGetter     AuthTokenGetter
}

func NewRegistry(store *storage.Store, tss *tss.TssService, verifierClient *verifier.Client) *Registry {
	r := &Registry{
		tools:          make(map[string]Tool),
		store:          store,
		tss:            tss,
		verifierClient: verifierClient,
	}

	r.registerTools()
	return r
}

func (r *Registry) SetAuthGetter(getter AuthTokenGetter) {
	r.authGetter = getter
	r.tools["sign_in_status"] = NewSignInStatusTool(getter)
}

func (r *Registry) registerTools() {
	toolList := []Tool{
		NewPluginListTool(r.verifierClient),
		NewPluginSpecTool(r.verifierClient),
		NewPluginInstalledTool(r.verifierClient),
		NewPluginInstallTool(r.verifierClient, r.store),
		NewAssetLookupTool(),
		NewGetMarketPriceTool(),
		NewVaultInfoTool(r.store),
		NewPolicyListTool(r.verifierClient),
		NewPolicyGenerateTool(),
		NewPolicyAddTool(r.verifierClient, r.tss),
		NewPolicyDeleteTool(r.verifierClient, r.tss),
		NewPolicyStatusTool(r.verifierClient),
		NewTransactionHistoryTool(r.verifierClient),
		NewPluginUninstallTool(r.verifierClient),

		NewGetChainsTool(),
		NewGetChainAddressTool(),
		NewGetBalancesTool(),
		NewGetPortfolioTool(),
		NewGetCoinsTool(),
		NewAddCoinTool(r.store),
		NewAddChainTool(r.store),
		NewRemoveChainTool(r.store),
		NewRemoveCoinTool(r.store),
		NewGetAddressBookTool(r.store),
		NewAddAddressBookEntryTool(r.store),
		NewRemoveAddressBookEntryTool(r.store),
		NewListVaultsTool(r.store),
		NewRenameVaultTool(r.store),
		NewInitiateSwapTool(),
		NewInitiateSendTool(),
	}

	for _, t := range toolList {
		r.tools[t.Name()] = t
	}
}

func (r *Registry) Execute(name string, input map[string]any, ctx *ExecutionContext) (any, error) {
	tool, ok := r.tools[name]
	if !ok {
		return nil, fmt.Errorf("%w: %s", ErrToolNotFound, name)
	}

	if tool.RequiresPassword() && ctx.Password == "" {
		return nil, ErrPasswordRequired
	}

	if tool.RequiresConfirmation() && !ctx.Confirmed {
		return nil, ErrConfirmationRequired
	}

	return tool.Execute(input, ctx)
}

func (r *Registry) GetToolDefinitions() []anthropic.ToolUnionParam {
	var defs []anthropic.ToolUnionParam

	for _, t := range r.tools {
		tool := anthropic.ToolUnionParamOfTool(
			anthropic.ToolInputSchemaParam{
				Properties: t.InputSchema(),
			},
			t.Name(),
		)
		desc := t.Description()
		tool.OfTool.Description = anthropic.String(desc)

		defs = append(defs, tool)
	}

	return defs
}

func (r *Registry) GetTool(name string) (Tool, bool) {
	t, ok := r.tools[name]
	return t, ok
}
