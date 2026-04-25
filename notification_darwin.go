//go:build darwin

package main

import (
	"fmt"
	"os/exec"
)

// ShowNotification posts a banner via AppleScript (osascript). macOS attributes
// these to the AppleScript host (often “Script Editor” / automation runner), not
// to Vultisig.app — that is expected for this approach. Taps are not delivered
// back to the app; keysign navigation uses the in-app banner and window focus
// from DesktopNotificationManager (see handleKeysignWsNotification).
func (a *App) ShowNotification(title, body string) error {
	script := fmt.Sprintf(
		`display notification %q with title %q sound name "default"`,
		body,
		title,
	)
	cmd := exec.Command("osascript", "-e", script)
	return cmd.Run()
}
