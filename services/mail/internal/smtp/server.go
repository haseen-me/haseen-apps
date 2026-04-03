package smtp

import (
	"crypto/tls"
	"fmt"
	"net"
	"sync"
	"time"

	"github.com/haseen-me/haseen-apps/services/mail/internal/store"
	"github.com/rs/zerolog"
)

const (
	maxMessageSize = 25 * 1024 * 1024 // 25 MB
	readTimeout    = 60 * time.Second
	writeTimeout   = 60 * time.Second
	maxRecipients  = 100
)

type Server struct {
	Addr      string
	Domain    string
	Store     *store.Store
	Log       zerolog.Logger
	TLSConfig *tls.Config
	listener  net.Listener
	wg        sync.WaitGroup
	quit      chan struct{}
}

func NewServer(addr, domain string, st *store.Store, log zerolog.Logger, tlsCfg *tls.Config) *Server {
	return &Server{
		Addr:      addr,
		Domain:    domain,
		Store:     st,
		Log:       log.With().Str("component", "smtp").Logger(),
		TLSConfig: tlsCfg,
		quit:      make(chan struct{}),
	}
}

func (s *Server) Start() error {
	ln, err := net.Listen("tcp", s.Addr)
	if err != nil {
		return fmt.Errorf("smtp listen: %w", err)
	}
	s.listener = ln
	s.Log.Info().Str("addr", s.Addr).Msg("SMTP server listening")

	go s.acceptLoop()
	return nil
}

func (s *Server) Stop() {
	close(s.quit)
	if s.listener != nil {
		s.listener.Close()
	}
	s.wg.Wait()
}

func (s *Server) acceptLoop() {
	for {
		conn, err := s.listener.Accept()
		if err != nil {
			select {
			case <-s.quit:
				return
			default:
				s.Log.Error().Err(err).Msg("accept failed")
				continue
			}
		}
		s.wg.Add(1)
		go func() {
			defer s.wg.Done()
			s.handleConn(conn)
		}()
	}
}

func (s *Server) handleConn(conn net.Conn) {
	sess := &Session{
		conn:   conn,
		server: s,
		log:    s.Log.With().Str("remote", conn.RemoteAddr().String()).Logger(),
	}
	sess.serve()
}
