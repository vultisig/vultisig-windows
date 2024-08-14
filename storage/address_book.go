package storage

import "github.com/google/uuid"

// AddressBookItem represents an item in the address book.
type AddressBookItem struct {
	ID      uuid.UUID // Using uuid package to generate unique IDs
	Title   string
	Address string
	Chain   string
	Order   int
}
