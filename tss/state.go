package tss

import (
	"fmt"
)

type LocalStateAccessorImp struct {
	keyshares map[string]string
}

func NewLocalStateAccessorImp(keyshares map[string]string) (*LocalStateAccessorImp, error) {
	return &LocalStateAccessorImp{
		keyshares: keyshares,
	}, nil
}

func (l *LocalStateAccessorImp) GetLocalState(pubKey string) (string, error) {
	if localState, ok := l.keyshares[pubKey]; ok {
		return localState, nil
	}
	return "", fmt.Errorf("local state not found")
}

func (l *LocalStateAccessorImp) SaveLocalState(pubKey, localState string) error {
	l.keyshares[pubKey] = localState
	return nil
}
func (l *LocalStateAccessorImp) Reset(keyshares map[string]string) error {
	l.keyshares = keyshares
	return nil
}
