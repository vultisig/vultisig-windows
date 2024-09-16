package utils

import (
	"encoding/json"
	"errors"
	"io/ioutil"
	"net/http"
)

type GoHttp struct {
}

func NewGoHttp() (*GoHttp, error) {
	return &GoHttp{}, nil
}

// Fetch retrieves data from a given endpoint
func (g *GoHttp) Fetch(endpoint string) (interface{}, error) {

	// Create the HTTP request
	req, err := http.NewRequest("GET", endpoint, nil)
	if err != nil {
		return nil, err
	}

	// Set headers
	req.Header.Set("Content-Type", "application/json")

	// Create an HTTP client and send the request
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	// Check if the response status code is 200 OK
	if resp.StatusCode != http.StatusOK {
		return nil, errors.New("failed to fetch data: status code " + resp.Status)
	}

	// Read the response body
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	// Parse the JSON response into a generic interface
	var result interface{}
	err = json.Unmarshal(body, &result)
	if err != nil {
		return nil, err
	}

	return result, nil
}
