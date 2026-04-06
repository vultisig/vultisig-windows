//go:build windows

package main

import (
	"fmt"
	"os/exec"
	"strings"
)

func xmlEscapeForToast(s string) string {
	return strings.NewReplacer(
		`&`, "&amp;",
		`<`, "&lt;",
		`>`, "&gt;",
		`"`, "&quot;",
		`'`, "&apos;",
	).Replace(s)
}

func (a *App) ShowNotification(title, body string) error {
	t := xmlEscapeForToast(title)
	b := xmlEscapeForToast(body)
	script := fmt.Sprintf(`
[Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] | Out-Null
[Windows.Data.Xml.Dom.XmlDocument, Windows.Data.Xml.Dom, ContentType = WindowsRuntime] | Out-Null
$template = @"
<toast>
  <visual>
    <binding template="ToastGeneric">
      <text>%s</text>
      <text>%s</text>
    </binding>
  </visual>
  <audio src="ms-winsoundevent:Notification.Default"/>
</toast>
"@
$xml = New-Object Windows.Data.Xml.Dom.XmlDocument
$xml.LoadXml($template)
$toast = [Windows.UI.Notifications.ToastNotification]::new($xml)
$notifier = [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier('Vultisig')
$notifier.Show($toast)
`, t, b)

	go func(s string) {
		cmd := exec.Command(
			"powershell",
			"-NoProfile",
			"-NonInteractive",
			"-ExecutionPolicy", "Bypass",
			"-Command", s,
		)
		_ = cmd.Run()
	}(script)
	return nil
}
