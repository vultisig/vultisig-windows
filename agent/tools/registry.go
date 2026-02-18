package tools

import (
	"context"
	"errors"
	"fmt"
	"time"

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
	AppCtx        context.Context
	Ctx           context.Context
	Vault         *storage.Vault
	VaultPubKey   string
	Password      string
	Confirmed     bool
	AuthToken     string
	OnProgress    func(step string)
	VaultModified bool
}

type AuthTokenGetter interface {
	GetCachedAuthToken(vaultPubKey string) (token string, expiresAt time.Time, ok bool)
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

func (r *Registry) SetAuthGetter(_ AuthTokenGetter) {
	r.tools["sign_in_status"] = NewBridgedTool("sign_in_status",
		"Check if the vault is signed in to the verifier and get token expiry information.",
		map[string]any{}, false, false)
}

func (r *Registry) registerTools() {
	goTools := []Tool{
		NewPluginInstallTool(r.verifierClient, r.store),
		NewPolicyAddTool(r.verifierClient, r.tss),
		NewPolicyDeleteTool(r.verifierClient, r.tss),
		NewSignTxTool(r.tss),

		NewGetBalancesTool(),
		NewGetPortfolioTool(),
	}

	for _, t := range goTools {
		r.tools[t.Name()] = t
	}

	bridgedTools := []Tool{
		NewBridgedTool("vault_info",
			"Get information about the current vault including addresses and tracked coins.",
			map[string]any{}, false, false),
		NewBridgedTool("get_chains",
			"Get all blockchain chains in the current vault with their addresses. Returns a list of chains with the wallet address for each.",
			map[string]any{}, false, false),
		NewBridgedTool("get_chain_address",
			"Get the wallet address for a specific blockchain chain in the CURRENT active vault only. For other vaults, use list_vaults which returns chain_addresses for all vaults.",
			map[string]any{
				"chain": map[string]any{"type": "string", "description": "The blockchain chain name (e.g., 'Ethereum', 'Bitcoin', 'Solana', 'BSC')"},
			}, false, false),
		NewBridgedTool("get_coins",
			"List coins/tokens tracked in the current vault. Optionally filter by chain. Returns chain, ticker, address, and whether it's a native token or ERC-20/SPL token.",
			map[string]any{
				"chain": map[string]any{"type": "string", "description": "Optional chain to filter by (e.g., 'Ethereum', 'Bitcoin', 'Solana'). If omitted, returns coins from all chains."},
			}, false, false),
		NewBridgedTool("remove_coin",
			"Remove a coin/token from the current vault. Provide either the coin ID directly, or the chain and ticker to identify the coin.",
			map[string]any{
				"coin_id": map[string]any{"type": "string", "description": "The unique ID of the coin to remove"},
				"chain":   map[string]any{"type": "string", "description": "The blockchain chain (use with ticker to identify coin)"},
				"ticker":  map[string]any{"type": "string", "description": "The token ticker symbol (use with chain to identify coin)"},
			}, false, false),
		NewBridgedTool("remove_chain",
			"Remove a blockchain chain and all its coins/tokens from the current vault.",
			map[string]any{
				"chain": map[string]any{"type": "string", "description": "The blockchain chain name to remove (e.g., 'Sui', 'Solana', 'Ethereum')"},
			}, false, false),
		NewBridgedTool("list_vaults",
			"List all vaults the user has. Returns vault names, chain addresses, and identifies the currently active vault. Use this to look up addresses for any vault (e.g., 'send to my Other vault').",
			map[string]any{}, false, false),
		NewBridgedTool("get_address_book",
			"Get all saved addresses from the address book. Returns a list of saved addresses with their titles, blockchain chains, and addresses.",
			map[string]any{}, false, false),
		NewBridgedTool("add_address_book_entry",
			"Add a new address to the address book. Useful for saving frequently used recipient addresses.",
			map[string]any{
				"title":   map[string]any{"type": "string", "description": "A friendly name/label for this address (e.g., 'My Exchange', 'Alice's Wallet')"},
				"address": map[string]any{"type": "string", "description": "The blockchain address to save"},
				"chain":   map[string]any{"type": "string", "description": "The blockchain chain this address is for (e.g., 'Ethereum', 'Bitcoin')"},
			}, false, false),
		NewBridgedTool("remove_address_book_entry",
			"Remove an address from the address book by its ID.",
			map[string]any{
				"id": map[string]any{"type": "string", "description": "The unique ID of the address book entry to remove"},
			}, false, false),

		NewBridgedTool("plugin_list",
			"List all available plugins from the Vultisig plugin marketplace. Returns plugin ID, name, description, and categories.",
			map[string]any{}, false, false),
		NewBridgedTool("plugin_spec",
			"Get the recipe specification for a plugin. This shows what configuration options are available and how to create policies for this plugin.",
			map[string]any{
				"plugin_id": map[string]any{"type": "string", "description": "The plugin ID or alias (e.g., 'dca', 'sends', 'fees', or full ID)"},
			}, false, false),
		NewBridgedTool("plugin_installed",
			"Check if a plugin is installed for the current vault. Returns true/false.",
			map[string]any{
				"plugin_id": map[string]any{"type": "string", "description": "The plugin ID or alias to check"},
			}, false, false),
		NewBridgedTool("plugin_uninstall",
			"Uninstall a plugin. This will delete all policies and vault keyshares associated with the plugin.",
			map[string]any{
				"plugin_id": map[string]any{"type": "string", "description": "The plugin ID or alias (e.g., 'dca', 'sends', 'fee')"},
			}, false, true),
		NewBridgedTool("policy_list",
			"List policies. When plugin_id is omitted, lists policies across ALL plugins. Shows full configuration details (assets, amounts, frequency).",
			map[string]any{
				"plugin_id": map[string]any{"type": "string", "description": "Optional plugin ID or alias (e.g., 'dca', 'sends'). Omit to list all plugins."},
				"active":    map[string]any{"type": "boolean", "description": "Filter by active status (default: true)"},
			}, false, false),
		NewBridgedTool("policy_status",
			"Get detailed status and configuration for a specific policy by ID.",
			map[string]any{
				"policy_id": map[string]any{"type": "string", "description": "The ID of the policy to get details for"},
			}, false, false),
		NewBridgedTool("transaction_history",
			"Get transaction history for the vault. Shows recent transactions and their status.",
			map[string]any{}, false, false),
		NewBridgedTool("get_market_price",
			"Get the latest market price for a cryptocurrency in a fiat currency (default USD). Supports common tickers like BTC/ETH/SOL and CoinGecko IDs.",
			map[string]any{
				"asset": map[string]any{"type": "string", "description": "Asset symbol or id (e.g., 'BTC', 'ETH', 'bitcoin', 'usd-coin')"},
				"fiat":  map[string]any{"type": "string", "description": "Fiat quote currency (default: 'usd'), e.g. 'usd', 'eur', 'gbp'"},
			}, false, false),

		NewBridgedTool("asset_lookup",
			"Resolve an asset alias to its chain and token information. Supports aliases like 'eth', 'usdc', 'usdc:arbitrum', etc.",
			map[string]any{
				"asset": map[string]any{"type": "string", "description": "Asset alias (e.g., 'eth', 'usdc', 'usdc:arbitrum', 'btc')"},
			}, false, false),
		NewBridgedTool("initiate_send",
			"Opens the send interface with optional prefilled coin, address, amount, and memo. User will review and sign the transaction. Address book entries are provided in the conversation context — resolve contact names from there. The coin must match a coin tracked in the user's vault; use asset_lookup if unsure which chain a token belongs to.",
			map[string]any{
				"coin":    map[string]any{"type": "string", "description": "The coin to send (e.g., 'ETH', 'BTC', 'USDC-Ethereum'). Format: TICKER or TICKER-CHAIN for tokens. Must be a coin the user has in their vault."},
				"address": map[string]any{"type": "string", "description": "The recipient blockchain address. Must be a valid address (e.g., 0x... for EVM, bc1... for Bitcoin). If the user provides a name or contact, resolve it from the address book in the conversation context or use get_address_book."},
				"amount":  map[string]any{"type": "string", "description": "The amount to send (as a string, e.g., '0.1', '100')."},
				"memo":    map[string]any{"type": "string", "description": "Optional memo for the transaction."},
			}, false, false),
		NewBridgedTool("policy_generate",
			"Generate a policy configuration for a plugin based on user parameters. This creates the JSON configuration that will be submitted.",
			map[string]any{
				"plugin_id": map[string]any{"type": "string", "description": "The plugin ID or alias (e.g., 'dca', 'sends')"},
				"from_asset": map[string]any{"type": "string", "description": "Source asset (e.g., 'eth', 'usdc:arbitrum')"},
				"to_asset":   map[string]any{"type": "string", "description": "Destination asset for swaps (e.g., 'usdc')"},
				"to_address": map[string]any{"type": "string", "description": "Destination address for sends"},
				"to_chain":   map[string]any{"type": "string", "description": "Destination chain for sends (defaults to same as from_asset chain)"},
				"amount":     map[string]any{"type": "string", "description": "Amount to swap/send (e.g., '0.01')"},
				"frequency":  map[string]any{"type": "string", "description": "Execution frequency: 'hourly', 'daily', 'weekly', 'monthly'"},
			}, false, false),

		NewBridgedTool("add_chain",
			"Add a new blockchain chain to the current vault. This enables the vault to hold native tokens and other assets on that chain. Use this when the chain is not yet present in the vault.",
			map[string]any{
				"chain": map[string]any{"type": "string", "description": "The blockchain chain name (e.g., 'Sui', 'Solana', 'Ethereum', 'Bitcoin')"},
			}, false, false),
		NewBridgedTool("add_coin",
			"Add a coin/token to the current vault. For native tokens, provide chain and ticker. For ERC-20/tokens, also provide the contract address. The address will be derived from the vault's public key.",
			map[string]any{
				"chain":            map[string]any{"type": "string", "description": "The blockchain chain (e.g., 'Ethereum', 'Bitcoin', 'Solana', 'BSC')"},
				"ticker":           map[string]any{"type": "string", "description": "The token ticker symbol (e.g., 'ETH', 'USDC', 'BTC')"},
				"contract_address": map[string]any{"type": "string", "description": "Token contract address (required for non-native tokens like USDC, USDT)"},
				"decimals":         map[string]any{"type": "number", "description": "Token decimals (default: 18 for EVM, 9 for Solana, 8 for Bitcoin)"},
				"logo":             map[string]any{"type": "string", "description": "Logo identifier for the token (e.g., 'usdc', 'weth')"},
				"price_provider_id": map[string]any{"type": "string", "description": "CoinGecko price provider ID (e.g., 'usd-coin', 'weth')"},
				"is_native":        map[string]any{"type": "boolean", "description": "Whether this is the native token of the chain (default: false if contract_address provided)"},
			}, false, false),
		NewBridgedTool("search_token",
			"Search for a token/coin across all supported chains. Searches known tokens and whitelisted token registries (1inch, Jupiter). Returns matching candidates with chain, ticker, contract address, and decimals. Use this when the user mentions a token not found in the vault.",
			map[string]any{
				"query": map[string]any{"type": "string", "description": "Token ticker or name to search for (e.g., 'PEPE', 'Uniswap', 'USDC')"},
				"chain": map[string]any{"type": "string", "description": "Optional: restrict search to a specific chain (e.g., 'Ethereum', 'Solana'). If omitted, searches all chains."},
			}, false, false),

		NewBridgedTool("scan_tx",
			"Scan a transaction for security risks using Blockaid. Returns risk level (Benign/Warning/Malicious) and description. Supports EVM chains only.",
			map[string]any{
				"chain": map[string]any{"type": "string", "description": "Chain name (e.g., 'Ethereum', 'Arbitrum', 'Base')"},
				"from":  map[string]any{"type": "string", "description": "Sender address"},
				"to":    map[string]any{"type": "string", "description": "Recipient/contract address"},
				"value": map[string]any{"type": "string", "description": "Transaction value in hex (e.g., '0x0')"},
				"data":  map[string]any{"type": "string", "description": "Transaction calldata hex"},
			}, false, false),
	}

	for _, t := range bridgedTools {
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

func (r *Registry) GetTool(name string) (Tool, bool) {
	t, ok := r.tools[name]
	return t, ok
}
