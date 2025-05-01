package storage

type AddressBookItem struct {
	ID      string `json:"id"`
	Title   string `json:"title"`
	Address string `json:"address"`
	Chain   string `json:"chain"`
}
