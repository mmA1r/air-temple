package auth

import (
	"crypto/subtle"
	"sync"

	"air-temple/backend/internal/ids"
)

type Service struct {
	username string
	password string
	mutex    sync.RWMutex
	tokens   map[string]struct{}
}

func New(username string, password string) *Service {
	return &Service{
		username: username,
		password: password,
		tokens:   make(map[string]struct{}),
	}
}

func (service *Service) Login(username string, password string) (string, bool) {
	if subtle.ConstantTimeCompare([]byte(username), []byte(service.username)) != 1 {
		return "", false
	}

	if subtle.ConstantTimeCompare([]byte(password), []byte(service.password)) != 1 {
		return "", false
	}

	token := ids.New()

	service.mutex.Lock()
	service.tokens[token] = struct{}{}
	service.mutex.Unlock()

	return token, true
}

func (service *Service) Logout(token string) {
	service.mutex.Lock()
	delete(service.tokens, token)
	service.mutex.Unlock()
}

func (service *Service) IsValid(token string) bool {
	service.mutex.RLock()
	defer service.mutex.RUnlock()

	_, exists := service.tokens[token]
	return exists
}
