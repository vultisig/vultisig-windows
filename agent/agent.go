package agent

import (
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

	"github.com/vultisig/vultisig-win/agent/actions"
	"github.com/vultisig/vultisig-win/agent/backend"
	"github.com/vultisig/vultisig-win/agent/balancebridge"
	"github.com/vultisig/vultisig-win/agent/chainbridge"
	"github.com/vultisig/vultisig-win/agent/dklsbridge"
	"github.com/vultisig/vultisig-win/agent/portfoliobridge"
	"github.com/vultisig/vultisig-win/agent/signing"
	"github.com/vultisig/vultisig-win/agent/toolbridge"
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
	ErrNoVault          = errors.New("vault not found")
	ErrAgentBusy        = errors.New("agent is busy processing another request")
)

type AgentService struct {
	ctx              context.Context
	store            *storage.Store
	tss              *tss.TssService
	backendClient    *backend.Client
	executor         *actions.Executor
	verifierClient   *verifier.Client
	toolRegistry     *tools.Registry
	authTokens       map[string]*verifier.AuthToken
	authTokensMu     sync.RWMutex
	passwordChan     chan string
	confirmChan      chan bool
	cancelFunc       context.CancelFunc
	busy             bool
	busyMu           sync.Mutex
	preloadedCtx     *backend.MessageContext
	preloadedPubKey  string
	preloadedMu      sync.Mutex
	Logger           *logrus.Logger
	authenticateFn   func(context.Context, *storage.Vault, string) (*verifier.AuthToken, error)
}

func NewAgentService(store *storage.Store, tssService *tss.TssService) *AgentService {
	verifierClient := verifier.NewClient(GetVerifierURL())
	toolRegistry := tools.NewRegistry(store, tssService, verifierClient)
	backendClient := backend.NewClient()
	actionExecutor := actions.NewExecutor(store, toolRegistry)

	svc := &AgentService{
		store:           store,
		tss:             tssService,
		backendClient:   backendClient,
		executor:        actionExecutor,
		verifierClient:  verifierClient,
		toolRegistry:    toolRegistry,
		authTokens:      make(map[string]*verifier.AuthToken),
		passwordChan:    make(chan string, 1),
		confirmChan:     make(chan bool, 1),
		Logger:          logrus.WithField("module", "agent").Logger,
	}
	svc.authenticateFn = svc.authenticate
	return svc
}

func (a *AgentService) Startup(ctx context.Context) {
	a.ctx = ctx
	a.toolRegistry.SetAuthGetter(a)
}

func (a *AgentService) PreloadContext(vaultPubKey string) {
	go func() {
		vault, err := a.loadVault(vaultPubKey)
		if err != nil {
			a.Logger.WithError(err).Warn("failed to preload context")
			return
		}
		msgCtx := buildMessageContext(a.ctx, a.ctx, vault, a.store)
		a.preloadedMu.Lock()
		a.preloadedCtx = msgCtx
		a.preloadedPubKey = vaultPubKey
		a.preloadedMu.Unlock()
		a.Logger.Info("context preloaded")
	}()
}

func (a *AgentService) takePreloadedContext(vaultPubKey string) *backend.MessageContext {
	a.preloadedMu.Lock()
	defer a.preloadedMu.Unlock()
	if a.preloadedPubKey == vaultPubKey && a.preloadedCtx != nil {
		ctx := a.preloadedCtx
		a.preloadedCtx = nil
		a.preloadedPubKey = ""
		return ctx
	}
	return nil
}

func (a *AgentService) SendMessage(vaultPubKey, message string) (string, error) {
	a.busyMu.Lock()
	if a.busy {
		a.busyMu.Unlock()
		return "", ErrAgentBusy
	}
	a.busy = true
	a.busyMu.Unlock()

	vault, err := a.loadVault(vaultPubKey)
	if err != nil {
		a.setBusy(false)
		return "", err
	}

	authToken, ok := a.getCachedAuthToken(vaultPubKey)
	if !ok || authToken == nil {
		a.setBusy(false)
		return "", ErrPasswordRequired
	}

	conv, err := a.backendClient.CreateConversation(a.ctx, vaultPubKey, authToken.Token, nil)
	if err != nil {
		a.setBusy(false)
		return "", fmt.Errorf("create conversation: %w", err)
	}

	ctx, cancel := context.WithCancel(a.ctx)
	a.busyMu.Lock()
	a.cancelFunc = cancel
	a.busyMu.Unlock()

	go func() {
		defer a.setBusy(false)
		a.processMessage(ctx, conv.ID, vaultPubKey, message, vault, authToken.Token)
	}()

	return conv.ID, nil
}

