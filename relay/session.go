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

	"github.com/vultisig/vultisig-win/utils"
)

type Server struct {
	vultisigRelay string
	client        http.Client
}

func NewServer(vultisigRelay string) *Server {
	return &Server{
		vultisigRelay: vultisigRelay,
		client: http.Client{
			Timeout: 5 * time.Second,
		},
	}
}

func (s *Server) StartSession(sessionID string, parties []string) error {
	sessionURL := s.vultisigRelay + "/start/" + sessionID
	body, err := json.Marshal(parties)
	if err != nil {
		return fmt.Errorf("fail to start session: %w", err)
	}
	bodyReader := bytes.NewReader(body)
	req, err := http.NewRequest(http.MethodPost, sessionURL, bodyReader)
	if err != nil {
		return fmt.Errorf("fail to start session: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")
	resp, err := s.client.Do(req)
	if err != nil {
		return fmt.Errorf("fail to start session: %w", err)
	}
	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("fail to start session: %s", resp.Status)
	}
	return nil
}

func (s *Server) RegisterSession(sessionID string, key string) error {
	sessionURL := s.vultisigRelay + "/" + sessionID
	body := []byte("[\"" + key + "\"]")
	utils.Logger.WithFields(logrus.Fields{
		"session": sessionID,
		"key":     key,
		"body":    string(body),
	}).Info("Registering session")
	bodyReader := bytes.NewReader(body)
	resp, err := s.client.Post(sessionURL, "application/json", bodyReader)
	if err != nil {
		return fmt.Errorf("fail to register session: %w", err)
	}
	if resp.StatusCode != http.StatusCreated {
		return fmt.Errorf("fail to register session: %s", resp.Status)
	}

	return nil
}

func (s *Server) WaitForSessionStart(ctx context.Context, sessionID string) ([]string, error) {
	sessionURL := s.vultisigRelay + "/start/" + sessionID
	for {
		select {
		case <-ctx.Done():
			return nil, ctx.Err()
		default:
			utils.Logger.WithFields(logrus.Fields{
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
				utils.Logger.WithFields(logrus.Fields{
					"session": sessionID,
					"parties": parties,
				}).Info("All parties joined")
				return parties, nil
			}

			utils.Logger.WithFields(logrus.Fields{
				"session": sessionID,
			}).Info("Waiting for someone to start session")

			// backoff
			time.Sleep(1 * time.Second)
		}
	}
}

func (s *Server) GetSession(sessionID string) ([]string, error) {
	sessionURL := s.vultisigRelay + "/" + sessionID

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
	if err := json.Unmarshal(buff, &parties); err != nil {
		return nil, fmt.Errorf("fail to unmarshal session body: %w", err)
	}
	return parties, nil
}

func (s *Server) CompleteSession(sessionID, localPartyID string) error {
	sessionURL := s.vultisigRelay + "/complete/" + sessionID
	parties := []string{localPartyID}
	body, err := json.Marshal(parties)
	if err != nil {
		return fmt.Errorf("fail to complete session: %w", err)
	}
	bodyReader := bytes.NewReader(body)
	req, err := http.NewRequest(http.MethodPost, sessionURL, bodyReader)
	if err != nil {
		return fmt.Errorf("fail to complete session: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")
	resp, err := s.client.Do(req)
	if err != nil {
		return fmt.Errorf("fail to complete session: %w", err)
	}
	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("fail to complete session: %s", resp.Status)
	}
	return nil
}

func (s *Server) CheckCompletedParties(sessionID string, partiesJoined []string) (bool, error) {
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
		defer resp.Body.Close()

		result, err := io.ReadAll(resp.Body)
		if err != nil {
			return false, fmt.Errorf("fail to fetch request: %w", err)
		}

		if len(result) > 0 {
			var peers []string
			err := json.Unmarshal(result, &peers)
			if err != nil {
				utils.Logger.WithFields(logrus.Fields{
					"error": err,
				}).Error("Failed to decode response to JSON")
				continue
			}

			if utils.IsSubset(partiesJoined, peers) {
				utils.Logger.Info("All parties have completed keygen successfully")
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

func (s *Server) EndSession(sessionID string) error {
	sessionURL := s.vultisigRelay + "/" + sessionID
	req, err := http.NewRequest(http.MethodDelete, sessionURL, nil)
	if err != nil {
		return fmt.Errorf("fail to end session: %w", err)
	}
	resp, err := s.client.Do(req)
	if err != nil {
		return fmt.Errorf("fail to end session: %w", err)
	}
	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("fail to end session: %s", resp.Status)
	}
	return nil
}
