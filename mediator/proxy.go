package mediator

import (
	"context"
	"fmt"
	"net"
	"net/http"
	"net/http/httputil"
	"net/url"
	"sync"
	"time"
)

// discoveryProxy is a loopback reverse proxy in front of a remotely discovered
// mediator. The frontend runs in a WebView (origin http://wails.localhost), so
// its requests are subject to CORS. The desktop's own mediator handles CORS
// (vultisig-relay uses Echo's CORS middleware), but mediators embedded in the
// mobile apps do not — their native clients never needed it. Joining a
// mobile-initiated local session therefore fails in the WebView with
// "Failed to fetch" on the preflight. Proxying through loopback lets the Go
// side answer preflights and attach CORS headers while forwarding everything
// else to the phone unchanged.
type discoveryProxy struct {
	mu       sync.Mutex
	upstream *url.URL
	port     int
	server   *http.Server
}

func (p *discoveryProxy) currentUpstream() *url.URL {
	p.mu.Lock()
	defer p.mu.Unlock()
	return p.upstream
}

func (p *discoveryProxy) setUpstream(upstream *url.URL) {
	p.mu.Lock()
	defer p.mu.Unlock()
	p.upstream = upstream
}

func writeCorsHeaders(header http.Header) {
	header.Set("Access-Control-Allow-Origin", "*")
	header.Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
	header.Set("Access-Control-Allow-Headers", "*")
}

func (p *discoveryProxy) handler() http.Handler {
	reverseProxy := &httputil.ReverseProxy{
		Rewrite: func(request *httputil.ProxyRequest) {
			request.SetURL(p.currentUpstream())
			request.Out.Host = request.In.Host
		},
		ModifyResponse: func(response *http.Response) error {
			// The desktop-to-desktop join path proxies a mediator that already
			// sends CORS headers; drop them so the values written by the outer
			// handler stay the only ones.
			response.Header.Del("Access-Control-Allow-Origin")
			response.Header.Del("Access-Control-Allow-Methods")
			response.Header.Del("Access-Control-Allow-Headers")
			return nil
		},
	}

	return http.HandlerFunc(func(w http.ResponseWriter, request *http.Request) {
		writeCorsHeaders(w.Header())

		// Mobile mediators do not route OPTIONS, so preflights are answered
		// here instead of being forwarded.
		if request.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		if p.currentUpstream() == nil {
			http.Error(w, "no upstream mediator discovered", http.StatusBadGateway)
			return
		}

		reverseProxy.ServeHTTP(w, request)
	})
}

// start listens on an ephemeral loopback port and serves until process exit.
func (p *discoveryProxy) start() error {
	listenConfig := &net.ListenConfig{}
	listener, err := listenConfig.Listen(context.Background(), "tcp4", "127.0.0.1:0")
	if err != nil {
		return fmt.Errorf("fail to listen for discovery proxy: %w", err)
	}

	p.port = listener.Addr().(*net.TCPAddr).Port
	// Read/write timeouts are deliberately absent: MPC keysign traffic flows
	// through this proxy and slow rounds must not be severed mid-request.
	p.server = &http.Server{
		Handler:           p.handler(),
		ReadHeaderTimeout: 10 * time.Second,
		IdleTimeout:       time.Minute,
	}

	go func() {
		if err := p.server.Serve(listener); err != nil && err != http.ErrServerClosed {
			fmt.Printf("discovery proxy stopped: %v\n", err)
		}
	}()

	return nil
}

// proxyDiscoveredMediator points the loopback proxy at a discovered mediator
// and returns the proxy's base URL for the frontend to use.
func (r *Server) proxyDiscoveredMediator(upstream string) (string, error) {
	upstreamUrl, err := url.Parse(upstream)
	if err != nil {
		return "", fmt.Errorf("fail to parse discovered mediator url %q: %w", upstream, err)
	}

	r.proxyMu.Lock()
	defer r.proxyMu.Unlock()

	if r.proxy == nil {
		proxy := &discoveryProxy{}
		if err := proxy.start(); err != nil {
			return "", err
		}
		r.proxy = proxy
	}

	r.proxy.setUpstream(upstreamUrl)
	return fmt.Sprintf("http://127.0.0.1:%d", r.proxy.port), nil
}
