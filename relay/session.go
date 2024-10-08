package relay

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/sirupsen/logrus"
	"github.com/vultisig/mobile-tss-lib/tss"

	"github.com/vultisig/vultisig-win/utils"
)

// Client is the client for the relay server
type Client struct {
	vultisigRelay string
	client        http.Client
	Logger        *logrus.Logger
}

// NewClient creates a new client for the relay server
func NewClient(vultisigRelay string) *Client {
	return &Client{
		vultisigRelay: vultisigRelay,
		client: http.Client{
			Timeout: 5 * time.Second,
		},
		Logger: logrus.WithField("module", "relay").Logger,
	}
}

func (s *Client) StartSession(sessionID string, parties []string) error {
	if sessionID == "" {
		return fmt.Errorf("sessionID is empty")
	}
	sessionURL := s.vultisigRelay + "/start/" + sessionID
	body, err := json.Marshal(parties)
	if err != nil {
		return fmt.Errorf("fail to start session: %w", err)
	}
	req, err := http.NewRequest(http.MethodPost, sessionURL, bytes.NewBuffer(body))
	if err != nil {
		return fmt.Errorf("fail to start session: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")
	resp, err := s.client.Do(req)
	if err != nil {
		return fmt.Errorf("fail to start session: %w", err)
	}
	defer s.closer(resp.Body)
	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("fail to start session: %s", resp.Status)
	}
	return nil
}

func (s *Client) RegisterSession(sessionID string, key string) error {
	if sessionID == "" {
		return fmt.Errorf("sessionID is empty")
	}
	sessionURL := s.vultisigRelay + "/" + sessionID
	buf, err := json.Marshal([]string{key})
	if err != nil {
		return fmt.Errorf("fail to register session: %w", err)
	}
	s.Logger.WithFields(logrus.Fields{
		"session": sessionID,
		"key":     key,
	}).Info("Registering session")
	resp, err := s.client.Post(sessionURL, "application/json", bytes.NewBuffer(buf))
	if err != nil {
		return fmt.Errorf("fail to register session: %w", err)
	}
	defer s.closer(resp.Body)
	if resp.StatusCode != http.StatusCreated {
		return fmt.Errorf("fail to register session: %s", resp.Status)
	}

	return nil
}
func (s *Client) closer(closer io.Closer) {
	if err := closer.Close(); err != nil {
		s.Logger.Error("Failed to close response body")
	}
}

func (s *Client) WaitForSessionStart(ctx context.Context, sessionID string) ([]string, error) {
	sessionURL := s.vultisigRelay + "/start/" + sessionID
	for {
		select {
		case <-ctx.Done():
			return nil, ctx.Err()
		default:
			s.Logger.WithFields(logrus.Fields{
				"session": sessionID,
			}).Info("Waiting for session start")
			resp, err := s.client.Get(sessionURL)
			if err != nil {
				return nil, fmt.Errorf("fail to get session: %w", err)
			}
			if resp.StatusCode != http.StatusOK {
				return nil, fmt.Errorf("fail to get session: %s", resp.Status)
			}
			var parties []string
			buff, err := io.ReadAll(resp.Body)
			if err != nil {
				return nil, fmt.Errorf("fail to read session body: %w", err)
			}
			if err := resp.Body.Close(); err != nil {
				s.Logger.Errorf("fail to close response body, %w", err)
			}
			if err := json.Unmarshal(buff, &parties); err != nil {
				return nil, fmt.Errorf("fail to unmarshal session body: %w", err)
			}
			//remove duplicates from parties
			distinctParties := make(map[string]struct{})
			for _, party := range parties {
				distinctParties[party] = struct{}{}
			}
			parties = make([]string, 0, len(distinctParties))
			for party := range distinctParties {
				parties = append(parties, party)
			}
			// We need to hold expected parties to start session
			if len(parties) > 1 {
				s.Logger.WithFields(logrus.Fields{
					"session": sessionID,
					"parties": parties,
				}).Info("All parties joined")
				return parties, nil
			}

			s.Logger.WithFields(logrus.Fields{
				"session": sessionID,
			}).Info("Waiting for someone to start session")

			// backoff
			time.Sleep(1 * time.Second)
		}
	}
}

func (s *Client) GetSession(sessionID string) ([]string, error) {
	sessionURL := s.vultisigRelay + "/" + sessionID
	resp, err := s.client.Get(sessionURL)
	if err != nil {
		return nil, fmt.Errorf("fail to get session: %w", err)
	}
	defer s.closer(resp.Body)
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("fail to get session: %s", resp.Status)
	}
	var parties []string
	if err := json.NewDecoder(resp.Body).Decode(&parties); err != nil {
		return nil, fmt.Errorf("fail to unmarshal session body: %w", err)
	}
	return parties, nil
}

