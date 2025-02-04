package utils

import (
	"bytes"
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"time"
)

type GoHttp struct {
	httpClient *http.Client
}

// NewGoHttp initializes an HTTP client with a timeout
func NewGoHttp() *GoHttp {
	return &GoHttp{
		httpClient: &http.Client{Timeout: 30 * time.Second}, // Set a timeout to prevent hangs
	}
}

// Fetch retrieves data from a given endpoint
func (g *GoHttp) Fetch(endpoint string) (any, error) {

	// Create the HTTP request
	req, err := http.NewRequest("GET", endpoint, nil)
	if err != nil {
		return nil, err
	}

	// Set headers
	req.Header.Set("Content-Type", "application/json")
	resp, err := g.httpClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	// Check if the response status code is 200 OK
	if resp.StatusCode != http.StatusOK {
		return nil, errors.New("failed to fetch data: status code " + resp.Status)
	}

	// Parse the JSON response into a generic interface
	var result any
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, err
	}

	return result, nil
}

// Post sends a POST request with a given payload to the specified endpoint
func (g *GoHttp) Post(endpoint string, payload interface{}) (any, error) {
	log.Printf("endpoint: %s\n", endpoint)
	log.Printf("payload: %v\n", payload)

	// Marshal the payload into JSON
	jsonPayload, err := json.Marshal(payload)
	if err != nil {
		return nil, err
	}

	// Create the HTTP request
	req, err := http.NewRequest("POST", endpoint, bytes.NewBuffer(jsonPayload))
	if err != nil {
		return nil, err
	}

	// Set headers
	req.Header.Set("Content-Type", "application/json")

	// Create an HTTP client and send the request
	resp, err := g.httpClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	// Check if the response status code is 200 OK
	if resp.StatusCode != http.StatusOK {
		return nil, errors.New("failed to post data: status code " + resp.Status)
	}

	// Parse the JSON response into a generic interface
	var result any
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, err
	}

	return result, nil
}
