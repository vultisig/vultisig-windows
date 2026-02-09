package agent

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/anthropics/anthropic-sdk-go"
	"github.com/anthropics/anthropic-sdk-go/option"
	"github.com/google/uuid"

	"github.com/vultisig/vultisig-win/agent/shared"
	"github.com/vultisig/vultisig-win/agent/tools"
	"github.com/vultisig/vultisig-win/storage"
)

const systemPrompt = `You are VultiBot, the AI assistant for the Vultisig cryptocurrency wallet. If asked who or what you are, say you are VultiBot.

RESPONSE STYLE:
- Be extremely concise. Use 1-2 short sentences max.
- Never repeat information the user can already see in the tool output display.
- Skip greetings, pleasantries, and filler phrases.
- Don't explain what you're about to do - just do it.
- After tool calls, only add context if truly necessary.

CAPABILITIES:

1. WALLET INFO: get_chains, get_chain_address, get_coins, get_balances, vault_info, get_portfolio

2. MARKET DATA: get_market_price

3. COIN MANAGEMENT: add_chain, add_coin, remove_coin
   - add_chain: Add a new blockchain chain to the vault (derives address automatically)

4. ADDRESS BOOK: get_address_book, add_address_book_entry, remove_address_book_entry

5. VAULT MANAGEMENT: list_vaults, rename_vault
   - list_vaults returns chain_addresses for ALL vaults (not just active). Use it to get any vault's address.
   - get_chain_address only works for the CURRENT active vault. For other vaults, read chain_addresses from list_vaults.

6. ONE-TIME TRANSACTIONS:
   - initiate_swap: Opens swap interface with optional from/to coins prefilled
   - initiate_send: Opens send interface with optional coin, address, amount prefilled
   User reviews and signs in the UI.

7. RECURRING/SCHEDULED TRANSACTIONS (plugins & policies):
   - sign_in_status: Check if signed in to verifier (shows expiry)
   - plugin_list: List available plugins (includes pricing info)
   - plugin_spec: Get plugin details, pricing, and configuration schema
   - plugin_installed: Check if a plugin is installed
   - plugin_install: Install a plugin (reshare vault key with plugin server)
   - plugin_uninstall: Uninstall a plugin (deletes all policies and vault keyshares)
   - policy_generate: Generate a policy configuration
   - policy_add: Add a policy (requires TSS signing)
   - policy_list: List active policies (omit plugin_id to list ALL policies across all plugins)
   - policy_delete: Delete a policy (requires TSS signing)
   - policy_status: Get detailed status/config for a specific policy by ID
   - transaction_history: View vault transaction history
   Available plugins: DCA (recurring swaps), Recurring Sends, Fee Management

BILLING FLOW FOR PAID PLUGINS:
   Some plugins have per-transaction fees (e.g., Recurring Sends costs $0.10 USDC/tx).
   Before installing a paid plugin:
   1. Check pricing with plugin_spec
   2. Check if the Fees plugin ("fees") is installed with plugin_installed
   3. If Fees plugin is NOT installed, install it FIRST with plugin_install (plugin_id="fees")
   4. Then install the target plugin
   Billing is handled automatically when adding policies - no manual billing configuration needed.

TOOL SELECTION:
- "what's my ETH address?" → get_chain_address
- "what coins do I have?" → get_coins
- "how much ETH do I have?" → get_balances
- "what's my portfolio worth?" → get_portfolio
- "what is the price of BTC?" → get_market_price
- "how much does recurring sends cost?" → plugin_spec with plugin_id
- "swap X for Y" → initiate_swap with from_coin and to_coin
- "send X to address" → initiate_send with coin, address, amount
- "send X to my Other vault" → list_vaults (read chain_addresses from the non-active vault), then initiate_send with that address
- "get ETH address of my Other vault" → list_vaults, then read chain_addresses.Ethereum from the matching vault
- "what policies do I have?" → policy_list (no plugin_id, lists all)
- "show my DCA policies" → policy_list with plugin_id="dca"
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
				err := json.Unmarshal(block.Input, &inputMap)
				if err != nil {
					return fmt.Errorf("failed to unmarshal tool input for %s: %w", block.Name, err)
				}

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
			inputJSON, marshalErr := json.Marshal(tc.Input)
			if marshalErr != nil {
				return fmt.Errorf("failed to marshal tool input for %s: %w", tc.Name, marshalErr)
			}
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
				resultJSON, marshalErr := json.Marshal(result)
				if marshalErr != nil {
					return fmt.Errorf("failed to marshal tool result for %s: %w", tc.Name, marshalErr)
				}
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
	"plugin_installed":    true,
	"plugin_install":      true,
	"plugin_uninstall":    true,
	"policy_add":          true,
	"policy_delete":       true,
	"policy_list":         true,
	"policy_status":       true,
	"transaction_history": true,
}

var toolOperationNames = map[string]string{
	"plugin_install":   "installing a plugin",
	"plugin_uninstall": "uninstalling a plugin",
	"policy_add":       "adding a policy",
	"policy_delete":    "deleting a policy",
}

func (o *Orchestrator) executeToolWithRetry(ctx context.Context, conv *Conversation, vault *storage.Vault, tc *ToolCall) (any, error) {
	execCtx := &tools.ExecutionContext{
		AppCtx:      o.agent.ctx,
		Ctx:         ctx,
		Vault:       vault,
		VaultPubKey: vault.PublicKeyECDSA,
		OnProgress: func(step string) {
			o.agent.emitToolProgress(conv.ID, tc.ID, step)
		},
	}
	authPreflightDone := false
	var lastErr error

	for attempt := 0; attempt < 3; attempt++ {
		if authRequiredTools[tc.Name] && !authPreflightDone {
			if token, _, ok := o.agent.GetCachedAuthToken(vault.PublicKeyECDSA); ok {
				execCtx.AuthToken = token
			} else {
				statusCallID := tc.ID + ":sign_in_status"
				o.agent.emitToolCall(conv.ID, ToolCall{
					ID:     statusCallID,
					Name:   "sign_in_status",
					Input:  map[string]any{},
					Status: "running",
				})
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

		// Hard guard: auth-required tools must never execute with an empty token.
		if authRequiredTools[tc.Name] && strings.TrimSpace(execCtx.AuthToken) == "" {
			authToken, authErr := o.agent.GetAuthToken(ctx, vault, execCtx.Password)
			if authErr != nil {
				return nil, fmt.Errorf("failed to get auth token: %w", authErr)
			}
			execCtx.AuthToken = authToken
		}

		result, err := o.toolRegistry.Execute(tc.Name, tc.Input, execCtx)
		if err == nil {
			return result, nil
		}
		lastErr = err

		if errors.Is(err, tools.ErrPasswordRequired) {
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

		if errors.Is(err, tools.ErrConfirmationRequired) {
			details := o.buildConfirmationDetails(tc)
			confirmed, confErr := o.agent.waitForConfirmation(ctx, conv.ID, tc.Name, details, tc.ID)
			if confErr != nil {
				return nil, confErr
			}
			if !confirmed {
				return nil, fmt.Errorf("user cancelled the operation")
			}
			execCtx.Confirmed = true
			continue
		}

		if authRequiredTools[tc.Name] && isVerifierUnauthorizedError(err) {
			o.agent.Logger.WithField("tool", tc.Name).Warn("Verifier auth rejected token, attempting token refresh")

			refreshedToken, refreshErr := o.agent.refreshAuthToken(vault.PublicKeyECDSA)
			if refreshErr == nil {
				execCtx.AuthToken = refreshedToken.Token
				continue
			}

			o.agent.Logger.WithError(refreshErr).Warn("Token refresh failed, falling back to full re-auth")
			o.agent.InvalidateAuthToken(vault.PublicKeyECDSA)

			if execCtx.Password == "" {
				password, pwErr := o.agent.waitForPassword(ctx, conv.ID, tc.Name, "signing in to verifier")
				if pwErr != nil {
					return nil, pwErr
				}
				execCtx.Password = password
			}

			authToken, authErr := o.agent.GetAuthToken(ctx, vault, execCtx.Password)
			if authErr != nil {
				lastErr = authErr
				return nil, fmt.Errorf("failed to refresh auth token: %w", authErr)
			}
			execCtx.AuthToken = authToken
			continue
		}

		return nil, err
	}

	if lastErr != nil {
		return nil, fmt.Errorf("max retries exceeded for tool %s: last error: %w", tc.Name, lastErr)
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

func isVerifierUnauthorizedError(err error) bool {
	if err == nil {
		return false
	}
	msg := strings.ToLower(err.Error())
	return strings.Contains(msg, "verifier returned 401") || strings.Contains(msg, "unauthorized")
}

func (o *Orchestrator) buildConfirmationDetails(tc *ToolCall) string {
	if tc.Name == "plugin_install" {
		pluginIDRaw, ok := tc.Input["plugin_id"]
		if ok {
			pluginID := shared.ResolvePluginID(fmt.Sprintf("%v", pluginIDRaw))
			pluginName := shared.GetPluginName(pluginID)

			plugin, fetchErr := o.agent.verifierClient.GetPlugin(pluginID)
			if fetchErr == nil && plugin != nil {
				var sb strings.Builder
				fmt.Fprintf(&sb, "Plugin: %s\n", plugin.Title)
				if plugin.Description != "" {
					fmt.Fprintf(&sb, "Description: %s\n", plugin.Description)
				}
				fmt.Fprintf(&sb, "Plugin ID: %s\n", pluginID)
				if plugin.Version != "" {
					fmt.Fprintf(&sb, "Version: %s\n", plugin.Version)
				}
				sb.WriteString("\nThis will reshare your vault key with the plugin server to enable automated transactions.")
				return sb.String()
			}

			return fmt.Sprintf("Plugin: %s\nPlugin ID: %s\n\nThis will reshare your vault key with the plugin server to enable automated transactions.", pluginName, pluginID)
		}
	}

	if tc.Name == "plugin_uninstall" {
		pluginIDRaw, ok := tc.Input["plugin_id"]
		if ok {
			pluginID := shared.ResolvePluginID(fmt.Sprintf("%v", pluginIDRaw))
			pluginName := shared.GetPluginName(pluginID)
			return fmt.Sprintf("Plugin: %s\nPlugin ID: %s\n\nThis will uninstall the plugin and delete all its policies and vault keyshares.", pluginName, pluginID)
		}
	}

	if tc.Name == "policy_add" || tc.Name == "policy_delete" {
		return buildPolicyConfirmation(tc)
	}

	details, _ := json.MarshalIndent(tc.Input, "", "  ")
	return string(details)
}

func buildPolicyConfirmation(tc *ToolCall) string {
	var sb strings.Builder

	pluginIDRaw, _ := tc.Input["plugin_id"]
	pluginID := shared.ResolvePluginID(fmt.Sprintf("%v", pluginIDRaw))
	pluginName := shared.GetPluginName(pluginID)
	fmt.Fprintf(&sb, "Plugin: %s\n", pluginName)

	configRaw, ok := tc.Input["configuration"]
	if !ok {
		if tc.Name == "policy_delete" {
			sb.WriteString("\nThis will delete the policy and requires TSS signing.")
		} else {
			sb.WriteString("\nThis will create a recurring policy and requires TSS signing.")
		}
		return sb.String()
	}

	config, ok := configRaw.(map[string]any)
	if !ok {
		if tc.Name == "policy_delete" {
			sb.WriteString("\nThis will delete the policy and requires TSS signing.")
		} else {
			sb.WriteString("\nThis will create a recurring policy and requires TSS signing.")
		}
		return sb.String()
	}

	if pluginID == "vultisig-recurring-sends-0000" {
		fromStr, fromChain, fromToken := resolveAssetField(config, "asset")
		if fromStr != "" {
			fmt.Fprintf(&sb, "Asset: %s\n", fromStr)
		}
		if recipients, ok := config["recipients"].([]any); ok && len(recipients) > 0 {
			if r, ok := recipients[0].(map[string]any); ok {
				if addr, ok := r["toAddress"]; ok {
					fmt.Fprintf(&sb, "To: %v\n", addr)
				}
				if amt, ok := r["amount"]; ok {
					amountStr := shared.FormatHumanAmount(fmt.Sprintf("%v", amt), fromChain, fromToken)
					fmt.Fprintf(&sb, "Amount: %s\n", amountStr)
				}
			}
			if len(recipients) > 1 {
				fmt.Fprintf(&sb, "Recipients: %d\n", len(recipients))
			}
		}
	} else {
		fromStr, fromChain, fromToken := resolveAssetField(config, "from")
		if fromStr != "" {
			amountStr := ""
			if amount, ok := config["fromAmount"]; ok {
				amountStr = shared.FormatHumanAmount(fmt.Sprintf("%v", amount), fromChain, fromToken) + " "
			}
			fmt.Fprintf(&sb, "From: %s%s\n", amountStr, fromStr)
		}

		toStr, _, _ := resolveAssetField(config, "to")
		if toStr != "" {
			fmt.Fprintf(&sb, "To: %s\n", toStr)
		}
	}

	if freq, ok := config["frequency"]; ok {
		fmt.Fprintf(&sb, "Frequency: %v\n", freq)
	}

	if tc.Name == "policy_delete" {
		sb.WriteString("\nThis will delete the policy and requires TSS signing.")
	} else {
		sb.WriteString("\nThis will create a recurring policy and requires TSS signing.")
	}

	return sb.String()
}

func resolveAssetField(config map[string]any, field string) (display, chain, token string) {
	raw, ok := config[field]
	if !ok {
		return "", "", ""
	}
	obj, ok := raw.(map[string]any)
	if !ok {
		return "", "", ""
	}

	chain = fmt.Sprintf("%v", obj["chain"])
	if t, ok := obj["token"]; ok && t != nil {
		token = fmt.Sprintf("%v", t)
	}

	ticker := shared.ResolveTickerByChainAndToken(chain, token)
	display = fmt.Sprintf("%s (%s)", ticker, chain)
	return display, chain, token
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
			var toolResults []anthropic.ContentBlockParamUnion
			for _, tc := range msg.ToolCalls {
				if tc.Status != "complete" && tc.Status != "error" {
					continue
				}
				inputJSON, marshalErr := json.Marshal(tc.Input)
				if marshalErr != nil {
					inputJSON = []byte("{}")
				}
				content = append(content, anthropic.ContentBlockParamUnion{
					OfToolUse: &anthropic.ToolUseBlockParam{
						ID:    tc.ID,
						Name:  tc.Name,
						Input: json.RawMessage(inputJSON),
					},
				})
				if tc.Error != "" {
					toolResults = append(toolResults, anthropic.NewToolResultBlock(
						tc.ID,
						fmt.Sprintf("Error: %s", tc.Error),
						true,
					))
				} else {
					resultJSON, marshalErr := json.Marshal(tc.Output)
					if marshalErr != nil {
						resultJSON = []byte("{}")
					}
					toolResults = append(toolResults, anthropic.NewToolResultBlock(
						tc.ID,
						string(resultJSON),
						false,
					))
				}
			}
			if len(content) > 0 {
				result = append(result, anthropic.MessageParam{
					Role:    anthropic.MessageParamRoleAssistant,
					Content: content,
				})
			}
			if len(toolResults) > 0 {
				result = append(result, anthropic.MessageParam{
					Role:    anthropic.MessageParamRoleUser,
					Content: toolResults,
				})
			}
		}
	}

	return result
}
