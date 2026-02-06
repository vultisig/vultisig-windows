package agent

import (
	"bytes"
	"context"
	"crypto/rand"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/google/uuid"
	"github.com/sirupsen/logrus"
	"github.com/wailsapp/wails/v2/pkg/runtime"

	"github.com/vultisig/vultisig-win/agent/shared"
	"github.com/vultisig/vultisig-win/agent/signing"
	"github.com/vultisig/vultisig-win/agent/tools"
	"github.com/vultisig/vultisig-win/agent/verifier"
	"github.com/vultisig/vultisig-win/relay"
	"github.com/vultisig/vultisig-win/storage"
	"github.com/vultisig/vultisig-win/tss"
)

const (
	fastVaultServerURL = "https://api.vultisig.com/vault"
	authDerivePath     = "m/44'/60'/0'/0/0"
	authSignTimeout    = 2 * time.Minute
)

var (
	ErrPasswordRequired = errors.New("password required")
	ErrNoAPIKey         = errors.New("ANTHROPIC_API_KEY environment variable not set")
	ErrNoVault          = errors.New("vault not found")
	ErrAgentBusy        = errors.New("agent is busy processing another request")
)

type AgentService struct {
	ctx             context.Context
	store           *storage.Store
	tss             *tss.TssService
	orchestrator    *Orchestrator
	verifierClient  *verifier.Client
	toolRegistry    *tools.Registry
	conversations   map[string]*Conversation
	conversationsMu sync.RWMutex
	authTokens      map[string]*verifier.AuthToken
	authTokensMu    sync.RWMutex
	startersCache   map[string][]string
	startersCacheMu sync.RWMutex
	passwordChan    chan string
	confirmChan     chan bool
	cancelFunc      context.CancelFunc
	busy            bool
	busyMu          sync.Mutex
	apiKey          string
	apiKeyMu        sync.RWMutex
	Logger          *logrus.Logger
	authenticateFn  func(context.Context, *storage.Vault, string) (*verifier.AuthToken, error)
}

func NewAgentService(store *storage.Store, tss *tss.TssService) *AgentService {
	verifierClient := verifier.NewClient(GetVerifierURL())
	toolRegistry := tools.NewRegistry(store, tss, verifierClient)

	svc := &AgentService{
		store:          store,
		tss:            tss,
		verifierClient: verifierClient,
		toolRegistry:   toolRegistry,
		conversations:  make(map[string]*Conversation),
		authTokens:     make(map[string]*verifier.AuthToken),
		startersCache:  make(map[string][]string),
		passwordChan:   make(chan string, 1),
		confirmChan:    make(chan bool, 1),
		Logger:         logrus.WithField("module", "agent").Logger,
	}
	svc.authenticateFn = svc.authenticate
	return svc
}

func (a *AgentService) Startup(ctx context.Context) {
	a.ctx = ctx
	a.toolRegistry.SetAuthGetter(a)
	a.orchestrator = NewOrchestrator(a, a.toolRegistry)
}

func (a *AgentService) SendMessage(vaultPubKey, message string) (string, error) {
	a.busyMu.Lock()
	if a.busy {
		a.busyMu.Unlock()
		return "", ErrAgentBusy
	}
	a.busy = true
	a.busyMu.Unlock()

	defer func() {
		a.busyMu.Lock()
		a.busy = false
		a.busyMu.Unlock()
	}()

	apiKey := a.getApiKey()
	if apiKey == "" {
		return "", ErrNoAPIKey
	}

	vault, err := a.store.GetVault(vaultPubKey)
	if err != nil {
		return "", fmt.Errorf("failed to get vault: %w", err)
	}

	coins, err := a.store.GetVaultCoins(vaultPubKey)
	if err != nil {
		return "", fmt.Errorf("failed to get vault coins: %w", err)
	}
	vault.Coins = coins

	conv := a.getOrCreateConversation(vaultPubKey)

	userMsg := ChatMessage{
		ID:        uuid.New().String(),
		Role:      "user",
		Content:   message,
		Timestamp: time.Now(),
	}
	conv.Messages = append(conv.Messages, userMsg)
	conv.UpdatedAt = time.Now()

	ctx, cancel := context.WithCancel(a.ctx)
	a.cancelFunc = cancel

	go func() {
		err := a.orchestrator.Run(ctx, conv, vault, apiKey)
		if err != nil {
			a.Logger.WithError(err).Error("orchestrator error")
			runtime.EventsEmit(a.ctx, "agent:error", ErrorEvent{
				ConversationID: conv.ID,
				Error:          err.Error(),
			})
		}
	}()

	return conv.ID, nil
}

