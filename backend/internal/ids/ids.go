package ids

import (
	"crypto/rand"
	"encoding/hex"
)

func New() string {
	bytes := make([]byte, 16)
	if _, err := rand.Read(bytes); err != nil {
		panic(err)
	}

	return hex.EncodeToString(bytes)
}