func (a *AgentService) SendMessageToConversation(convID, vaultPubKey, message string) error {
	a.busyMu.Lock()
	if a.busy {
		a.busyMu.Unlock()
		return ErrAgentBusy
	}
	a.busy = true
	a.busyMu.Unlock()

	vault, err := a.loadVault(vaultPubKey)
	if err != nil {
		a.setBusy(false)
		return err
	}

	authToken, ok := a.getCachedAuthToken(vaultPubKey)
	if !ok || authToken == nil {
		a.setBusy(false)
		return ErrPasswordRequired
	}

	ctx, cancel := context.WithCancel(a.ctx)
	a.busyMu.Lock()
	a.cancelFunc = cancel
	a.busyMu.Unlock()

	go func() {
		defer a.setBusy(false)
		a.processMessage(ctx, convID, vaultPubKey, message, vault, authToken.Token)
	}()

	return nil
}

func (a *AgentService) processMessage(ctx context.Context, convID, vaultPubKey, message string, vault *storage.Vault, token string) {
	runtime.EventsEmit(a.ctx, "agent:loading", map[string]string{"conversationId": convID})

	msgCtx := a.takePreloadedContext(vaultPubKey)
	if msgCtx == nil {
		msgCtx = buildQuickMessageContext(vault, a.store)
	}

	req := &backend.SendMessageRequest{
		PublicKey: vaultPubKey,
		Content:   message,
		Context:   msgCtx,
	}

	resp, err := a.backendClient.SendMessage(ctx, convID, req, token)
	if err != nil {
		if errors.Is(err, context.Canceled) {
			runtime.EventsEmit(a.ctx, "agent:error", ErrorEvent{ConversationID: convID, Error: "agent stopped"})
			return
		}
		if errors.Is(err, backend.ErrUnauthorized) {
			a.InvalidateAuthToken(vaultPubKey)
			runtime.EventsEmit(a.ctx, "agent:auth_required", AuthRequiredEvent{
				ConversationID: convID,
				VaultPubKey:    vaultPubKey,
			})
			return
		}
		a.Logger.WithError(err).Error("backend send message failed")
		runtime.EventsEmit(a.ctx, "agent:error", ErrorEvent{ConversationID: convID, Error: err.Error()})
		return
	}

	a.handleBackendResponse(ctx, convID, vaultPubKey, vault, token, resp)
}

func (a *AgentService) handleBackendResponse(ctx context.Context, convID, vaultPubKey string, vault *storage.Vault, token string, resp *backend.SendMessageResponse) {
	if resp.Title != nil && strings.TrimSpace(*resp.Title) != "" {
		runtime.EventsEmit(a.ctx, "agent:title_updated", TitleUpdatedEvent{
			ConversationID: convID,
			Title:          strings.TrimSpace(*resp.Title),
		})
	}

	for _, action := range resp.Actions {
		pj, _ := json.Marshal(action.Params)
		a.Logger.WithField("type", action.Type).WithField("params", string(pj)).WithField("auto_execute", action.AutoExecute).WithField("shouldAuto", shouldAutoExecute(action)).Info("backend returned action")
	}

	nonAutoActions := filterNonAutoActions(resp.Actions)

	runtime.EventsEmit(a.ctx, "agent:response", ResponseEvent{
		ConversationID:  convID,
		Message:         resp.Message.Content,
		Actions:         nonAutoActions,
		Suggestions:     resp.Suggestions,
		PolicyReady:     resp.PolicyReady,
		InstallRequired: resp.InstallRequired,
	})

	if resp.TxReady != nil {
		runtime.EventsEmit(a.ctx, "agent:tx_ready", TxReadyEvent{
			ConversationID: convID,
			TxReady:        resp.TxReady,
		})
	}

	autoActions, buildAction := filterSwapBuild(filterAutoActions(resp.Actions))

	if buildAction != nil {
		a.Logger.WithField("action", buildAction.Type).Info("building swap quote async")
		go a.buildSwapQuoteAsync(ctx, convID, vaultPubKey, token, buildAction.Params, vault)
	}

	for _, action := range autoActions {
		if ctx.Err() != nil {
			return
		}

		paramsJSON, _ := json.Marshal(action.Params)
		a.Logger.WithField("action", action.Type).WithField("params", string(paramsJSON)).Info("auto-executing action")

		runtime.EventsEmit(a.ctx, "agent:tool_call", ToolCallEvent{
			ConversationID: convID,
			ActionID:       action.ID,
			ActionType:     action.Type,
			Title:          action.Title,
			Params:         action.Params,
		})

		result, err := a.executor.Execute(action, &actions.ExecuteParams{
			AppCtx:    a.ctx,
			Ctx:       ctx,
			Vault:     vault,
			AuthToken: token,
		})
		if err != nil {
			a.Logger.WithError(err).WithField("action", action.Type).Error("auto-execute failed")
			continue
		}

		runtime.EventsEmit(a.ctx, "agent:action_result", ActionResultEvent{
			ConversationID: convID,
			ActionID:       action.ID,
			ActionType:     action.Type,
			Success:        result.Success,
			Data:           result.Data,
			Error:          result.Error,
		})

		a.reportActionResult(ctx, convID, vaultPubKey, vault, token, result)
	}

	runtime.EventsEmit(a.ctx, "agent:complete", CompleteEvent{
		ConversationID: convID,
		Message: resp.Message.Content,
	})
}

