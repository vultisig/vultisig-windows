//go:build darwin

package main

import (
	"fmt"
	"os/exec"
)

func (a *App) ShowNotification(title, body string) error {
	script := fmt.Sprintf(
		`display notification %q with title %q sound name "default"`,
		body,
		title,
	)
	cmd := exec.Command("osascript", "-e", script)
	return cmd.Run()
}
