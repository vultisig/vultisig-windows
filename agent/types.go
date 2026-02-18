package agent

import (
	"time"

	"github.com/vultisig/vultisig-win/agent/backend"
)

type ChatMessage struct {
	ID        string     `json:"id"`
	Role      string     `json:"role"`
	Content   string     `json:"content"`
	Actions   []backend.Action `json:"actions,omitempty"`
	Timestamp time.Time  `json:"timestamp"`
}

type Conversation struct {
	ID          string        `json:"id"`
	Name        string        `json:"name"`
	VaultPubKey string        `json:"vaultPubKey"`
	Status      string        `json:"status"`
	Messages    []ChatMessage `json:"messages"`
	CreatedAt   time.Time     `json:"createdAt"`
	UpdatedAt   time.Time     `json:"updatedAt"`
}

type ResponseEvent struct {
	ConversationID  string                   `json:"conversationId"`
	Message         string                   `json:"message"`
	Actions         []backend.Action         `json:"actions,omitempty"`
	Suggestions     []backend.Suggestion     `json:"suggestions,omitempty"`
	PolicyReady     *backend.PolicyReady     `json:"policyReady,omitempty"`
	InstallRequired *backend.InstallRequired `json:"installRequired,omitempty"`
}

type TxReadyEvent struct {
	ConversationID string           `json:"conversationId"`
	TxReady        *backend.TxReady `json:"txReady"`
}

type ActionResultEvent struct {
	ConversationID string         `json:"conversationId"`
	ActionID       string         `json:"actionId"`
	ActionType     string         `json:"actionType"`
	Success        bool           `json:"success"`
	Data           map[string]any `json:"data,omitempty"`
	Error          string         `json:"error,omitempty"`
}

type PasswordRequiredEvent struct {
	ConversationID string `json:"conversationId"`
	ToolName       string `json:"toolName"`
	Operation      string `json:"operation"`
	RequestID      string `json:"requestId"`
}

type CompleteEvent struct {
	ConversationID string `json:"conversationId"`
	Message        string `json:"message"`
}

type ErrorEvent struct {
	ConversationID string `json:"conversationId"`
	Error          string `json:"error"`
}

type ConfirmationRequiredEvent struct {
	ConversationID string `json:"conversationId"`
	Action         string `json:"action"`
	Details        string `json:"details"`
	ActionID       string `json:"actionId"`
	RequestID      string `json:"requestId"`
}

type AuthRequiredEvent struct {
	ConversationID string `json:"conversationId"`
	VaultPubKey    string `json:"vaultPubKey"`
}

type TitleUpdatedEvent struct {
	ConversationID string `json:"conversationId"`
	Title          string `json:"title"`
}

type ToolCallEvent struct {
	ConversationID string         `json:"conversationId"`
	ActionID       string         `json:"actionId"`
	ActionType     string         `json:"actionType"`
	Title          string         `json:"title"`
	Params         map[string]any `json:"params,omitempty"`
}

type TxStatusEvent struct {
	ConversationID string `json:"conversationId"`
	TxHash         string `json:"txHash"`
	Chain          string `json:"chain"`
	Status         string `json:"status"`
	Label          string `json:"label"`
}
