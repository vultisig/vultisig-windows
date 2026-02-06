package agent

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/anthropics/anthropic-sdk-go"
	"github.com/anthropics/anthropic-sdk-go/option"
	"github.com/google/uuid"

	"github.com/vultisig/vultisig-win/agent/shared"
	"github.com/vultisig/vultisig-win/agent/tools"
	"github.com/vultisig/vultisig-win/storage"
)

const systemPrompt = `You are a helpful AI assistant for the Vultisig cryptocurrency wallet.

RESPONSE STYLE:
- Be extremely concise. Use 1-2 short sentences max.
- Never repeat information the user can already see in the tool output display.
- Skip greetings, pleasantries, and filler phrases.
- Don't explain what you're about to do - just do it.
- After tool calls, only add context if truly necessary.

CAPABILITIES:

1. WALLET INFO: get_chains, get_chain_address, get_coins, get_balances, vault_info

2. MARKET DATA: get_market_price

3. COIN MANAGEMENT: add_coin, remove_coin

4. ADDRESS BOOK: get_address_book, add_address_book_entry, remove_address_book_entry

5. VAULT MANAGEMENT: list_vaults, rename_vault

6. ONE-TIME TRANSACTIONS:
   - initiate_swap: Opens swap interface with optional from/to coins prefilled
   - initiate_send: Opens send interface with optional coin, address, amount prefilled
   User reviews and signs in the UI.

7. RECURRING/SCHEDULED TRANSACTIONS (plugins & policies):
   - sign_in_status: Check if signed in to verifier (shows expiry)
   - plugin_list: List available plugins
   - plugin_installed: Check if a plugin is installed
   - plugin_install: Install a plugin (reshare vault key with plugin server)
   - policy_generate: Generate a policy configuration
   - policy_add: Add a policy (requires TSS signing)
   - policy_list: List active policies
   - policy_delete: Delete a policy (requires TSS signing)
   - policy_status: Check transaction history
   Available plugins: DCA (recurring swaps), Recurring Sends, Fee Management

TOOL SELECTION:
- "what's my ETH address?" → get_chain_address
- "what coins do I have?" → get_coins
- "how much ETH do I have?" → get_balances
- "what is the price of BTC?" → get_market_price
- "swap X for Y" → initiate_swap with from_coin and to_coin
- "send X to address" → initiate_send with coin, address, amount
- "swap X for Y every week" → policy with DCA plugin
- For TSS operations (policy_add, policy_delete), briefly confirm before proceeding`

type Orchestrator struct {
	agent        *AgentService
	toolRegistry *tools.Registry
}

func NewOrchestrator(agent *AgentService, registry *tools.Registry) *Orchestrator {
	return &Orchestrator{
		agent:        agent,
		toolRegistry: registry,
	}
}