func filterSwapBuild(actions []backend.Action) ([]backend.Action, *backend.Action) {
	var remaining []backend.Action
	var build *backend.Action
	for i := range actions {
		if actions[i].Type == "build_swap_tx" {
			build = &actions[i]
		} else {
			remaining = append(remaining, actions[i])
		}
	}
	return remaining, build
}

func (a *AgentService) buildSwapQuoteAsync(ctx context.Context, convID, vaultPubKey, token string, params map[string]any, vault *storage.Vault) {
	a.Logger.Info("starting async swap quote build")

	msgCtx := buildQuickMessageContext(vault, a.store)

	req := &backend.BuildSwapQuoteRequest{
		PublicKey: vaultPubKey,
		Params:    params,
		Context:   msgCtx,
	}

	resp, err := a.backendClient.BuildSwapQuote(ctx, convID, req, token)
	if err != nil {
		a.Logger.WithError(err).Error("async swap quote build failed")
		runtime.EventsEmit(a.ctx, "agent:error", ErrorEvent{
			ConversationID: convID,
			Error:          fmt.Sprintf("Failed to build swap: %v", err),
		})
		return
	}

	if resp.TxReady != nil {
		a.Logger.Info("async swap quote build complete")
		runtime.EventsEmit(a.ctx, "agent:tx_ready", TxReadyEvent{
			ConversationID: convID,
			TxReady:        resp.TxReady,
		})
		return
	}

	if len(resp.Actions) > 0 {
		for _, action := range resp.Actions {
			if ctx.Err() != nil {
				return
			}

			a.Logger.WithField("action", action.Type).Info("executing recovery action from swap build")

			runtime.EventsEmit(a.ctx, "agent:tool_call", ToolCallEvent{
				ConversationID: convID,
				ActionID:       action.ID,
				ActionType:     action.Type,
				Title:          action.Title,
				Params:         action.Params,
			})

			result, execErr := a.executor.Execute(action, &actions.ExecuteParams{
				AppCtx:    a.ctx,
				Ctx:       ctx,
				Vault:     vault,
				AuthToken: token,
			})
			if execErr != nil {
				a.Logger.WithError(execErr).WithField("action", action.Type).Error("recovery action failed")
				continue
			}

			runtime.EventsEmit(a.ctx, "agent:action_result", ActionResultEvent{
				ConversationID: convID,
				ActionID:       action.ID,
				ActionType:     action.Type,
				Success:        result.Success,
				Data:           result.Data,
				Error:          result.Error,
			})

			a.reportActionResult(ctx, convID, vaultPubKey, vault, token, result)
		}
		return
	}

	errMsg := resp.Message
	if resp.Error != "" {
		errMsg = resp.Error
	}
	if errMsg != "" {
		runtime.EventsEmit(a.ctx, "agent:error", ErrorEvent{
			ConversationID: convID,
			Error:          errMsg,
		})
	}
}

