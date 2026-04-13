package events

import (
	"sync"

	"github.com/haseen-me/haseen-apps/services/mail/internal/model"
)

type Broker struct {
	mu          sync.RWMutex
	subscribers map[string]map[chan model.MailEvent]struct{}
}

func NewBroker() *Broker {
	return &Broker{
		subscribers: make(map[string]map[chan model.MailEvent]struct{}),
	}
}

func (b *Broker) Subscribe(userID string) (<-chan model.MailEvent, func()) {
	ch := make(chan model.MailEvent, 32)

	b.mu.Lock()
	if _, ok := b.subscribers[userID]; !ok {
		b.subscribers[userID] = make(map[chan model.MailEvent]struct{})
	}
	b.subscribers[userID][ch] = struct{}{}
	b.mu.Unlock()

	unsubscribe := func() {
		b.mu.Lock()
		defer b.mu.Unlock()
		if subs, ok := b.subscribers[userID]; ok {
			delete(subs, ch)
			if len(subs) == 0 {
				delete(b.subscribers, userID)
			}
		}
		close(ch)
	}

	return ch, unsubscribe
}

func (b *Broker) Publish(event model.MailEvent) {
	b.mu.RLock()
	defer b.mu.RUnlock()
	for ch := range b.subscribers[event.UserID] {
		select {
		case ch <- event:
		default:
		}
	}
}
