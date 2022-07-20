package main

import (
	"log"

	"github.com/anacrolix/torrent"
)

func main() {
	c, _ := torrent.NewClient(nil)
	defer c.Close()
	t, _ := c.AddMagnet("magnet:?xt=urn:btih:D862B4D11E4BC9052916F4D222581DDFD14C2799&tr=udp%3A%2F%2Ftracker.bitsearch.to%3A1337%2Fannounce&tr=udp%3A%2F%2Ftracker.torrent.eu.org%3A451%2Fannounce&tr=udp%3A%2F%2F9.rarbg.com%3A2920%2Fannounce&tr=udp%3A%2F%2Fwww.torrent.eu.org%3A451%2Fannounce&tr=udp%3A%2F%2Ftracker2.dler.com%3A80%2Fannounce&dn=%5Bbitsearch.to%5D+Silicon+Valley+Season+6+Mp4+1080p")
	<-t.GotInfo()
  log.Print(t.Files()[1])
	t.DownloadAll()
	c.WaitAll()
	log.Print("ermahgerd, torrent downloaded")
}
