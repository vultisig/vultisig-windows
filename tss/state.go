package tss

import (
	"fmt"
	"os"
	"path/filepath"
)

type LocalStateAccessorImp struct {
	Key    string
	Folder string
}

func NewLocalStateAccessorImp(key, folder string) (*LocalStateAccessorImp, error) {
	localStateAccessor := &LocalStateAccessorImp{
		Key:    key,
		Folder: folder,
	}

	var err error
	if localStateAccessor.Folder == "" {
		localStateAccessor.Folder, err = os.Getwd()
		if err != nil {
			return nil, fmt.Errorf("failed to get current directory: %w", err)
		}
	}

	return localStateAccessor, nil
}

func (l *LocalStateAccessorImp) GetLocalState(pubKey string) (string, error) {
	fileName := filepath.Join(l.Folder, pubKey+"-"+l.Key+".json")
	if _, err := os.Stat(fileName); os.IsNotExist(err) {
		return "", fmt.Errorf("file %s does not exist", fileName)
	}

	buf, err := os.ReadFile(fileName)
	if err != nil {
		return "", fmt.Errorf("fail to read file %s: %w", fileName, err)
	}

	return string(buf), nil
}

func (l *LocalStateAccessorImp) SaveLocalState(pubKey, localState string) error {
	fileName := filepath.Join(l.Folder, pubKey+"-"+l.Key+".json")

	return os.WriteFile(fileName, []byte(localState), 0644)
}

func (l *LocalStateAccessorImp) RemoveLocalState(pubKey string) error {
	fileName := filepath.Join(l.Folder, pubKey+"-"+l.Key+".json")
	return os.Remove(fileName)
}
