package tss

import (
	"context"
	"fmt"

	mtss "github.com/vultisig/mobile-tss-lib/tss"
)

type TssService struct {
	ctx        context.Context
	serviceIns *mtss.ServiceImpl
}

func NewTssService() *TssService {
	return &TssService{}
}

func (t *TssService) startup(ctx context.Context) {
	t.ctx = ctx
}
func (t *TssService) Send(from, to, body string) error {
	return nil
}
func (t *TssService) GetLocalState(pubKey string) (string, error) {
	return "", nil
}
func (t *TssService) SaveLocalState(pubkey, localState string) error {
	return nil
}
func (t *TssService) StartTssInstance() error {
	var err error
	t.serviceIns, err = mtss.NewService(t, t, true)
	if err != nil {
		return fmt.Errorf("fail to create Tss instance,err:%w", err)
	}
	return nil
}

// GetDerivedPubKey returns the derived public key
func (t *TssService) GetDerivedPubKey(hexPubKey, hexChainCode, path string, isEdDSA bool) (string, error) {
	return mtss.GetDerivedPubKey(hexPubKey, hexChainCode, path, isEdDSA)
}
