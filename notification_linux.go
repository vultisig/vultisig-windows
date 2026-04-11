//go:build linux

package main

import "os/exec"

// ShowNotification uses notify-send; clicks are not wired to the app. Use the
// in-app keysign banner after the window is brought forward.
func (a *App) ShowNotification(title, body string) error {
	cmd := exec.Command("notify-send", title, body)
	return cmd.Run()
}
