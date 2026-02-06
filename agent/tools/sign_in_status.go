package tools

import (
	"fmt"
	"time"
)

type AuthTokenGetter interface {
	GetCachedAuthToken(vaultPubKey string) (token string, expiresAt time.Time, ok bool)
}

type SignInStatusTool struct {
	authGetter AuthTokenGetter
}

func NewSignInStatusTool(authGetter AuthTokenGetter) *SignInStatusTool {
	return &SignInStatusTool{
		authGetter: authGetter,
	}
}

func (t *SignInStatusTool) Name() string {
	return "sign_in_status"
}

func (t *SignInStatusTool) Description() string {
	return "Check if the vault is signed in to the verifier and get token expiry information."
}

func (t *SignInStatusTool) InputSchema() map[string]any {
	return map[string]any{}
}

func (t *SignInStatusTool) RequiresPassword() bool {
	return false
}

func (t *SignInStatusTool) RequiresConfirmation() bool {
	return false
}

func (t *SignInStatusTool) Execute(input map[string]any, ctx *ExecutionContext) (any, error) {
	if t.authGetter == nil {
		return map[string]any{
			"signed_in": false,
			"message":   "Auth service not available",
		}, nil
	}

	token, expiresAt, ok := t.authGetter.GetCachedAuthToken(ctx.VaultPubKey)
	if !ok || token == "" {
		return map[string]any{
			"signed_in": false,
			"message":   "Not signed in to verifier. Password will be required for plugin/policy operations.",
		}, nil
	}

	now := time.Now()
	timeUntilExpiry := expiresAt.Sub(now)
	expiresInHours := int(timeUntilExpiry.Hours())
	expiresInDays := expiresInHours / 24

	var expiryStr string
	if expiresInDays > 0 {
		expiryStr = fmt.Sprintf("%d days", expiresInDays)
	} else if expiresInHours > 0 {
		expiryStr = fmt.Sprintf("%d hours", expiresInHours)
	} else {
		expiryStr = fmt.Sprintf("%d minutes", int(timeUntilExpiry.Minutes()))
	}

	return map[string]any{
		"signed_in":  true,
		"expires_at": expiresAt.Format(time.RFC3339),
		"expires_in": expiryStr,
		"message":    fmt.Sprintf("Signed in to verifier. Token expires in %s.", expiryStr),
	}, nil
}