func (a *AgentService) NewConversation(vaultPubKey, name string) (string, error) {
	conv := &Conversation{
		ID:          uuid.New().String(),
		Name:        name,
		VaultPubKey: vaultPubKey,
		Status:      "active",
		Messages:    []ChatMessage{},
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	a.conversationsMu.Lock()
	a.conversations[conv.ID] = conv
	a.conversationsMu.Unlock()

	return conv.ID, nil
}

func (a *AgentService) GetConversation(conversationID string) (*Conversation, error) {
	a.conversationsMu.RLock()
	defer a.conversationsMu.RUnlock()

	conv, ok := a.conversations[conversationID]
	if !ok {
		return nil, fmt.Errorf("conversation not found: %s", conversationID)
	}
	return conv, nil
}

func (a *AgentService) GetConversations(vaultPubKey string) ([]*Conversation, error) {
	a.conversationsMu.RLock()
	defer a.conversationsMu.RUnlock()

	var result []*Conversation
	for _, conv := range a.conversations {
		if conv.VaultPubKey == vaultPubKey {
			result = append(result, conv)
		}
	}
	return result, nil
}

func (a *AgentService) SetActiveConversation(conversationID string) error {
	a.conversationsMu.Lock()
	defer a.conversationsMu.Unlock()

	_, ok := a.conversations[conversationID]
	if !ok {
		return fmt.Errorf("conversation not found: %s", conversationID)
	}
	return nil
}

func (a *AgentService) DeleteConversation(conversationID string) error {
	a.conversationsMu.Lock()
	defer a.conversationsMu.Unlock()

	delete(a.conversations, conversationID)
	return nil
}

func (a *AgentService) UpdateConversationName(conversationID, name string) error {
	a.conversationsMu.Lock()
	defer a.conversationsMu.Unlock()

	conv, ok := a.conversations[conversationID]
	if !ok {
		return fmt.Errorf("conversation not found: %s", conversationID)
	}
	conv.Name = name
	conv.UpdatedAt = time.Now()
	return nil
}

func (a *AgentService) ClearHistory(vaultPubKey string) error {
	a.conversationsMu.Lock()
	defer a.conversationsMu.Unlock()

	for id, conv := range a.conversations {
		if conv.VaultPubKey == vaultPubKey {
			delete(a.conversations, id)
		}
	}
	return nil
}

func (a *AgentService) CancelRequest() error {
	if a.cancelFunc != nil {
		a.cancelFunc()
		a.cancelFunc = nil
	}
	return nil
}

func (a *AgentService) ProvidePassword(password string) error {
	select {
	case a.passwordChan <- password:
		return nil
	default:
		return fmt.Errorf("no pending password request")
	}
}

func (a *AgentService) ProvideConfirmation(confirmed bool) error {
	select {
	case a.confirmChan <- confirmed:
		return nil
	default:
		return fmt.Errorf("no pending confirmation request")
	}
}

func (a *AgentService) SetApiKey(key string) error {
	a.apiKeyMu.Lock()
	defer a.apiKeyMu.Unlock()
	a.apiKey = key
	return nil
}

func (a *AgentService) GetApiKeyStatus() bool {
	return a.getApiKey() != ""
}

func (a *AgentService) GetVerifierSignInStatus(vaultPubKey string) bool {
	_, ok := a.getCachedAuthToken(vaultPubKey)
	return ok
}

func (a *AgentService) SignIn(vaultPubKey, password string) error {
	if password == "" {
		return ErrPasswordRequired
	}

	vault, err := a.store.GetVault(vaultPubKey)
	if err != nil {
		return fmt.Errorf("failed to get vault: %w", err)
	}

	ctx := a.ctx
	if ctx == nil {
		ctx = context.Background()
	}

	_, err = a.GetAuthToken(ctx, vault, password)
	return err
}

func (a *AgentService) getApiKey() string {
	a.apiKeyMu.RLock()
	defer a.apiKeyMu.RUnlock()
	if a.apiKey != "" {
		return a.apiKey
	}
	return GetClaudeAPIKey()
}

func (a *AgentService) getOrCreateConversation(vaultPubKey string) *Conversation {
	a.conversationsMu.Lock()
	defer a.conversationsMu.Unlock()

	for _, conv := range a.conversations {
		if conv.VaultPubKey == vaultPubKey && conv.Status == "active" {
			return conv
		}
	}

	conv := &Conversation{
		ID:          uuid.New().String(),
		Name:        "New conversation",
		VaultPubKey: vaultPubKey,
		Status:      "active",
		Messages:    []ChatMessage{},
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}
	a.conversations[conv.ID] = conv
	return conv
}

func (a *AgentService) waitForPassword(ctx context.Context, convID, toolName, operation string) (string, error) {
	runtime.EventsEmit(a.ctx, "agent:password_required", PasswordRequiredEvent{
		ConversationID: convID,
		ToolName:       toolName,
		Operation:      operation,
	})

	select {
	case password := <-a.passwordChan:
		return password, nil
	case <-ctx.Done():
		return "", ctx.Err()
	}
}

func (a *AgentService) waitForConfirmation(ctx context.Context, convID, action, details, toolCallID string) (bool, error) {
	runtime.EventsEmit(a.ctx, "agent:confirmation_required", ConfirmationRequiredEvent{
		ConversationID: convID,
		Action:         action,
		Details:        details,
		ToolCallID:     toolCallID,
	})

	select {
	case confirmed := <-a.confirmChan:
		return confirmed, nil
	case <-ctx.Done():
		return false, ctx.Err()
	}
}

func (a *AgentService) emitTextDelta(convID, delta string) {
	runtime.EventsEmit(a.ctx, "agent:text_delta", TextDeltaEvent{
		ConversationID: convID,
		Delta:          delta,
	})
}

func (a *AgentService) emitToolCall(convID string, tc ToolCall) {
	runtime.EventsEmit(a.ctx, "agent:tool_call", ToolCallEvent{
		ConversationID: convID,
		ID:             tc.ID,
		Name:           tc.Name,
		Input:          tc.Input,
	})
}

func (a *AgentService) emitToolResult(convID string, tc ToolCall) {
	runtime.EventsEmit(a.ctx, "agent:tool_result", ToolResultEvent{
		ConversationID: convID,
		ID:             tc.ID,
		Output:         tc.Output,
		Error:          tc.Error,
	})
}

func (a *AgentService) emitComplete(convID, message string) {
	runtime.EventsEmit(a.ctx, "agent:complete", CompleteEvent{
		ConversationID: convID,
		Message:        message,
	})
}

func (a *AgentService) emitThinking(convID string) {
	runtime.EventsEmit(a.ctx, "agent:thinking", map[string]string{
		"conversationId": convID,
	})
}

func (a *AgentService) ExportConversation(conversationID string) (string, error) {
	conv, err := a.GetConversation(conversationID)
	if err != nil {
		return "", err
	}

	data, err := json.MarshalIndent(conv, "", "  ")
	if err != nil {
		return "", fmt.Errorf("failed to marshal conversation: %w", err)
	}

	return string(data), nil
}

func (a *AgentService) GetAuthToken(ctx context.Context, vault *storage.Vault, password string) (string, error) {
	if token, ok := a.getCachedAuthToken(vault.PublicKeyECDSA); ok {
		return token.Token, nil
	}
	if password == "" {
		return "", ErrPasswordRequired
	}

	newToken, err := a.authenticateFn(ctx, vault, password)
	if err != nil {
		return "", err
	}

	a.authTokensMu.Lock()
	a.authTokens[vault.PublicKeyECDSA] = newToken
	a.authTokensMu.Unlock()

	return newToken.Token, nil
}

func (a *AgentService) getCachedAuthToken(vaultPubKey string) (*verifier.AuthToken, bool) {
	a.authTokensMu.RLock()
	token, ok := a.authTokens[vaultPubKey]
	a.authTokensMu.RUnlock()
	if !ok || token == nil {
		return nil, false
	}
	if token.ExpiresAt.Before(time.Now().Add(time.Hour)) {
		return nil, false
	}
	return token, true
}

func (a *AgentService) GetCachedAuthToken(vaultPubKey string) (string, time.Time, bool) {
	a.authTokensMu.RLock()
	token, ok := a.authTokens[vaultPubKey]
	a.authTokensMu.RUnlock()
	if !ok || token == nil {
		return "", time.Time{}, false
	}
	if token.ExpiresAt.Before(time.Now().Add(time.Hour)) {
		return "", time.Time{}, false
	}
	return token.Token, token.ExpiresAt, true
}

func (a *AgentService) authenticate(ctx context.Context, vault *storage.Vault, password string) (*verifier.AuthToken, error) {
	if ctx == nil {
		ctx = context.Background()
	}
	authCtx, cancel := context.WithTimeout(ctx, authSignTimeout)
	defer cancel()

	authMessage, err := verifier.GenerateAuthMessage()
	if err != nil {
		return nil, fmt.Errorf("failed to generate auth message: %w", err)
	}

	a.Logger.WithField("message", authMessage).Info("Signing auth message")

	signature, err := a.signMessage(authCtx, vault, password, authMessage)
	if err != nil {
		return nil, fmt.Errorf("failed to sign auth message: %w", err)
	}

	a.Logger.Info("Authenticating with verifier")

	token, err := a.verifierClient.Authenticate(vault.PublicKeyECDSA, vault.HexChainCode, signature, authMessage)
	if err != nil {
		return nil, fmt.Errorf("authentication failed: %w", err)
	}

	a.Logger.Info("Authentication successful")

	return token, nil
}

func (a *AgentService) signMessage(ctx context.Context, vault *storage.Vault, password, message string) (string, error) {
	messageHash := signing.EthereumSignHash(message)

	const maxAttempts = 2
	var lastErr error
	for attempt := 1; attempt <= maxAttempts; attempt++ {
		sessionID := uuid.New().String()
		encryptionKey := make([]byte, 32)
		_, err := rand.Read(encryptionKey)
		if err != nil {
			return "", fmt.Errorf("failed to generate encryption key: %w", err)
		}
		hexEncryptionKey := hex.EncodeToString(encryptionKey)

		relayURL := shared.DefaultRelayURL
		relayClient := relay.NewClient(relayURL)

		a.Logger.WithFields(logrus.Fields{
			"session_id": sessionID,
			"relay_url":  relayURL,
			"attempt":    attempt,
		}).Info("Registering session on relay for auth")

		err = relayClient.RegisterSession(sessionID, vault.LocalPartyID)
		if err != nil {
			return "", fmt.Errorf("failed to register session: %w", err)
		}

		err = a.callFastVaultSign(ctx, vault, password, sessionID, hexEncryptionKey, []string{messageHash})
		if err != nil {
			return "", fmt.Errorf("failed to call fast vault server: %w", err)
		}

		a.Logger.WithField("attempt", attempt).Info("Waiting for Fast Vault Server to join session...")
		err = a.waitForSessionParties(ctx, relayClient, sessionID, 2)
		if err != nil {
			lastErr = fmt.Errorf("failed to wait for session start: %w", err)
			if attempt < maxAttempts && isSessionJoinTimeout(err) {
				a.Logger.WithError(err).Warn("Session start wait timed out; retrying auth keysign once")
				continue
			}
			return "", lastErr
		}

		a.Logger.Info("Running TSS keysign protocol for auth")

		results, err := a.tss.Keysign(
			*vault,
			[]string{messageHash},
			vault.LocalPartyID,
			authDerivePath,
			sessionID,
			hexEncryptionKey,
			relayURL,
			"ecdsa",
		)
		if err != nil {
			return "", fmt.Errorf("keysign failed: %w", err)
		}

		if len(results) == 0 {
			return "", fmt.Errorf("no signature returned from keysign")
		}

		sig := results[0]
		rBytes, err := base64.StdEncoding.DecodeString(sig.R)
		if err != nil {
			return "", fmt.Errorf("failed to decode R: %w", err)
		}
		sBytes, err := base64.StdEncoding.DecodeString(sig.S)
		if err != nil {
			return "", fmt.Errorf("failed to decode S: %w", err)
		}

		recoveryID := sig.RecoveryID
		if recoveryID == "" {
			recoveryID = "1b"
		}
		signature := signing.FormatDerSignature(hex.EncodeToString(rBytes), hex.EncodeToString(sBytes), recoveryID)
		return signature, nil
	}

	return "", lastErr
}

func (a *AgentService) callFastVaultSign(ctx context.Context, vault *storage.Vault, password, sessionID, hexEncryptionKey string, messages []string) error {
	reqBody := map[string]any{
		"public_key":         vault.PublicKeyECDSA,
		"messages":           messages,
		"session":            sessionID,
		"hex_encryption_key": hexEncryptionKey,
		"derive_path":        authDerivePath,
		"is_ecdsa":           true,
		"vault_password":     password,
		"chain":              "Ethereum",
	}

	jsonBody, err := json.Marshal(reqBody)
	if err != nil {
		return fmt.Errorf("failed to marshal request: %w", err)
	}

	signURL := fastVaultServerURL + "/sign"
	a.Logger.WithField("url", signURL).Info("Sending sign request to Fast Vault Server")

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, signURL, bytes.NewReader(jsonBody))
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated && resp.StatusCode != http.StatusAccepted {
		body, _ := io.ReadAll(resp.Body)
		msg := strings.TrimSpace(string(body))
		if msg == "" {
			return fmt.Errorf("fast vault server returned status %d", resp.StatusCode)
		}
		return fmt.Errorf("fast vault server returned status %d: %s", resp.StatusCode, msg)
	}

	return nil
}

