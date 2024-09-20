package main

import (
	"context"
	"encoding/base64"
	"io/ioutil"
	"os"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

type App struct {
	ctx context.Context
}

func NewApp() *App {
	return &App{}
}

func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

func (a *App) SaveFileBkp(suggestedFilename string, base64Data string) (string, error) {
	// Show the save file dialog to the user
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

	// Write the base64 string directly to the file without decoding it
	err = os.WriteFile(filename, []byte(base64Data), 0644)
	if err != nil {
		return "", err
	}

	return filename, nil
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

	// Decode base64 data
	data, err := base64.StdEncoding.DecodeString(base64Data)
	if err != nil {
		return "", err
	}

	// Write the data to the file
	err = ioutil.WriteFile(filename, data, 0644)
	if err != nil {
		return "", err
	}

	return filename, nil
}