func (o *Orchestrator) Run(ctx context.Context, conv *Conversation, vault *storage.Vault, apiKey string) error {
	client := anthropic.NewClient(option.WithAPIKey(apiKey))

	messages := o.convertMessages(conv.Messages)

	toolDefs := o.toolRegistry.GetToolDefinitions()

	maxTurns := 20
	for turn := 0; turn < maxTurns; turn++ {
		select {
		case <-ctx.Done():
			return ctx.Err()
		default:
		}

		o.agent.emitThinking(conv.ID)

		resp, err := client.Messages.New(ctx, anthropic.MessageNewParams{
			Model:     anthropic.Model(shared.ClaudeModel),
			MaxTokens: 4096,
			System: []anthropic.TextBlockParam{
				{
					Text: systemPrompt,
				},
			},
			Messages: messages,
			Tools:    toolDefs,
		})
		if err != nil {
			return fmt.Errorf("claude API error: %w", err)
		}

		var textContent string
		var toolCalls []ToolCall

		for _, block := range resp.Content {
			switch block.Type {
			case "text":
				textContent += block.Text
				o.agent.emitTextDelta(conv.ID, block.Text)

			case "tool_use":
				inputMap := make(map[string]any)
				json.Unmarshal(block.Input, &inputMap)

				tc := ToolCall{
					ID:     block.ID,
					Name:   block.Name,
					Input:  inputMap,
					Status: "running",
				}
				toolCalls = append(toolCalls, tc)
			}
		}

		if len(toolCalls) == 0 {
			if textContent != "" {
				assistantMsg := ChatMessage{
					ID:        uuid.New().String(),
					Role:      "assistant",
					Content:   textContent,
					Timestamp: time.Now(),
				}
				conv.Messages = append(conv.Messages, assistantMsg)
				conv.UpdatedAt = time.Now()
			}
			o.agent.emitComplete(conv.ID, textContent)
			return nil
		}

		assistantContent := make([]anthropic.ContentBlockParamUnion, 0)
		if textContent != "" {
			assistantContent = append(assistantContent, anthropic.NewTextBlock(textContent))
		}
		for _, tc := range toolCalls {
			inputJSON, _ := json.Marshal(tc.Input)
			assistantContent = append(assistantContent, anthropic.ContentBlockParamUnion{
				OfToolUse: &anthropic.ToolUseBlockParam{
					ID:    tc.ID,
					Name:  tc.Name,
					Input: json.RawMessage(inputJSON),
				},
			})
		}

		messages = append(messages, anthropic.MessageParam{
			Role:    anthropic.MessageParamRoleAssistant,
			Content: assistantContent,
		})

		var toolResults []anthropic.ContentBlockParamUnion
		for i := range toolCalls {
			tc := &toolCalls[i]
			o.agent.emitToolCall(conv.ID, *tc)

			result, err := o.executeToolWithRetry(ctx, conv, vault, tc)
			if err != nil {
				tc.Status = "error"
				tc.Error = err.Error()
				toolResults = append(toolResults, anthropic.NewToolResultBlock(
					tc.ID,
					fmt.Sprintf("Error: %s", err.Error()),
					true,
				))
			} else {
				tc.Status = "complete"
				tc.Output = result
				resultJSON, _ := json.Marshal(result)
				toolResults = append(toolResults, anthropic.NewToolResultBlock(
					tc.ID,
					string(resultJSON),
					false,
				))
			}

			o.agent.emitToolResult(conv.ID, *tc)
		}

		assistantMsg := ChatMessage{
			ID:        uuid.New().String(),
			Role:      "assistant",
			Content:   textContent,
			ToolCalls: toolCalls,
			Timestamp: time.Now(),
		}
		conv.Messages = append(conv.Messages, assistantMsg)
		conv.UpdatedAt = time.Now()

		messages = append(messages, anthropic.MessageParam{
			Role:    anthropic.MessageParamRoleUser,
			Content: toolResults,
		})
	}

	return fmt.Errorf("max turns exceeded")
}

var authRequiredTools = map[string]bool{
	"plugin_install": true,
	"policy_add":     true,
	"policy_delete":  true,
	"policy_list":    true,
	"policy_status":  true,
}

var toolOperationNames = map[string]string{
	"plugin_install": "installing a plugin",
	"policy_add":     "adding a policy",
	"policy_delete":  "deleting a policy",
}

func (o *Orchestrator) executeToolWithRetry(ctx context.Context, conv *Conversation, vault *storage.Vault, tc *ToolCall) (any, error) {
	execCtx := &tools.ExecutionContext{
		Ctx:         ctx,
		Vault:       vault,
		VaultPubKey: vault.PublicKeyECDSA,
	}
	authPreflightDone := false

	for attempt := 0; attempt < 3; attempt++ {
		if authRequiredTools[tc.Name] && !authPreflightDone {
			statusCallID := tc.ID + ":sign_in_status"
			o.agent.emitToolCall(conv.ID, ToolCall{
				ID:     statusCallID,
				Name:   "sign_in_status",
				Input:  map[string]any{},
				Status: "running",
			})

			if token, expiresAt, ok := o.agent.GetCachedAuthToken(vault.PublicKeyECDSA); ok {
				execCtx.AuthToken = token
				o.agent.emitToolResult(conv.ID, ToolCall{
					ID:     statusCallID,
					Name:   "sign_in_status",
					Status: "complete",
					Output: map[string]any{
						"signed_in":  true,
						"expires_at": expiresAt.Format(time.RFC3339),
						"expires_in": formatExpiryWindow(expiresAt),
					},
				})
			} else {
				o.agent.emitToolResult(conv.ID, ToolCall{
					ID:     statusCallID,
					Name:   "sign_in_status",
					Status: "complete",
					Output: map[string]any{
						"signed_in": false,
						"message":   "Not signed in to verifier",
					},
				})

				if execCtx.Password == "" {
					password, pwErr := o.agent.waitForPassword(ctx, conv.ID, tc.Name, "signing in to verifier")
					if pwErr != nil {
						return nil, pwErr
					}
					execCtx.Password = password
				}

				signInCallID := tc.ID + ":sign_in"
				o.agent.emitToolCall(conv.ID, ToolCall{
					ID:     signInCallID,
					Name:   "sign_in",
					Input:  map[string]any{},
					Status: "running",
				})

				authToken, authErr := o.agent.GetAuthToken(ctx, vault, execCtx.Password)
				if authErr != nil {
					o.agent.emitToolResult(conv.ID, ToolCall{
						ID:     signInCallID,
						Name:   "sign_in",
						Status: "error",
						Error:  authErr.Error(),
					})
					return nil, fmt.Errorf("failed to get auth token: %w", authErr)
				}
				execCtx.AuthToken = authToken

				_, expiresAt, _ := o.agent.GetCachedAuthToken(vault.PublicKeyECDSA)
				o.agent.emitToolResult(conv.ID, ToolCall{
					ID:     signInCallID,
					Name:   "sign_in",
					Status: "complete",
					Output: map[string]any{
						"signed_in":  true,
						"expires_at": expiresAt.Format(time.RFC3339),
						"expires_in": formatExpiryWindow(expiresAt),
					},
				})
			}
			authPreflightDone = true
		}

		result, err := o.toolRegistry.Execute(tc.Name, tc.Input, execCtx)
		if err == nil {
			return result, nil
		}

		if err == tools.ErrPasswordRequired {
			operation := toolOperationNames[tc.Name]
			if operation == "" {
				operation = "TSS signing"
			}
			password, pwErr := o.agent.waitForPassword(ctx, conv.ID, tc.Name, operation)
			if pwErr != nil {
				return nil, pwErr
			}
			execCtx.Password = password

			if authRequiredTools[tc.Name] && execCtx.AuthToken == "" {
				authToken, authErr := o.agent.GetAuthToken(ctx, vault, password)
				if authErr != nil {
					return nil, fmt.Errorf("failed to get auth token: %w", authErr)
				}
				execCtx.AuthToken = authToken
			}
			continue
		}

		if err == tools.ErrConfirmationRequired {
			details, _ := json.MarshalIndent(tc.Input, "", "  ")
			confirmed, confErr := o.agent.waitForConfirmation(ctx, conv.ID, tc.Name, string(details), tc.ID)
			if confErr != nil {
				return nil, confErr
			}
			if !confirmed {
				return nil, fmt.Errorf("user cancelled the operation")
			}
			execCtx.Confirmed = true
			continue
		}

		return nil, err
	}

	return nil, fmt.Errorf("max retries exceeded for tool %s", tc.Name)
}

