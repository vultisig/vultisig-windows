//go:build windows

package main

import (
	"encoding/base64"
	"fmt"
	"os/exec"
)

func (a *App) ShowNotification(title, body string) error {
	encodedTitle := base64.StdEncoding.EncodeToString([]byte(title))
	encodedBody := base64.StdEncoding.EncodeToString([]byte(body))
	script := fmt.Sprintf(`
[Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] | Out-Null
[Windows.Data.Xml.Dom.XmlDocument, Windows.Data.Xml.Dom, ContentType = WindowsRuntime] | Out-Null
$title = [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String('%s'))
$body = [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String('%s'))
$xml = New-Object Windows.Data.Xml.Dom.XmlDocument
$xml.LoadXml('<toast><visual><binding template="ToastGeneric"><text/><text/></binding></visual><audio src="ms-winsoundevent:Notification.Default"/></toast>')
$nodes = $xml.GetElementsByTagName('text')
$nodes.Item(0).InnerText = $title
$nodes.Item(1).InnerText = $body
$toast = [Windows.UI.Notifications.ToastNotification]::new($xml)
$notifier = [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier('Vultisig')
$notifier.Show($toast)
`, encodedTitle, encodedBody)

	cmd := exec.Command(
		"powershell",
		"-NoProfile",
		"-NonInteractive",
		"-ExecutionPolicy", "Bypass",
		"-Command", script,
	)
	return cmd.Run()
}