// CompleteSession sends a request to the relay server to complete the session
func (s *Client) CompleteSession(sessionID, localPartyID string) error {
	sessionURL := s.vultisigRelay + "/complete/" + sessionID
	parties := []string{localPartyID}
	body, err := json.Marshal(parties)
	if err != nil {
		return fmt.Errorf("fail to complete session: %w", err)
	}
	req, err := http.NewRequest(http.MethodPost, sessionURL, bytes.NewBuffer(body))
	if err != nil {
		return fmt.Errorf("fail to complete session: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")
	resp, err := s.client.Do(req)
	if err != nil {
		return fmt.Errorf("fail to complete session: %w", err)
	}
	defer s.closer(resp.Body)
	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("fail to complete session: %s", resp.Status)
	}
	return nil
}

func (s *Client) CheckCompletedParties(sessionID string, partiesJoined []string) (bool, error) {
	sessionURL := s.vultisigRelay + "/complete/" + sessionID
	start := time.Now()
	timeout := time.Minute
	for {
		req, err := http.NewRequest(http.MethodGet, sessionURL, nil)
		if err != nil {
			return false, fmt.Errorf("fail to check completed parties: %w", err)
		}

		req.Header.Set("Content-Type", "application/json")
		resp, err := s.client.Do(req)
		if err != nil {
			return false, fmt.Errorf("fail to check completed parties: %w", err)
		}
		if resp.StatusCode != http.StatusOK {
			return false, fmt.Errorf("fail to check completed parties: %s", resp.Status)
		}
		result, err := io.ReadAll(resp.Body)
		if err != nil {
			return false, fmt.Errorf("fail to fetch request: %w", err)
		}

		if len(result) > 0 {
			var peers []string
			if err := json.Unmarshal(result, &peers); err != nil {
				s.Logger.WithFields(logrus.Fields{
					"error": err,
				}).Error("Failed to decode response to JSON")
				continue
			}

			if utils.IsSubset(partiesJoined, peers) {
				s.Logger.Info("All parties have completed keygen successfully")
				return true, nil
			}
		}

		time.Sleep(time.Second)
		if time.Since(start) >= timeout {
			break
		}
	}

	return false, nil
}

func (s *Client) EndSession(sessionID string) error {
	sessionURL := s.vultisigRelay + "/" + sessionID
	req, err := http.NewRequest(http.MethodDelete, sessionURL, nil)
	if err != nil {
		return fmt.Errorf("fail to end session: %w", err)
	}
	resp, err := s.client.Do(req)
	if err != nil {
		return fmt.Errorf("fail to end session: %w", err)
	}
	defer s.closer(resp.Body)
	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("fail to end session: %s", resp.Status)
	}
	return nil
}

func (s *Client) MarkKeysignComplete(sessionID string, messageID string, sig tss.KeysignResponse) error {
	sessionURL := s.vultisigRelay + "/complete/" + sessionID + "/keysign"
	body, err := json.Marshal(sig)
	if err != nil {
		return fmt.Errorf("fail to marshal keysign to json: %w", err)
	}
	req, err := http.NewRequest(http.MethodPost, sessionURL, bytes.NewBuffer(body))
	if err != nil {
		return fmt.Errorf("fail to create request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("message_id", messageID)
	resp, err := s.client.Do(req)
	if err != nil {
		return fmt.Errorf("fail to mark keysign complete: %w", err)
	}
	defer s.closer(resp.Body)
	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("fail to mark keysign complete: %s", resp.Status)
	}
	return nil
}
func (s *Client) CheckKeysignComplete(sessionID string, messageID string) (*tss.KeysignResponse, error) {
	sessionURL := s.vultisigRelay + "/complete/" + sessionID + "/keysign"
	req, err := http.NewRequest(http.MethodGet, sessionURL, nil)
	if err != nil {
		return nil, fmt.Errorf("fail to create request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("message_id", messageID)
	resp, err := s.client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("fail to check keysign complete: %w", err)
	}
	defer s.closer(resp.Body)
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("fail to check keysign complete: %s", resp.Status)
	}
	var sig tss.KeysignResponse
	if err := json.NewDecoder(resp.Body).Decode(&sig); err != nil {
		return nil, fmt.Errorf("fail to unmarshal keysign response: %w", err)
	}
	return &sig, nil
}
