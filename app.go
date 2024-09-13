package main

import (
    "context"
    "encoding/base64"
    "io/ioutil"

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

func (a *App) SaveFile(suggestedFilename string, base64Data string, filters []runtime.FileFilter) (string, error) {
    filename, err := runtime.SaveFileDialog(a.ctx, runtime.SaveDialogOptions{
        Title:           "Save File",
        DefaultFilename: suggestedFilename,
        Filters:         filters,
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
