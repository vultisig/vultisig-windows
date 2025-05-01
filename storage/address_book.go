package storage

// AddressBookItem represents an item in the address book.
type AddressBookItem struct {
	ID      string // Using string ID to be consistent with other entities
	Title   string
	Address string
	Chain   string
}
