package relay

import (
	"context"
	"fmt"
	"time"

	"github.com/patrickmn/go-cache"

	"github.com/vultisig/vultisig-relay/contexthelper"
	"github.com/vultisig/vultisig-relay/model"
)

var _ Storage = (*InMemoryStorage)(nil)

// Storage is an interface that defines the methods to be implemented by a storage.
type Storage interface {
	SetSession(ctx context.Context, key string, participants []string) error
	GetSession(ctx context.Context, key string) ([]string, error)
	DeleteSession(ctx context.Context, key string) error
	GetMessages(ctx context.Context, key string) ([]model.Message, error)
	SetMessage(ctx context.Context, key string, message model.Message) error
	DeleteMessages(ctx context.Context, key string) error
	DeleteMessage(ctx context.Context, key string, hash string) error
	SetValue(ctx context.Context, key string, value string) error
	GetValue(ctx context.Context, key string) (string, error)
}

type InMemoryStorage struct {
	cache *cache.Cache
}

func NewInMemoryStorage() (Storage, error) {
	return &InMemoryStorage{
		cache: cache.New(time.Minute*5, time.Minute*10),
	}, nil
}
func (s *InMemoryStorage) SetSession(ctx context.Context, key string, participants []string) error {
	if contexthelper.CheckCancellation(ctx) != nil {
		return ctx.Err()
	}
	existingParticipants, err := s.GetSession(ctx, key)
	if err != nil && err.Error() != "session not found" {
		return fmt.Errorf("fail to get existing session %s, err: %w", key, err)
	}
	var participantsToAdd []string
	for _, p := range participants {
		needAdd := true
		for _, existingP := range existingParticipants {
			if p == existingP {
				needAdd = false
				continue
			}
		}
		// add the participant if it does not exist
		if needAdd {
			participantsToAdd = append(participantsToAdd, p)
		}
	}
	s.cache.Set(key, append(existingParticipants, participantsToAdd...), cache.DefaultExpiration)
	return nil
}

func (s *InMemoryStorage) GetSession(ctx context.Context, key string) ([]string, error) {
	if contexthelper.CheckCancellation(ctx) != nil {
		return nil, ctx.Err()
	}
	if x, found := s.cache.Get(key); found {
		return x.([]string), nil
	}
	return nil, fmt.Errorf("session not found")
}

func (s *InMemoryStorage) DeleteSession(ctx context.Context, key string) error {
	if contexthelper.CheckCancellation(ctx) != nil {
		return ctx.Err()
	}
	s.cache.Delete(key)
	return nil
}

func (s *InMemoryStorage) GetMessages(ctx context.Context, key string) ([]model.Message, error) {
	if contexthelper.CheckCancellation(ctx) != nil {
		return nil, ctx.Err()
	}
	if x, found := s.cache.Get(key); found {
		return x.([]model.Message), nil
	}
	return nil, fmt.Errorf("messages not found")
}

func (s *InMemoryStorage) SetMessage(ctx context.Context, key string, message model.Message) error {
	if contexthelper.CheckCancellation(ctx) != nil {
		return ctx.Err()
	}
	existingMessages, err := s.GetMessages(ctx, key)
	if err != nil {
		return fmt.Errorf("fail to get existing messages, err: %w", err)
	}
	for _, m := range existingMessages {
		if m.Hash == message.Hash {
			return nil
		}
	}
	existingMessages = append(existingMessages, message)
	s.cache.Set(key, existingMessages, cache.DefaultExpiration)
	return nil
}

func (s *InMemoryStorage) DeleteMessages(ctx context.Context, key string) error {
	if contexthelper.CheckCancellation(ctx) != nil {
		return ctx.Err()
	}
	s.cache.Delete(key)
	return nil
}

func (s *InMemoryStorage) DeleteMessage(ctx context.Context, key string, hash string) error {
	if contexthelper.CheckCancellation(ctx) != nil {
		return ctx.Err()
	}
	existingMessages, err := s.GetMessages(ctx, key)
	if err != nil {
		return fmt.Errorf("fail to get existing messages, err: %w", err)
	}
	var updatedMessages []model.Message
	for _, m := range existingMessages {
		if m.Hash != hash {
			updatedMessages = append(updatedMessages, m)
		}
	}
	s.cache.Set(key, updatedMessages, cache.DefaultExpiration)
	return nil
}

func (s *InMemoryStorage) SetValue(ctx context.Context, key string, value string) error {
	if contexthelper.CheckCancellation(ctx) != nil {
		return ctx.Err()
	}
	s.cache.Set(key, value, cache.DefaultExpiration)
	return nil
}

func (s *InMemoryStorage) GetValue(ctx context.Context, key string) (string, error) {
	if contexthelper.CheckCancellation(ctx) != nil {
		return "", ctx.Err()
	}
	if x, found := s.cache.Get(key); found {
		return x.(string), nil
	}
	return "", fmt.Errorf("value not found")
}
