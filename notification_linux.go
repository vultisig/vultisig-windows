//go:build linux

package main

import "os/exec"

func (a *App) ShowNotification(title, body string) error {
	cmd := exec.Command("notify-send", title, body)
	return cmd.Run()
}