func (a *AgentService) pollTxStatus(convID, chain, txHash, label string) {
	rpcURL, err := signing.GetEVMRPCURL(chain)
	if err != nil {
		a.Logger.WithError(err).WithField("chain", chain).Warn("cannot poll tx status: unsupported chain")
		return
	}

	pollCtx, pollCancel := context.WithTimeout(a.ctx, 3*time.Minute)
	defer pollCancel()

	signing.PollTxStatus(pollCtx, rpcURL, txHash, func(status signing.TxPollStatus) {
		runtime.EventsEmit(a.ctx, "agent:tx_status", TxStatusEvent{
			ConversationID: convID,
			TxHash:         txHash,
			Chain:          chain,
			Status:         status.Status,
			Label:          label,
		})
	})
}

func (a *AgentService) reportActionResult(ctx context.Context, convID, vaultPubKey string, vault *storage.Vault, token string, result *backend.ActionResult) {
	msgCtx := buildMessageContext(a.ctx, ctx, vault, nil)

	req := &backend.SendMessageRequest{
		PublicKey:    vaultPubKey,
		ActionResult: result,
		Context:     msgCtx,
	}

	resp, err := a.backendClient.SendMessage(ctx, convID, req, token)
	if err != nil {
		a.Logger.WithError(err).Error("failed to report action result to backend")
		return
	}

	a.handleBackendResponse(ctx, convID, vaultPubKey, vault, token, resp)
}

func (a *AgentService) ExecuteAction(convID, vaultPubKey, actionJSON string) error {
	a.busyMu.Lock()
	if a.busy {
		a.busyMu.Unlock()
		return ErrAgentBusy
	}
	a.busy = true
	a.busyMu.Unlock()

	var action backend.Action
	err := json.Unmarshal([]byte(actionJSON), &action)
	if err != nil {
		a.setBusy(false)
		return fmt.Errorf("invalid action JSON: %w", err)
	}

	vault, err := a.loadVault(vaultPubKey)
	if err != nil {
		a.setBusy(false)
		return err
	}

	authToken, ok := a.getCachedAuthToken(vaultPubKey)
	if !ok || authToken == nil {
		a.setBusy(false)
		return ErrPasswordRequired
	}

	ctx, cancel := context.WithCancel(a.ctx)
	a.busyMu.Lock()
	a.cancelFunc = cancel
	a.busyMu.Unlock()

	go func() {
		defer a.setBusy(false)
		a.executeAndReport(ctx, convID, vaultPubKey, vault, authToken.Token, action)
	}()

	return nil
}

func (a *AgentService) executeAndReport(ctx context.Context, convID, vaultPubKey string, vault *storage.Vault, token string, action backend.Action) {
	runtime.EventsEmit(a.ctx, "agent:loading", map[string]string{"conversationId": convID})

	params := &actions.ExecuteParams{
		AppCtx:    a.ctx,
		Ctx:       ctx,
		Vault:     vault,
		AuthToken: token,
	}

	if a.executor.NeedsPassword(action.Type) {
		password, err := a.waitForPassword(ctx, convID, action.Type, action.Title)
		if err != nil {
			runtime.EventsEmit(a.ctx, "agent:error", ErrorEvent{ConversationID: convID, Error: err.Error()})
			return
		}
		params.Password = password
	}

	if a.executor.NeedsConfirmation(action.Type) {
		confirmed, err := a.waitForConfirmation(ctx, convID, action.Type, action.Title, action.ID)
		if err != nil {
			runtime.EventsEmit(a.ctx, "agent:error", ErrorEvent{ConversationID: convID, Error: err.Error()})
			return
		}
		if !confirmed {
			runtime.EventsEmit(a.ctx, "agent:complete", CompleteEvent{ConversationID: convID, Message: "Action cancelled."})
			return
		}
		params.Confirmed = true
	}

	result, err := a.executor.Execute(action, params)
	if err != nil {
		a.Logger.WithError(err).WithField("action", action.Type).Error("action execution failed")
		runtime.EventsEmit(a.ctx, "agent:error", ErrorEvent{ConversationID: convID, Error: err.Error()})
		return
	}

	runtime.EventsEmit(a.ctx, "agent:action_result", ActionResultEvent{
		ConversationID: convID,
		ActionID:       action.ID,
		ActionType:     action.Type,
		Success:        result.Success,
		Data:           result.Data,
		Error:          result.Error,
	})

	if action.Type == "sign_swap_tx" && result.Success && result.Data != nil {
		txHash, _ := result.Data["tx_hash"].(string)
		chain, _ := result.Data["chain"].(string)
		approvalHash, _ := result.Data["approval_tx_hash"].(string)
		if approvalHash != "" {
			go a.pollTxStatus(convID, chain, approvalHash, "Approval")
		}
		if txHash != "" && chain != "" {
			go a.pollTxStatus(convID, chain, txHash, "Swap")
		}
	}

	a.reportActionResult(ctx, convID, vaultPubKey, vault, token, result)
}

