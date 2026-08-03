package mediator

import (
	"io"
	"net"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	m "github.com/hashicorp/mdns"
)

func TestResolveMediatorPort(t *testing.T) {
	t.Run("default", func(t *testing.T) {
		port, err := resolveMediatorPort("")
		if err != nil {
			t.Fatal(err)
		}
		if port != DefaultMediatorPort {
			t.Fatalf("expected %d, got %d", DefaultMediatorPort, port)
		}
	})

	t.Run("custom", func(t *testing.T) {
		port, err := resolveMediatorPort("25220")
		if err != nil {
			t.Fatal(err)
		}
		if port != 25220 {
			t.Fatalf("expected 25220, got %d", port)
		}
	})

	for _, value := range []string{"0", "70000", "invalid"} {
		t.Run(value, func(t *testing.T) {
			if _, err := resolveMediatorPort(value); err == nil {
				t.Fatalf("expected %q to fail", value)
			}
		})
	}
}

func TestNormalizeMDNSHostname(t *testing.T) {
	tests := map[string]string{
		"vika":                   "vika.local.",
		"vika.local":             "vika.local.",
		"vika.LOCAL":             "vika.local.",
		"vika.local.local":       "vika.local.",
		"vika.LOCAL.local.LOCAL": "vika.local.",
	}

	for input, expected := range tests {
		t.Run(input, func(t *testing.T) {
			if actual := normalizeMDNSHostname(input); actual != expected {
				t.Fatalf("normalizeMDNSHostname(%q) = %q, want %q", input, actual, expected)
			}
		})
	}
}

func TestServiceInstanceName(t *testing.T) {
	tests := map[string]string{
		"Vultisig-Iphone-123._http._tcp.local.": "Vultisig-Iphone-123",
		"Vultisig-Windows-456._http._tcp.local": "Vultisig-Windows-456",
		"Vultisig-Android-789._http._tcp.":      "Vultisig-Android-789",
		"Vultisig-Macos-321":                    "Vultisig-Macos-321",
		"Vultisig-Macos-321.":                   "Vultisig-Macos-321",
	}

	for input, expected := range tests {
		t.Run(input, func(t *testing.T) {
			if actual := serviceInstanceName(input); actual != expected {
				t.Fatalf("serviceInstanceName(%q) = %q, want %q", input, actual, expected)
			}
		})
	}
}

func TestMatchesMediatorService(t *testing.T) {
	const name = "Vultisig-Iphone-123"

	tests := []struct {
		label    string
		entry    *m.ServiceEntry
		expected bool
	}{
		{
			// iOS and Android advertise the session name as the Bonjour instance
			// name only — this is the case that used to time out.
			label:    "instance name only",
			entry:    &m.ServiceEntry{Name: name + "._http._tcp.local."},
			expected: true,
		},
		{
			label:    "txt record only",
			entry:    &m.ServiceEntry{Name: "some-other-host._http._tcp.local.", InfoFields: []string{name}},
			expected: true,
		},
		{
			label:    "instance name with different case",
			entry:    &m.ServiceEntry{Name: "vultisig-iphone-123._http._tcp.local."},
			expected: true,
		},
		{
			label:    "unrelated service",
			entry:    &m.ServiceEntry{Name: "Brother-Printer._http._tcp.local.", InfoFields: []string{"printer"}},
			expected: false,
		},
		{
			label:    "different session on the same network",
			entry:    &m.ServiceEntry{Name: "Vultisig-Iphone-999._http._tcp.local.", InfoFields: []string{"Vultisig-Iphone-999"}},
			expected: false,
		},
	}

	for _, test := range tests {
		t.Run(test.label, func(t *testing.T) {
			test.entry.AddrV4 = net.IPv4(192, 168, 1, 5)
			if actual := matchesMediatorService(test.entry, name); actual != test.expected {
				t.Fatalf("matchesMediatorService(%q, %q) = %v, want %v", test.entry.Name, name, actual, test.expected)
			}
		})
	}
}

func TestDiscoveryProxy(t *testing.T) {
	var upstreamRequests []string
	upstream := httptest.NewServer(
		http.HandlerFunc(func(w http.ResponseWriter, request *http.Request) {
			upstreamRequests = append(
				upstreamRequests,
				request.Method+" "+request.URL.Path,
			)
			// Mimic a mediator that already sends its own CORS header (the
			// desktop-to-desktop join case) to check it is not duplicated.
			w.Header().Set("Access-Control-Allow-Origin", "http://upstream-value")
			w.WriteHeader(http.StatusOK)
			if _, err := w.Write([]byte("upstream-body")); err != nil {
				t.Error(err)
			}
		}),
	)
	defer upstream.Close()

	server := &Server{}
	proxyUrl, err := server.proxyDiscoveredMediator(upstream.URL)
	if err != nil {
		t.Fatal(err)
	}
	if !strings.HasPrefix(proxyUrl, "http://127.0.0.1:") {
		t.Fatalf("expected loopback proxy url, got %q", proxyUrl)
	}

	t.Run("forwards requests and rewrites CORS headers", func(t *testing.T) {
		response, err := http.Get(proxyUrl + "/session-id")
		if err != nil {
			t.Fatal(err)
		}
		defer response.Body.Close()

		body, err := io.ReadAll(response.Body)
		if err != nil {
			t.Fatal(err)
		}
		if string(body) != "upstream-body" {
			t.Fatalf("expected forwarded body, got %q", body)
		}
		if len(upstreamRequests) != 1 || upstreamRequests[0] != "GET /session-id" {
			t.Fatalf("unexpected upstream requests: %v", upstreamRequests)
		}
		if values := response.Header.Values("Access-Control-Allow-Origin"); len(values) != 1 || values[0] != "*" {
			t.Fatalf("expected single wildcard CORS origin, got %v", values)
		}
	})

	t.Run("answers preflight without forwarding", func(t *testing.T) {
		request, err := http.NewRequest(http.MethodOptions, proxyUrl+"/session-id", nil)
		if err != nil {
			t.Fatal(err)
		}
		response, err := http.DefaultClient.Do(request)
		if err != nil {
			t.Fatal(err)
		}
		defer response.Body.Close()

		if response.StatusCode != http.StatusNoContent {
			t.Fatalf("expected 204 for preflight, got %d", response.StatusCode)
		}
		if origin := response.Header.Get("Access-Control-Allow-Origin"); origin != "*" {
			t.Fatalf("expected wildcard CORS origin, got %q", origin)
		}
		if len(upstreamRequests) != 1 {
			t.Fatalf("preflight should not reach upstream, got %v", upstreamRequests)
		}
	})

	t.Run("retargets to a new upstream on the same port", func(t *testing.T) {
		second := httptest.NewServer(
			http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
				if _, err := w.Write([]byte("second-upstream")); err != nil {
					t.Error(err)
				}
			}),
		)
		defer second.Close()

		retargetedUrl, err := server.proxyDiscoveredMediator(second.URL)
		if err != nil {
			t.Fatal(err)
		}
		if retargetedUrl != proxyUrl {
			t.Fatalf("expected stable proxy url %q, got %q", proxyUrl, retargetedUrl)
		}

		response, err := http.Get(retargetedUrl + "/other")
		if err != nil {
			t.Fatal(err)
		}
		defer response.Body.Close()

		body, err := io.ReadAll(response.Body)
		if err != nil {
			t.Fatal(err)
		}
		if string(body) != "second-upstream" {
			t.Fatalf("expected second upstream body, got %q", body)
		}
	})
}
