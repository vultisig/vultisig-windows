package mediator

import (
	"fmt"
	"net"
	"os"
	"sort"
	"strconv"
	"strings"
	"sync"
	"time"

	m "github.com/hashicorp/mdns"
	"github.com/vultisig/vultisig-relay/server"
	"github.com/vultisig/vultisig-relay/storage"
)

const DefaultMediatorPort = 18080
const localSuffix = ".local"
const mediatorServiceType = "_http._tcp"
const discoveryTimeout = 5 * time.Second

// Server  is a struct that represents a relay server.
type Server struct {
	localServer *server.Server
	mdns        *m.Server
	port        int
	proxyMu     sync.Mutex
	proxy       *discoveryProxy
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

func normalizeMDNSHostname(hostName string) string {
	for strings.HasSuffix(strings.ToLower(hostName), localSuffix) {
		hostName = hostName[:len(hostName)-len(localSuffix)]
	}
	return fmt.Sprintf("%s%s.", hostName, localSuffix)
}

func (r *Server) StartServer() error {
	return r.localServer.StartServer()
}

func (r *Server) StopServer() error {
	if err := r.stopDiscoveryProxy(); err != nil {
		fmt.Printf("fail to stop discovery proxy: %v\n", err)
	}
	return r.localServer.StopServer()
}

// stopDiscoveryProxy closes the loopback discovery proxy if one was started.
func (r *Server) stopDiscoveryProxy() error {
	r.proxyMu.Lock()
	defer r.proxyMu.Unlock()
	if r.proxy == nil {
		return nil
	}
	err := r.proxy.stop()
	r.proxy = nil
	return err
}

func (r *Server) AdvertiseMediator(name string) error {
	hostName, err := os.Hostname()
	if err != nil {
		return fmt.Errorf("could not determine host: %v", err)
	}

	hostName = normalizeMDNSHostname(hostName)
	mdns, err := m.NewMDNSService(name, mediatorServiceType, "", hostName, r.port, nil, []string{
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

// serviceInstanceName pulls the instance label out of an mDNS entry name such as
// "Vultisig-Iphone-123._http._tcp.local." -> "Vultisig-Iphone-123".
func serviceInstanceName(entryName string) string {
	if index := strings.Index(entryName, "."+mediatorServiceType); index > 0 {
		return entryName[:index]
	}
	return strings.TrimSuffix(entryName, ".")
}

// matchesMediatorService reports whether an mDNS entry advertises the mediator we
// are looking for. Vultisig desktop copies the service name into a TXT record (see
// AdvertiseMediator), but other platforms only carry it in the Bonjour instance
// name, so both are accepted. DNS labels are case-insensitive.
func matchesMediatorService(entry *m.ServiceEntry, name string) bool {
	if strings.EqualFold(serviceInstanceName(entry.Name), name) {
		return true
	}
	for _, txt := range entry.InfoFields {
		if strings.EqualFold(txt, name) {
			return true
		}
	}
	return false
}

// hasIPv4 reports whether an interface has an IPv4 address to send queries from.
func hasIPv4(iface net.Interface) bool {
	addresses, err := iface.Addrs()
	if err != nil {
		return false
	}

	for _, address := range addresses {
		if ipNet, ok := address.(*net.IPNet); ok && ipNet.IP.To4() != nil {
			return true
		}
	}

	return false
}

// queryInterfaces returns the interfaces worth sending an mDNS query on.
func queryInterfaces() []net.Interface {
	interfaces, err := net.Interfaces()
	if err != nil {
		return nil
	}

	result := make([]net.Interface, 0, len(interfaces))
	for _, iface := range interfaces {
		if iface.Flags&net.FlagUp == 0 ||
			iface.Flags&net.FlagMulticast == 0 ||
			iface.Flags&net.FlagLoopback != 0 {
			continue
		}
		if !hasIPv4(iface) {
			continue
		}
		result = append(result, iface)
	}

	return result
}

// DiscoveryService resolves a locally advertised mediator by service name and
// returns its base URL, e.g. "http://192.168.1.5:18080".
//
// The mDNS client joins the multicast group on whichever interface the OS picks
// by default (net.ListenMulticastUDP with a nil interface). On machines with
// several network adapters that is often not the interface the other device is
// on, and the query then never sees the advertisement. So query every candidate
// interface in parallel and take the first match.
func (r *Server) DiscoveryService(name string) (string, error) {
	// Entries are delivered with a non-blocking send, so a small buffer silently
	// drops advertisements when several services answer at once.
	entriesCh := make(chan *m.ServiceEntry, 64)

	query := func(iface *net.Interface) {
		param := &m.QueryParam{
			Service:             mediatorServiceType,
			Timeout:             discoveryTimeout,
			Entries:             entriesCh,
			Interface:           iface,
			WantUnicastResponse: true,
			DisableIPv6:         true,
		}
		if err := m.Query(param); err != nil {
			fmt.Printf("mediator discovery query failed: %v\n", err)
		}
	}

	interfaces := queryInterfaces()
	if len(interfaces) == 0 {
		go query(nil)
	}
	interfaceNames := make([]string, 0, len(interfaces))
	for i := range interfaces {
		interfaceNames = append(interfaceNames, interfaces[i].Name)
		go query(&interfaces[i])
	}

	// Every non-matching entry is recorded and reported in the timeout error:
	// the app has no console on Windows (windowsgui), so the "show exact error"
	// panel is the only place this diagnostic can surface. An empty list means
	// no mDNS response reached the process at all (firewall / isolation), while
	// a list without the expected name means the advertised instance name does
	// not match what the joining payload carries.
	seen := map[string]struct{}{}

	// Grace period so entries that arrive just before each query's own deadline
	// are still collected.
	timeout := time.After(discoveryTimeout + time.Second)
	for {
		select {
		case <-timeout:
			seenList := make([]string, 0, len(seen))
			for entry := range seen {
				seenList = append(seenList, entry)
			}
			sort.Strings(seenList)
			return "", fmt.Errorf(
				"fail to find service, timeout (looked for %q on interfaces %v, saw %d service(s): %v)",
				name, interfaceNames, len(seenList), seenList,
			)
		case entry := <-entriesCh:
			// The mediator is reached over IPv4, so an entry that only resolved to
			// IPv6 is not usable — keep waiting instead of returning a host that
			// cannot be dialled.
			matched := matchesMediatorService(entry, name)
			if entry.AddrV4 == nil || !matched {
				if len(seen) < 16 {
					label := fmt.Sprintf("%s@%s:%d", entry.Name, entry.AddrV4, entry.Port)
					if matched {
						label += " (matched, but only advertised IPv6)"
					}
					seen[label] = struct{}{}
				}
				continue
			}
			// The WebView cannot talk to mobile-hosted mediators directly (no
			// CORS there), so hand out a loopback proxy URL instead of the
			// discovered address.
			return r.proxyDiscoveredMediator(
				fmt.Sprintf("http://%s:%d", entry.AddrV4, entry.Port),
			)
		}
	}
}
