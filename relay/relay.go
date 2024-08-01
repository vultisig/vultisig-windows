package relay

import (
	"github.com/vultisig/vultisig-relay/server"
	"github.com/vultisig/vultisig-relay/storage"
)

const (
	MEDIATOR_PORT = 18080
)

// RelayServer is a struct that represents a relay server.
type RelayServer struct {
	localServer *server.Server
}

func NewRelayServer() (*RelayServer, error) {
	store, err := storage.NewInMemoryStorage()
	if err != nil {
		return nil, err
	}
	s := server.NewServer(MEDIATOR_PORT, store)
	return &RelayServer{
		localServer: s,
	}, nil
}

func (r *RelayServer) StartServer() error {
	return r.localServer.StartServer()
}
func (r *RelayServer) StopServer() error {
	return r.localServer.StopServer()
}