func (a *AgentService) waitForSessionParties(ctx context.Context, relayClient *relay.Client, sessionID string, expectedParties int) error {
	timeout := time.After(authSignTimeout)
	ticker := time.NewTicker(500 * time.Millisecond)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			return ctx.Err()
		case <-timeout:
			return fmt.Errorf("timeout waiting for %d parties to join session", expectedParties)
		case <-ticker.C:
			parties, err := relayClient.GetSession(sessionID)
			if err != nil {
				a.Logger.WithError(err).Warn("Failed to get session parties")
				continue
			}
			a.Logger.WithField("parties", parties).Info("Session parties")
			if len(parties) >= expectedParties {
				return nil
			}
		}
	}
}

func isSessionJoinTimeout(err error) bool {
	if err == nil {
		return false
	}
	errStr := err.Error()
	return strings.Contains(errStr, "timeout waiting for") || strings.Contains(errStr, "deadline exceeded")
}

func (a *AgentService) GetConversationStarters(vaultPubKey string) []string {
	a.startersCacheMu.RLock()
	starters, ok := a.startersCache[vaultPubKey]
	a.startersCacheMu.RUnlock()

	if ok && len(starters) >= 4 {
		return starters[:4]
	}

	vault, err := a.store.GetVault(vaultPubKey)
	if err != nil {
		return fallbackStartersForVault("", nil)
	}
	coins, err := a.store.GetVaultCoins(vaultPubKey)
	if err != nil {
		return fallbackStartersForVault(vault.Name, nil)
	}

	coinTickers := make([]string, 0, len(coins))
	seen := make(map[string]bool)
	for _, coin := range coins {
		ticker := strings.ToUpper(strings.TrimSpace(coin.Ticker))
		if ticker == "" || seen[ticker] {
			continue
		}
		seen[ticker] = true
		coinTickers = append(coinTickers, ticker)
	}

	return fallbackStartersForVault(vault.Name, coinTickers)
}

