package relay

import (
	"fmt"

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
	mdns, err := m.NewMDNSService(name, "_http._tcp", "", "", MediatorPort, nil, nil)
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