func formatExpiryWindow(expiresAt time.Time) string {
	if expiresAt.IsZero() {
		return "unknown"
	}
	remaining := time.Until(expiresAt)
	if remaining <= 0 {
		return "expired"
	}
	days := int(remaining.Hours()) / 24
	if days > 0 {
		return fmt.Sprintf("%d days", days)
	}
	hours := int(remaining.Hours())
	if hours > 0 {
		return fmt.Sprintf("%d hours", hours)
	}
	minutes := int(remaining.Minutes())
	if minutes <= 0 {
		minutes = 1
	}
	return fmt.Sprintf("%d minutes", minutes)
}

func (o *Orchestrator) convertMessages(messages []ChatMessage) []anthropic.MessageParam {
	var result []anthropic.MessageParam

	for _, msg := range messages {
		switch msg.Role {
		case "user":
			result = append(result, anthropic.MessageParam{
				Role:    anthropic.MessageParamRoleUser,
				Content: []anthropic.ContentBlockParamUnion{anthropic.NewTextBlock(msg.Content)},
			})
		case "assistant":
			var content []anthropic.ContentBlockParamUnion
			if msg.Content != "" {
				content = append(content, anthropic.NewTextBlock(msg.Content))
			}
			for _, tc := range msg.ToolCalls {
				inputJSON, _ := json.Marshal(tc.Input)
				content = append(content, anthropic.ContentBlockParamUnion{
					OfToolUse: &anthropic.ToolUseBlockParam{
						ID:    tc.ID,
						Name:  tc.Name,
						Input: json.RawMessage(inputJSON),
					},
				})
			}
			if len(content) > 0 {
				result = append(result, anthropic.MessageParam{
					Role:    anthropic.MessageParamRoleAssistant,
					Content: content,
				})
			}

			if len(msg.ToolCalls) > 0 {
				var toolResults []anthropic.ContentBlockParamUnion
				for _, tc := range msg.ToolCalls {
					if tc.Status == "complete" || tc.Status == "error" {
						if tc.Error != "" {
							toolResults = append(toolResults, anthropic.NewToolResultBlock(
								tc.ID,
								fmt.Sprintf("Error: %s", tc.Error),
								true,
							))
						} else {
							resultJSON, _ := json.Marshal(tc.Output)
							toolResults = append(toolResults, anthropic.NewToolResultBlock(
								tc.ID,
								string(resultJSON),
								false,
							))
						}
					}
				}
				if len(toolResults) > 0 {
					result = append(result, anthropic.MessageParam{
						Role:    anthropic.MessageParamRoleUser,
						Content: toolResults,
					})
				}
			}
		}
	}

	return result
}
