package agent

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/google/uuid"
	"github.com/sirupsen/logrus"
	"github.com/wailsapp/wails/v2/pkg/runtime"

	"github.com/vultisig/vultisig-win/agent/chainbridge"
	"github.com/vultisig/vultisig-win/agent/dklsbridge"
	"github.com/vultisig/vultisig-win/agent/portfoliobridge"
	"github.com/vultisig/vultisig-win/agent/shared"
	"github.com/vultisig/vultisig-win/agent/signing"
	"github.com/vultisig/vultisig-win/agent/tools"
	"github.com/vultisig/vultisig-win/agent/verifier"
	"github.com/vultisig/vultisig-win/storage"
	"github.com/vultisig/vultisig-win/tss"
)

const (
	authDerivePath  = "m/44'/60'/0'/0/0"
	authSignTimeout = 2 * time.Minute
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
	passwordChan chan string
	confirmChan  chan bool
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

	apiKey := a.getApiKey()
	if apiKey == "" {
		a.busyMu.Lock()
		a.busy = false
		a.busyMu.Unlock()
		return "", ErrNoAPIKey
	}

	vault, err := a.store.GetVault(vaultPubKey)
	if err != nil {
		a.busyMu.Lock()
		a.busy = false
		a.busyMu.Unlock()
		return "", fmt.Errorf("failed to get vault: %w", err)
	}

	coins, err := a.store.GetVaultCoins(vaultPubKey)
	if err != nil {
		a.busyMu.Lock()
		a.busy = false
		a.busyMu.Unlock()
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
	a.busyMu.Lock()
	a.cancelFunc = cancel
	a.busyMu.Unlock()

	go func() {
		defer func() {
			a.busyMu.Lock()
			a.busy = false
			a.busyMu.Unlock()
		}()

		err := a.orchestrator.Run(ctx, conv, vault, apiKey)
		if err != nil {
			if errors.Is(err, context.Canceled) {
				a.Logger.WithField("conversation_id", conv.ID).Info("agent stopped by user")
				runtime.EventsEmit(a.ctx, "agent:error", ErrorEvent{
					ConversationID: conv.ID,
					Error:          "agent stopped",
				})
				return
			}

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
	a.busyMu.Lock()
	cancel := a.cancelFunc
	a.cancelFunc = nil
	a.busyMu.Unlock()
	if cancel != nil {
		cancel()
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

func (a *AgentService) ProvideDKLSSignature(requestID, r, s, recoveryID, errMessage string) error {
	return dklsbridge.SubmitSignResponse(dklsbridge.SignResponse{
		RequestID:  requestID,
		R:          r,
		S:          s,
		RecoveryID: recoveryID,
		Error:      errMessage,
	})
}

func (a *AgentService) ProvideDKLSReshare(requestID, ecdsaPubKey, eddsaPubKey, ecdsaKeyshare, eddsaKeyshare, hexChainCode, errMessage string) error {
	return dklsbridge.SubmitReshareResponse(dklsbridge.ReshareResponse{
		RequestID:     requestID,
		EcdsaPubKey:   ecdsaPubKey,
		EddsaPubKey:   eddsaPubKey,
		EcdsaKeyshare: ecdsaKeyshare,
		EddsaKeyshare: eddsaKeyshare,
		HexChainCode:  hexChainCode,
		Error:         errMessage,
	})
}

func (a *AgentService) ProvideChainAddress(requestID, chain, address, errMessage string) error {
	return chainbridge.SubmitDeriveAddressResponse(chainbridge.DeriveAddressResponse{
		RequestID: requestID,
		Chain:     chain,
		Address:   address,
		Error:     errMessage,
	})
}

func (a *AgentService) ProvidePortfolio(responseJSON string) error {
	return portfoliobridge.SubmitPortfolioResponse(responseJSON)
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
	drainChan(a.passwordChan)

	requestID := uuid.New().String()
	runtime.EventsEmit(a.ctx, "agent:password_required", PasswordRequiredEvent{
		ConversationID: convID,
		ToolName:       toolName,
		Operation:      operation,
		RequestID:      requestID,
	})

	select {
	case password := <-a.passwordChan:
		return password, nil
	case <-ctx.Done():
		return "", ctx.Err()
	}
}

func (a *AgentService) waitForConfirmation(ctx context.Context, convID, action, details, toolCallID string) (bool, error) {
	drainChan(a.confirmChan)

	requestID := uuid.New().String()
	runtime.EventsEmit(a.ctx, "agent:confirmation_required", ConfirmationRequiredEvent{
		ConversationID: convID,
		Action:         action,
		Details:        details,
		ToolCallID:     toolCallID,
		RequestID:      requestID,
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

func (a *AgentService) emitToolProgress(convID string, toolCallID string, step string) {
	runtime.EventsEmit(a.ctx, "agent:tool_progress", ToolProgressEvent{
		ConversationID: convID,
		ToolCallID:     toolCallID,
		Step:           step,
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

	if strings.TrimSpace(newToken.Token) == "" {
		return "", fmt.Errorf("authentication returned empty token")
	}

	a.authTokensMu.Lock()
	a.authTokens[vault.PublicKeyECDSA] = newToken
	a.authTokensMu.Unlock()
	saveErr := a.store.SaveAgentAuthToken(vault.PublicKeyECDSA, newToken.Token, newToken.ExpiresAt)
	if saveErr != nil {
		a.Logger.WithError(saveErr).Warn("Failed to persist auth token")
	}

	return newToken.Token, nil
}

func (a *AgentService) getCachedAuthToken(vaultPubKey string) (*verifier.AuthToken, bool) {
	a.authTokensMu.RLock()
	token, ok := a.authTokens[vaultPubKey]
	a.authTokensMu.RUnlock()

	if !ok || token == nil {
		persistedToken, loaded := a.loadPersistedAuthToken(vaultPubKey)
		if !loaded {
			return nil, false
		}
		token = persistedToken
	}
	if strings.TrimSpace(token.Token) == "" {
		_ = a.store.DeleteAgentAuthToken(vaultPubKey)
		return nil, false
	}
	if token.ExpiresAt.Before(time.Now().Add(time.Hour)) {
		newToken, err := a.refreshAuthToken(vaultPubKey)
		if err == nil {
			return newToken, true
		}
		a.Logger.WithError(err).Debug("Token refresh failed, falling back to full re-auth")
		_ = a.store.DeleteAgentAuthToken(vaultPubKey)
		a.authTokensMu.Lock()
		delete(a.authTokens, vaultPubKey)
		a.authTokensMu.Unlock()
		return nil, false
	}
	return token, true
}

func (a *AgentService) refreshAuthToken(vaultPubKey string) (*verifier.AuthToken, error) {
	a.authTokensMu.RLock()
	token, ok := a.authTokens[vaultPubKey]
	a.authTokensMu.RUnlock()

	if !ok || token == nil || strings.TrimSpace(token.Token) == "" {
		return nil, fmt.Errorf("no cached token to refresh")
	}
	if token.ExpiresAt.Before(time.Now()) {
		return nil, fmt.Errorf("token already expired, cannot refresh")
	}

	newToken, err := a.verifierClient.RefreshToken(token.Token)
	if err != nil {
		return nil, fmt.Errorf("refresh request failed: %w", err)
	}

	a.authTokensMu.Lock()
	a.authTokens[vaultPubKey] = newToken
	a.authTokensMu.Unlock()

	saveErr := a.store.SaveAgentAuthToken(vaultPubKey, newToken.Token, newToken.ExpiresAt)
	if saveErr != nil {
		a.Logger.WithError(saveErr).Warn("Failed to persist refreshed auth token")
	}

	a.Logger.Info("Auth token refreshed successfully")
	return newToken, nil
}

func (a *AgentService) GetCachedAuthToken(vaultPubKey string) (string, time.Time, bool) {
	token, ok := a.getCachedAuthToken(vaultPubKey)
	if !ok || token == nil {
		return "", time.Time{}, false
	}
	return token.Token, token.ExpiresAt, true
}

func (a *AgentService) InvalidateAuthToken(vaultPubKey string) {
	a.authTokensMu.Lock()
	delete(a.authTokens, vaultPubKey)
	a.authTokensMu.Unlock()
	delErr := a.store.DeleteAgentAuthToken(vaultPubKey)
	if delErr != nil {
		a.Logger.WithError(delErr).Warn("Failed to delete persisted auth token")
	}
}

func (a *AgentService) loadPersistedAuthToken(vaultPubKey string) (*verifier.AuthToken, bool) {
	tokenValue, expiresAt, err := a.store.GetAgentAuthToken(vaultPubKey)
	if err != nil {
		return nil, false
	}

	token := &verifier.AuthToken{
		Token:     strings.TrimSpace(tokenValue),
		ExpiresAt: expiresAt,
	}
	if token.Token == "" {
		_ = a.store.DeleteAgentAuthToken(vaultPubKey)
		return nil, false
	}

	a.authTokensMu.Lock()
	a.authTokens[vaultPubKey] = token
	a.authTokensMu.Unlock()
	return token, true
}

func (a *AgentService) authenticate(ctx context.Context, vault *storage.Vault, password string) (*verifier.AuthToken, error) {
	if ctx == nil {
		ctx = context.Background()
	}
	authCtx, cancel := context.WithTimeout(ctx, authSignTimeout)
	defer cancel()

	authMessage, err := verifier.GenerateAuthMessage(vault.PublicKeyECDSA)
	if err != nil {
		return nil, fmt.Errorf("failed to generate auth message: %w", err)
	}

	a.Logger.Debug("Signing auth message")

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

	cfg := tools.KeysignConfig{
		AppCtx:      a.ctx,
		Ctx:         ctx,
		Vault:       vault,
		Password:    password,
		DerivePath:  authDerivePath,
		TSS:         a.tss,
		Logger:      a.Logger,
		MaxAttempts: 2,
	}
	return tools.FastVaultKeysign(cfg, messageHash)
}

func drainChan[T any](ch chan T) {
	select {
	case <-ch:
	default:
	}
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

	starters, err := parseStartersResponse(result.Content[0].Text)
	if err != nil {
		return nil, fmt.Errorf("failed to parse starters JSON: %w", err)
	}

	if len(starters) < expectedCount {
		return nil, fmt.Errorf("expected %d starters, got %d", expectedCount, len(starters))
	}

	return starters[:expectedCount], nil
}

func parseStartersResponse(raw string) ([]string, error) {
	raw = strings.TrimSpace(raw)
	if raw == "" {
		return nil, fmt.Errorf("empty response")
	}

	var starters []string
	if err := json.Unmarshal([]byte(raw), &starters); err == nil && len(starters) > 0 {
		return normalizeStarters(starters), nil
	}

	start := strings.Index(raw, "[")
	end := strings.LastIndex(raw, "]")
	if start >= 0 && end > start {
		candidate := raw[start : end+1]
		if err := json.Unmarshal([]byte(candidate), &starters); err == nil && len(starters) > 0 {
			return normalizeStarters(starters), nil
		}
	}

	lines := strings.Split(raw, "\n")
	for _, line := range lines {
		s := strings.TrimSpace(line)
		s = strings.TrimPrefix(s, "-")
		s = strings.TrimPrefix(s, "*")
		s = strings.TrimSpace(s)
		if s == "" {
			continue
		}
		if dot := strings.Index(s, ". "); dot > 0 && dot < 3 {
			s = strings.TrimSpace(s[dot+2:])
		}
		s = strings.Trim(s, "\"")
		if s != "" {
			starters = append(starters, s)
		}
	}
	if len(starters) > 0 {
		return normalizeStarters(starters), nil
	}

	return nil, fmt.Errorf("no starters found in response")
}

func normalizeStarters(input []string) []string {
	out := make([]string, 0, len(input))
	seen := make(map[string]bool)
	for _, item := range input {
		s := strings.TrimSpace(item)
		if s == "" {
			continue
		}
		key := strings.ToLower(s)
		if seen[key] {
			continue
		}
		seen[key] = true
		out = append(out, s)
	}
	return out
}