func (a *AgentService) GenerateConversationStarters(vaultPubKey string) {
	apiKey := a.getApiKey()
	if apiKey == "" {
		return
	}

	vault, err := a.store.GetVault(vaultPubKey)
	if err != nil {
		a.Logger.WithError(err).Error("failed to get vault for starters generation")
		return
	}

	coins, err := a.store.GetVaultCoins(vaultPubKey)
	if err != nil {
		a.Logger.WithError(err).Error("failed to get vault coins for starters generation")
		return
	}

	var coinList []string
	for _, coin := range coins {
		coinList = append(coinList, coin.Ticker)
	}

	prompt := fmt.Sprintf(`Generate exactly 8 short conversation starters for a crypto wallet AI assistant.
The user has a vault named "%s" with ONLY these coins: %v

CRITICAL RULES:
- Each starter should be a natural question or request (5-10 words max)
- For swap/send actions, ONLY use coins from the list above - never suggest coins they don't have
- Include at least 1 market data question that asks for a coin price (e.g., BTC/ETH price)
- Must include all of these categories, with at least 2 starters per category:
  1. About market data (coin prices)
  2. About plugins or policies (automation/recurring actions)
  3. About actions (one-time swap or send using ONLY their actual coins)
  4. About vault info (balances, addresses, settings)
- Return ONLY a JSON array of 8 strings, nothing else

Example for a user with [ETH, BTC, USDC]: ["What is the price of BTC?", "How much is ETH in USD?", "What plugins can I use?", "Set up weekly ETH to USDC DCA", "Swap some ETH to BTC", "Send USDC to an address", "Show my balances", "What is my ETH address?"]`, vault.Name, coinList)

	starters, err := a.callClaudeForStarters(apiKey, prompt, 8)
	if err != nil {
		a.Logger.WithError(err).Error("failed to generate starters")
		return
	}

	nextBatch := starters
	if len(starters) >= 8 {
		nextBatch = starters[4:8]
	} else if len(starters) >= 4 {
		nextBatch = starters[:4]
	}

	a.startersCacheMu.Lock()
	a.startersCache[vaultPubKey] = nextBatch
	a.startersCacheMu.Unlock()
}

