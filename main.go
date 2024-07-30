package main

import (
	"embed"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"github.com/wailsapp/wails/v2/pkg/options/mac"

	"github.com/vultisig/vultisig-win/storage"
	"github.com/vultisig/vultisig-win/tss"
)

//go:embed all:frontend/dist
var assets embed.FS

//go:embed build/appicon.png
var icon []byte

func main() {
	// Create an instance of the app structure
	app := NewApp()
	tssIns := tss.NewTssService()
	store, err := storage.NewStore()
	if err != nil {
		panic(err)
	}

	// migrate db , ensure db is in correct state
	if err := store.Migrate(); err != nil {
		panic(err)
	}
	// Create application with options
	err = wails.Run(&options.App{
		Title:     "Vultisig",
		Width:     1024,
		Height:    768,
		MinHeight: 768,
		MinWidth:  1024,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: &options.RGBA{R: 27, G: 38, B: 54, A: 1},
		OnStartup:        app.startup,
		Bind: []interface{}{
			app,
			tssIns,
			store,
		},
		EnumBind: []interface{}{},

		Mac: &mac.Options{
			Appearance:           mac.DefaultAppearance,
			WebviewIsTransparent: true,
			WindowIsTranslucent:  false,
			DisableZoom:          false,
			About: &mac.AboutInfo{
				Title:   "Vultisig",
				Message: "Vultisig Application",
				Icon:    icon,
			},
		},
	})

	if err != nil {
		println("Error:", err.Error())
	}
}
