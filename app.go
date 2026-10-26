package main

import (
	"context"
	"encoding/base64"
	"os"
	"sync"

	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// launchArgsEvent carries deeplink URLs and file paths the OS hands the
// running app after the frontend has read its launch arguments.
const launchArgsEvent = "launchArgs"

type App struct {
	ctx context.Context

	mu             sync.Mutex
	args           []string
	launchArgsRead bool
}

func NewApp(args []string) *App {
	return &App{
		args: args,
	}
}

func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

// GetOSArgs returns the launch arguments plus any URL or file the OS opened
// before the frontend asked; later opens arrive as launchArgsEvent.
func (a *App) GetOSArgs() []string {
	a.mu.Lock()
	defer a.mu.Unlock()
	a.launchArgsRead = true
	return a.args
}

func (a *App) openLaunchArgs(args []string) {
	a.mu.Lock()
	if !a.launchArgsRead {
		a.args = append(a.args, args...)
		a.mu.Unlock()
		return
	}
	a.mu.Unlock()

	runtime.WindowUnminimise(a.ctx)
	runtime.WindowShow(a.ctx)
	runtime.EventsEmit(a.ctx, launchArgsEvent, args)
}

func (a *App) onSecondInstanceLaunch(data options.SecondInstanceData) {
	a.openLaunchArgs(data.Args)
}

func (a *App) onURLOpen(url string) {
	a.openLaunchArgs([]string{url})
}

func (a *App) onFileOpen(path string) {
	a.openLaunchArgs([]string{path})
}

func (a *App) ReadTextFile(filename string) (string, error) {
	data, err := os.ReadFile(filename)
	if err != nil {
		return "", err
	}

	return string(data), nil
}

func (a *App) ReadFileBase64(filename string) (string, error) {
	data, err := os.ReadFile(filename)
	if err != nil {
		return "", err
	}

	return base64.StdEncoding.EncodeToString(data), nil
}

func (a *App) SaveFile(suggestedFilename string, base64Data string) (string, error) {
	filename, err := runtime.SaveFileDialog(a.ctx, runtime.SaveDialogOptions{
		Title:           "Save File",
		DefaultFilename: suggestedFilename,
	})
	if err != nil {
		return "", err
	}

	if filename == "" {
		// User canceled the dialog
		return "", nil
	}

	// Decode the base64 data
	data, err := base64.StdEncoding.DecodeString(base64Data)
	if err != nil {
		return "", err
	}

	// Write the decoded data to the file
	err = os.WriteFile(filename, data, 0644)
	if err != nil {
		return "", err
	}

	return filename, nil
}
