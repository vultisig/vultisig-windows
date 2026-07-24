package mediator

import (
	"fmt"
	"os"
	"strconv"
	"strings"
	"sync"
	"time"

	m "github.com/hashicorp/mdns"
	"github.com/vultisig/vultisig-relay/server"
	"github.com/vultisig/vultisig-relay/storage"
)

const DefaultMediatorPort = 18080

// Server  is a struct that represents a relay server.
type Server struct {
	localServer *server.Server
	mdns        *m.Server
	port        int
}

func NewRelayServer() (*Server, error) {
	port, err := resolveMediatorPort(os.Getenv("VULTISIG_MEDIATOR_PORT"))
	if err != nil {
		return nil, err
	}
	store, err := storage.NewInMemoryStorage()
	if err != nil {
		return nil, err
	}
	s := server.NewServer(int64(port), store)
	return &Server{
		localServer: s,
		port:        port,
	}, nil
}

func resolveMediatorPort(value string) (int, error) {
	if value == "" {
		return DefaultMediatorPort, nil
	}
	port, err := strconv.Atoi(value)
	if err != nil || port < 1 || port > 65535 {
		return 0, fmt.Errorf("VULTISIG_MEDIATOR_PORT must be an integer between 1 and 65535")
	}
	return port, nil
}

func (r *Server) StartServer() error {
	return r.localServer.StartServer()
}

func (r *Server) StopServer() error {
	return r.localServer.StopServer()
}

func (r *Server) AdvertiseMediator(name string) error {
	hostName, err := os.Hostname()
	if err != nil {
		return fmt.Errorf("could not determine host: %v", err)
	}

	const localSuffix = ".local"

	// Remove .local if it already exists to avoid duplicate
	if strings.HasSuffix(hostName, localSuffix) {
		hostName = strings.TrimSuffix(hostName, localSuffix)
	}

	hostName = fmt.Sprintf("%s%s.", hostName, localSuffix)
	mdns, err := m.NewMDNSService(name, "_http._tcp", "", hostName, r.port, nil, []string{
		name,
	})
	if err != nil {
		return err
	}
	s, err := m.NewServer(&m.Config{
		Zone: mdns,
	})
	if err != nil {
		return fmt.Errorf("fail to start mdns server,err:%w", err)
	}
	r.mdns = s
	fmt.Printf("Successfully advertising mediator '%s' on %s:%d\n", name, hostName, r.port)
	return nil
}

func (r *Server) StopAdvertiseMediator() error {
	if r.mdns != nil {
		if err := r.mdns.Shutdown(); err != nil {
			return fmt.Errorf("fail to stop mdns server,err:%w", err)
		}
	}
	return nil
}

func (r *Server) DiscoveryService(name string) (string, error) {
	entriesCh := make(chan *m.ServiceEntry, 4)
	wg := &sync.WaitGroup{}
	wg.Add(1)
	var err error
	var serviceHost string

	go func() {
		defer wg.Done()
		for {
			select {
			case <-time.After(5 * time.Second):
				err = fmt.Errorf("fail to find service, timeout")
				return
			case entry := <-entriesCh:
				for _, txt := range entry.InfoFields {
					if txt == name {
						serviceHost = fmt.Sprintf("%s:%d", entry.AddrV4, entry.Port)
						return
					}
				}
			}
		}
	}()

	param := &m.QueryParam{
		Service:     "_http._tcp",
		Timeout:     5 * time.Second,
		Entries:     entriesCh,
		DisableIPv6: true,
	}

	if err := m.Query(param); err != nil {
		return "", fmt.Errorf("fail to query service, err: %w", err)
	}
	wg.Wait()
	return serviceHost, err
}
