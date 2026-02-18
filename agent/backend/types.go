package backend

import (
	"encoding/json"
	"time"
)

type SendMessageRequest struct {
	PublicKey            string          `json:"public_key"`
	Content              string          `json:"content,omitempty"`
	Context              *MessageContext `json:"context,omitempty"`
	SelectedSuggestionID *string         `json:"selected_suggestion_id,omitempty"`
	ActionResult         *ActionResult   `json:"action_result,omitempty"`
}

type MessageContext struct {
	VaultAddress string              `json:"vault_address,omitempty"`
	VaultName    string              `json:"vault_name,omitempty"`
	Balances     []Balance           `json:"balances,omitempty"`
	Addresses    map[string]string   `json:"addresses,omitempty"`
	Coins        []CoinInfo          `json:"coins,omitempty"`
	AddressBook  []AddressBookEntry  `json:"address_book,omitempty"`
}

type CoinInfo struct {
	Chain           string `json:"chain"`
	Ticker          string `json:"ticker"`
	ContractAddress string `json:"contract_address,omitempty"`
	IsNativeToken   bool   `json:"is_native_token"`
	Decimals        int    `json:"decimals"`
}

type AddressBookEntry struct {
	Title   string `json:"title"`
	Address string `json:"address"`
	Chain   string `json:"chain"`
}

type Balance struct {
	Chain    string `json:"chain"`
	Asset    string `json:"asset"`
	Symbol   string `json:"symbol"`
	Amount   string `json:"amount"`
	Decimals int    `json:"decimals"`
}

type Action struct {
	ID          string         `json:"id"`
	Type        string         `json:"type"`
	Title       string         `json:"title"`
	Description string         `json:"description,omitempty"`
	Params      map[string]any `json:"params,omitempty"`
	AutoExecute bool           `json:"auto_execute"`
}

type ActionResult struct {
	Action   string         `json:"action"`
	ActionID string         `json:"action_id,omitempty"`
	Success  bool           `json:"success"`
	Data     map[string]any `json:"data,omitempty"`
	Error    string         `json:"error,omitempty"`
}

type SendMessageResponse struct {
	Message         Message          `json:"message"`
	Title           *string          `json:"title,omitempty"`
	Suggestions     []Suggestion     `json:"suggestions,omitempty"`
	Actions         []Action         `json:"actions,omitempty"`
	PolicyReady     *PolicyReady     `json:"policy_ready,omitempty"`
	InstallRequired *InstallRequired `json:"install_required,omitempty"`
	TxReady         *TxReady         `json:"tx_ready,omitempty"`
}

type TxReady struct {
	Provider       string  `json:"provider"`
	ExpectedOutput string  `json:"expected_output"`
	MinimumOutput  string  `json:"minimum_output"`
	NeedsApproval  bool    `json:"needs_approval"`
	ApprovalTx     *TxData `json:"approval_tx,omitempty"`
	SwapTx         *TxData `json:"swap_tx"`
	FromChain      string  `json:"from_chain"`
	FromSymbol     string  `json:"from_symbol"`
	ToChain        string  `json:"to_chain"`
	ToSymbol       string  `json:"to_symbol"`
	Amount         string  `json:"amount"`
	Sender         string  `json:"sender"`
	Destination    string  `json:"destination"`
}

type TxData struct {
	To          string `json:"to"`
	Value       string `json:"value"`
	Data        string `json:"data"`
	Memo        string `json:"memo,omitempty"`
	Nonce       uint64 `json:"nonce"`
	GasLimit    uint64 `json:"gas_limit"`
	ChainID     string `json:"chain_id,omitempty"`
	UnsignedTx  string `json:"unsigned_tx,omitempty"`
	SigningHash string `json:"signing_hash,omitempty"`
	MsgHash     string `json:"msg_hash,omitempty"`
}

type BuildSwapQuoteRequest struct {
	PublicKey string          `json:"public_key"`
	Params    map[string]any  `json:"params"`
	Context   *MessageContext `json:"context,omitempty"`
}

type BuildSwapQuoteResponse struct {
	TxReady *TxReady `json:"tx_ready,omitempty"`
	Actions []Action `json:"actions,omitempty"`
	Message string   `json:"message,omitempty"`
	Error   string   `json:"error,omitempty"`
}

type Message struct {
	ID             string          `json:"id"`
	ConversationID string          `json:"conversation_id"`
	Role           string          `json:"role"`
	Content        string          `json:"content"`
	ContentType    string          `json:"content_type"`
	Metadata       json.RawMessage `json:"metadata,omitempty"`
	CreatedAt      time.Time       `json:"created_at"`
}

type Suggestion struct {
	ID          string `json:"id"`
	PluginID    string `json:"plugin_id"`
	Title       string `json:"title"`
	Description string `json:"description"`
}

type PolicyReady struct {
	PluginID      string         `json:"plugin_id"`
	Configuration map[string]any `json:"configuration"`
	PolicySuggest any            `json:"policy_suggest"`
}

type InstallRequired struct {
	PluginID    string `json:"plugin_id"`
	Title       string `json:"title"`
	Description string `json:"description"`
}

type Conversation struct {
	ID         string     `json:"id"`
	PublicKey  string     `json:"public_key"`
	Title      *string    `json:"title"`
	CreatedAt  time.Time  `json:"created_at"`
	UpdatedAt  time.Time  `json:"updated_at"`
	ArchivedAt *time.Time `json:"archived_at,omitempty"`
}

type ConversationWithMessages struct {
	Conversation
	Messages []Message `json:"messages"`
}

type CreateConversationRequest struct {
	PublicKey string  `json:"public_key"`
	Title    *string `json:"title,omitempty"`
}

type ListConversationsRequest struct {
	PublicKey string `json:"public_key"`
	Skip      int    `json:"skip"`
	Take      int    `json:"take"`
}

type ListConversationsResponse struct {
	Conversations []Conversation `json:"conversations"`
	TotalCount    int            `json:"total_count"`
}

type ErrorResponse struct {
	Error string `json:"error"`
}