func fallbackStartersForVault(vaultName string, coinTickers []string) []string {
	primary := "BTC"
	secondary := "ETH"
	if len(coinTickers) > 0 {
		primary = coinTickers[0]
	}
	if len(coinTickers) > 1 {
		secondary = coinTickers[1]
	} else {
		secondary = primary
	}

	namePrefix := ""
	if strings.TrimSpace(vaultName) != "" {
		namePrefix = fmt.Sprintf("in %s ", vaultName)
	}

	return []string{
		fmt.Sprintf("What is the price of %s right now?", primary),
		fmt.Sprintf("What can I automate %swith plugins?", namePrefix),
		fmt.Sprintf("Set up weekly %s to %s DCA", secondary, primary),
		fmt.Sprintf("Show my %s balances and addresses", primary),
	}
}

func (a *AgentService) callClaudeForStarters(apiKey, prompt string, expectedCount int) ([]string, error) {
	if expectedCount <= 0 {
		expectedCount = 4
	}

	maxTokens := 200
	if expectedCount > 4 {
		maxTokens = 360
	}

	reqBody := map[string]any{
		"model":      shared.ClaudeModel,
		"max_tokens": maxTokens,
		"messages": []map[string]string{
			{"role": "user", "content": prompt},
		},
	}

	jsonBody, err := json.Marshal(reqBody)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	req, err := http.NewRequest(http.MethodPost, "https://api.anthropic.com/v1/messages", bytes.NewReader(jsonBody))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("x-api-key", apiKey)
	req.Header.Set("anthropic-version", "2023-06-01")

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("API returned status %d", resp.StatusCode)
	}

	var result struct {
		Content []struct {
			Text string `json:"text"`
		} `json:"content"`
	}

	err = json.NewDecoder(resp.Body).Decode(&result)
	if err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	if len(result.Content) == 0 {
		return nil, fmt.Errorf("no content in response")
	}

	var starters []string
	err = json.Unmarshal([]byte(result.Content[0].Text), &starters)
	if err != nil {
		return nil, fmt.Errorf("failed to parse starters JSON: %w", err)
	}

	if len(starters) < expectedCount {
		return nil, fmt.Errorf("expected %d starters, got %d", expectedCount, len(starters))
	}

	return starters[:expectedCount], nil
}
