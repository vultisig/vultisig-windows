//go:build darwin

package main

import (
	"fmt"
	"os/exec"
)

func (a *App) ShowNotification(title, body string) error {
	go func(t, b string) {
		script := fmt.Sprintf(
			`display notification %q with title %q sound name "default"`,
			b,
			t,
		)
		cmd := exec.Command("osascript", "-e", script)
		_ = cmd.Run()
	}(title, body)
	return nil
}
