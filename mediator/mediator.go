package mediator

import (
	"fmt"
	"os"
	"strings"
	"sync"
	"time"

	m "github.com/hashicorp/mdns"
	"github.com/vultisig/vultisig-relay/server"
	"github.com/vultisig/vultisig-relay/storage"
)

const (
	MediatorPort = 18080
)

// Server  is a struct that represents a relay server.
type Server struct {
	localServer *server.Server
	mdns        *m.Server
}

func NewRelayServer() (*Server, error) {
	store, err := storage.NewInMemoryStorage()
	if err != nil {
		return nil, err
	}
	s := server.NewServer(MediatorPort, store)
	return &Server{
		localServer: s,
	}, nil
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
	mdns, err := m.NewMDNSService(name, "_http._tcp", "", hostName, MediatorPort, nil, []string{
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
	fmt.Printf("Successfully advertising mediator '%s' on %s:%d\n", name, hostName, MediatorPort)
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