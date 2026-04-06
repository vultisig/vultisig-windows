//go:build linux

package main

import "os/exec"

func (a *App) ShowNotification(title, body string) error {
	go func(t, b string) {
		cmd := exec.Command("notify-send", t, b)
		_ = cmd.Run()
	}(title, body)
	return nil
}
