package utils

import (
	"bytes"
	"context"
	"encoding/base64"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"
)

type GoHttp struct {
	httpClient *http.Client
}

func NewGoHttp() *GoHttp {
	return &GoHttp{
		httpClient: &http.Client{Timeout: 30 * time.Second},
	}
}

type HttpPostRequest struct {
	URL     string            `json:"url"`
	Headers map[string]string `json:"headers"`
	Body    string            `json:"body"`
}

type HttpPostResponse struct {
	StatusCode int               `json:"statusCode"`
	Headers    map[string]string `json:"headers"`
	Body       string            `json:"body"`
}

func (g *GoHttp) Post(req HttpPostRequest) (*HttpPostResponse, error) {
	bodyBytes, err := base64.StdEncoding.DecodeString(req.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to decode request body: %w", err)
	}

	ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
	defer cancel()

	httpReq, err := http.NewRequestWithContext(ctx, "POST", req.URL, bytes.NewReader(bodyBytes))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	for key, value := range req.Headers {
		httpReq.Header.Set(key, value)
	}

	client := &http.Client{}
	resp, err := client.Do(httpReq)
	if err != nil {
		return nil, fmt.Errorf("request failed: %w", err)
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %w", err)
	}

	headers := make(map[string]string)
	for key := range resp.Header {
		headers[strings.ToLower(key)] = resp.Header.Get(key)
	}
	for key := range resp.Trailer {
		headers[strings.ToLower(key)] = resp.Trailer.Get(key)
	}

	return &HttpPostResponse{
		StatusCode: resp.StatusCode,
		Headers:    headers,
		Body:       base64.StdEncoding.EncodeToString(respBody),
	}, nil
}