func (a *AgentService) SelectSuggestion(convID, vaultPubKey, suggestionID string) error {
	a.busyMu.Lock()
	if a.busy {
		a.busyMu.Unlock()
		return ErrAgentBusy
	}
	a.busy = true
	a.busyMu.Unlock()

	vault, err := a.loadVault(vaultPubKey)
	if err != nil {
		a.setBusy(false)
		return err
	}

	authToken, ok := a.getCachedAuthToken(vaultPubKey)
	if !ok || authToken == nil {
		a.setBusy(false)
		return ErrPasswordRequired
	}

	ctx, cancel := context.WithCancel(a.ctx)
	a.busyMu.Lock()
	a.cancelFunc = cancel
	a.busyMu.Unlock()

	go func() {
		defer a.setBusy(false)

		runtime.EventsEmit(a.ctx, "agent:loading", map[string]string{"conversationId": convID})

		msgCtx := a.takePreloadedContext(vaultPubKey)
		if msgCtx == nil {
			msgCtx = buildQuickMessageContext(vault, nil)
		}
		req := &backend.SendMessageRequest{
			PublicKey:            vaultPubKey,
			SelectedSuggestionID: &suggestionID,
			Context:              msgCtx,
		}

		resp, err := a.backendClient.SendMessage(ctx, convID, req, authToken.Token)
		if err != nil {
			a.Logger.WithError(err).Error("backend suggestion selection failed")
			runtime.EventsEmit(a.ctx, "agent:error", ErrorEvent{ConversationID: convID, Error: err.Error()})
			return
		}

		a.handleBackendResponse(ctx, convID, vaultPubKey, vault, authToken.Token, resp)
	}()

	return nil
}

func (a *AgentService) CreateConversation(vaultPubKey string) (string, error) {
	authToken, ok := a.getCachedAuthToken(vaultPubKey)
	if !ok || authToken == nil {
		return "", ErrPasswordRequired
	}

	ctx := a.ctx
	if ctx == nil {
		ctx = context.Background()
	}

	conv, err := a.backendClient.CreateConversation(ctx, vaultPubKey, authToken.Token, nil)
	if err != nil {
		return "", fmt.Errorf("create conversation: %w", err)
	}

	return conv.ID, nil
}

func (a *AgentService) GetConversations(vaultPubKey string) ([]backend.Conversation, error) {
	authToken, ok := a.getCachedAuthToken(vaultPubKey)
	if !ok || authToken == nil {
		return nil, ErrPasswordRequired
	}

	ctx := a.ctx
	if ctx == nil {
		ctx = context.Background()
	}

	resp, err := a.backendClient.ListConversations(ctx, vaultPubKey, 0, 50, authToken.Token)
	if err != nil {
		return nil, fmt.Errorf("list conversations: %w", err)
	}

	return resp.Conversations, nil
}

func (a *AgentService) GetConversation(convID, vaultPubKey string) (*backend.ConversationWithMessages, error) {
	authToken, ok := a.getCachedAuthToken(vaultPubKey)
	if !ok || authToken == nil {
		return nil, ErrPasswordRequired
	}

	ctx := a.ctx
	if ctx == nil {
		ctx = context.Background()
	}

	return a.backendClient.GetConversation(ctx, convID, vaultPubKey, authToken.Token)
}

