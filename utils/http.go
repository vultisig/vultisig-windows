package utils

import (
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
