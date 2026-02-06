package agent

import (
	"time"
)

type ChatMessage struct {
	ID        string      `json:"id"`
	Role      string      `json:"role"`
	Content   string      `json:"content"`
	ToolCalls []ToolCall  `json:"toolCalls,omitempty"`
	Timestamp time.Time   `json:"timestamp"`
}

type ToolCall struct {
	ID     string                 `json:"id"`
	Name   string                 `json:"name"`
	Input  map[string]interface{} `json:"input"`
	Status string                 `json:"status"`
	Output interface{}            `json:"output,omitempty"`
	Error  string                 `json:"error,omitempty"`
}

type Conversation struct {
	ID           string        `json:"id"`
	Name         string        `json:"name"`
	VaultPubKey  string        `json:"vaultPubKey"`
	PolicyID     string        `json:"policyId,omitempty"`
	Status       string        `json:"status"`
	Messages     []ChatMessage `json:"messages"`
	CreatedAt    time.Time     `json:"createdAt"`
	UpdatedAt    time.Time     `json:"updatedAt"`
}

type TextDeltaEvent struct {
	ConversationID string `json:"conversationId"`
	Delta          string `json:"delta"`
}

type ToolCallEvent struct {
	ConversationID string                 `json:"conversationId"`
	ID             string                 `json:"id"`
	Name           string                 `json:"name"`
	Input          map[string]interface{} `json:"input"`
}

type ToolResultEvent struct {
	ConversationID string      `json:"conversationId"`
	ID             string      `json:"id"`
	Output         interface{} `json:"output"`
	Error          string      `json:"error,omitempty"`
}

type PasswordRequiredEvent struct {
	ConversationID string `json:"conversationId"`
	ToolName       string `json:"toolName"`
	Operation      string `json:"operation"`
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
	ToolCallID     string `json:"toolCallId"`
}