func (a *AgentService) DeleteConversation(convID, vaultPubKey string) error {
	authToken, ok := a.getCachedAuthToken(vaultPubKey)
	if !ok || authToken == nil {
		return ErrPasswordRequired
	}

	ctx := a.ctx
	if ctx == nil {
		ctx = context.Background()
	}

	return a.backendClient.DeleteConversation(ctx, convID, vaultPubKey, authToken.Token)
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

func (a *AgentService) ProvideChainAddress(requestID, chain, address, ticker string, decimals int, logo, priceProviderID, errMessage string) error {
	return chainbridge.SubmitDeriveAddressResponse(chainbridge.DeriveAddressResponse{
		RequestID:       requestID,
		Chain:           chain,
		Address:         address,
		Ticker:          ticker,
		Decimals:        int32(decimals),
		Logo:            logo,
		PriceProviderID: priceProviderID,
		Error:           errMessage,
	})
}

func (a *AgentService) ProvidePortfolio(responseJSON string) error {
	return portfoliobridge.SubmitPortfolioResponse(responseJSON)
}

func (a *AgentService) ProvideBalance(responseJSON string) error {
	return balancebridge.SubmitBalanceResponse(responseJSON)
}

func (a *AgentService) ProvideToolResult(responseJSON string) error {
	return toolbridge.SubmitToolResponse(responseJSON)
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
	if err != nil {
		errMsg := err.Error()
		if strings.Contains(errMsg, "fast vault server returned status") ||
			strings.Contains(errMsg, "failed to sign auth message") {
			return fmt.Errorf("incorrect password or signing failed — please try again")
		}
		return err
	}

	if a.ctx != nil {
		runtime.EventsEmit(a.ctx, "agent:auth_connected")
	}
	return nil
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
	saveErr := a.store.SaveAgentAuthToken(vault.PublicKeyECDSA, newToken.Token, newToken.RefreshToken, newToken.ExpiresAt)
	if saveErr != nil {
		a.Logger.WithError(saveErr).Warn("Failed to persist auth token")
	}

	return newToken.Token, nil
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

func (a *AgentService) Disconnect(vaultPubKey string) {
	token, ok := a.getCachedAuthToken(vaultPubKey)
	if ok && token != nil {
		err := a.verifierClient.RevokeAllTokens(token.Token)
		if err != nil {
			a.Logger.WithError(err).Warn("Failed to revoke tokens on verifier")
		}
	}
	a.InvalidateAuthToken(vaultPubKey)
}

type AuthTokenInfo struct {
	Connected bool      `json:"connected"`
	ExpiresAt time.Time `json:"expiresAt"`
}

func (a *AgentService) GetAuthTokenInfo(vaultPubKey string) AuthTokenInfo {
	token, ok := a.getCachedAuthToken(vaultPubKey)
	if !ok || token == nil {
		return AuthTokenInfo{}
	}

	err := a.verifierClient.ValidateToken(token.Token)
	if err != nil {
		a.InvalidateAuthToken(vaultPubKey)
		return AuthTokenInfo{}
	}

	return AuthTokenInfo{
		Connected: true,
		ExpiresAt: token.ExpiresAt,
	}
}

type ServiceStatus struct {
	FastVaultServer bool `json:"fastVaultServer"`
	Verifier        bool `json:"verifier"`
	AgentBackend    bool `json:"agentBackend"`
	Authenticated   bool `json:"authenticated"`
}

func (a *AgentService) CheckServices(vaultPubKey string) ServiceStatus {
	client := &http.Client{Timeout: 5 * time.Second}

	check := func(url string) bool {
		resp, err := client.Get(url)
		if err != nil {
			return false
		}
		resp.Body.Close()
		return resp.StatusCode < 500
	}

	verifierURL := GetVerifierURL()
	backendURL := a.backendClient.BaseURL()

	type result struct {
		name string
		ok   bool
	}

	numChecks := 3
	var accessToken string
	if vaultPubKey != "" {
		token, ok := a.getCachedAuthToken(vaultPubKey)
		if ok && token != nil {
			accessToken = token.Token
		}
	}
	if accessToken != "" {
		numChecks = 4
	}

	ch := make(chan result, numChecks)

	go func() { ch <- result{"fast", check("https://api.vultisig.com/ping")} }()
	go func() { ch <- result{"verifier", check(verifierURL + "/ping")} }()
	go func() { ch <- result{"backend", check(backendURL + "/ping")} }()
	if accessToken != "" {
		go func() {
			err := a.verifierClient.ValidateToken(accessToken)
			ch <- result{"auth", err == nil}
		}()
	}

	status := ServiceStatus{}
	for i := 0; i < numChecks; i++ {
		r := <-ch
		switch r.name {
		case "fast":
			status.FastVaultServer = r.ok
		case "verifier":
			status.Verifier = r.ok
		case "backend":
			status.AgentBackend = r.ok
		case "auth":
			status.Authenticated = r.ok
		}
	}

	return status
}

// --- internal helpers ---

func (a *AgentService) loadVault(vaultPubKey string) (*storage.Vault, error) {
	vault, err := a.store.GetVault(vaultPubKey)
	if err != nil {
		return nil, fmt.Errorf("failed to get vault: %w", err)
	}
	coins, err := a.store.GetVaultCoins(vaultPubKey)
	if err != nil {
		return nil, fmt.Errorf("failed to get vault coins: %w", err)
	}
	vault.Coins = coins
	return vault, nil
}

func (a *AgentService) setBusy(busy bool) {
	a.busyMu.Lock()
	a.busy = busy
	a.busyMu.Unlock()
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
	if token.ExpiresAt.Before(time.Now().Add(5 * time.Minute)) {
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

	if !ok || token == nil {
		return nil, fmt.Errorf("no cached token to refresh")
	}
	if strings.TrimSpace(token.RefreshToken) == "" {
		return nil, fmt.Errorf("no refresh token available, full re-auth required")
	}

	newToken, err := a.verifierClient.RefreshToken(token.RefreshToken)
	if err != nil {
		return nil, fmt.Errorf("refresh request failed: %w", err)
	}

	a.authTokensMu.Lock()
	a.authTokens[vaultPubKey] = newToken
	a.authTokensMu.Unlock()

	saveErr := a.store.SaveAgentAuthToken(vaultPubKey, newToken.Token, newToken.RefreshToken, newToken.ExpiresAt)
	if saveErr != nil {
		a.Logger.WithError(saveErr).Warn("Failed to persist refreshed auth token")
	}

	return newToken, nil
}

func (a *AgentService) loadPersistedAuthToken(vaultPubKey string) (*verifier.AuthToken, bool) {
	tokenValue, refreshToken, expiresAt, err := a.store.GetAgentAuthToken(vaultPubKey)
	if err != nil {
		return nil, false
	}

	tokenValue = strings.TrimSpace(tokenValue)
	if tokenValue == "" {
		_ = a.store.DeleteAgentAuthToken(vaultPubKey)
		return nil, false
	}

	jwtExpiry := verifier.ParseJWTExpiry(tokenValue)
	if !jwtExpiry.IsZero() && jwtExpiry.Before(expiresAt) {
		expiresAt = jwtExpiry
	}

	token := &verifier.AuthToken{
		Token:        tokenValue,
		RefreshToken: refreshToken,
		ExpiresAt:    expiresAt,
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

	signature, err := a.signMessage(authCtx, vault, password, authMessage)
	if err != nil {
		return nil, fmt.Errorf("failed to sign auth message: %w", err)
	}

	token, err := a.verifierClient.Authenticate(vault.PublicKeyECDSA, vault.HexChainCode, signature, authMessage)
	if err != nil {
		return nil, fmt.Errorf("authentication failed: %w", err)
	}

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

func (a *AgentService) waitForConfirmation(ctx context.Context, convID, action, details, actionID string) (bool, error) {
	drainChan(a.confirmChan)

	requestID := uuid.New().String()
	runtime.EventsEmit(a.ctx, "agent:confirmation_required", ConfirmationRequiredEvent{
		ConversationID: convID,
		Action:         action,
		Details:        details,
		ActionID:       actionID,
		RequestID:      requestID,
	})

	select {
	case confirmed := <-a.confirmChan:
		return confirmed, nil
	case <-ctx.Done():
		return false, ctx.Err()
	}
}

func drainChan[T any](ch chan T) {
	select {
	case <-ch:
	default:
	}
}

func filterAutoActions(allActions []backend.Action) []backend.Action {
	var result []backend.Action
	for _, a := range allActions {
		if shouldAutoExecute(a) {
			result = append(result, a)
		}
	}
	return result
}

func filterNonAutoActions(allActions []backend.Action) []backend.Action {
	var result []backend.Action
	for _, a := range allActions {
		if !shouldAutoExecute(a) {
			result = append(result, a)
		}
	}
	return result
}

var alwaysAutoExecute = map[string]bool{
	"add_chain":            true,
	"add_coin":             true,
	"remove_coin":          true,
	"remove_chain":         true,
	"address_book_add":     true,
	"address_book_remove":  true,
	"get_address_book":     true,
	"get_market_price":     true,
	"get_balances":         true,
	"get_portfolio":        true,
	"search_token":         true,
	"build_swap_tx":        true,
}

func shouldAutoExecute(action backend.Action) bool {
	if alwaysAutoExecute[action.Type] {
		return true
	}
	switch action.Type {
	case "initiate_send":
		addr, _ := action.Params["address"].(string)
		return strings.TrimSpace(addr) != ""
	default:
		return action.AutoExecute
	}
}
