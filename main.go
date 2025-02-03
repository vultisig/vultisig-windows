package main

import (
	"context"
	"embed"
	"os"

	"github.com/rs/zerolog/log"
	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/logger"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"github.com/wailsapp/wails/v2/pkg/options/mac"
	"github.com/wailsapp/wails/v2/pkg/options/windows"

	"github.com/vultisig/vultisig-win/mediator"
	"github.com/vultisig/vultisig-win/storage"
	"github.com/vultisig/vultisig-win/tss"
	"github.com/vultisig/vultisig-win/utils"
)

//go:embed all:clients/desktop/dist
var assets embed.FS

//go:embed appicon.png
var icon []byte

func main() {
	argsWithoutProg := os.Args[1:]
	// Create an instance of the app structure
	app := NewApp(argsWithoutProg)
	tssIns := tss.NewTssService()
	store, err := storage.NewStore()
	if err != nil {
		panic(err)
	}
	goHttp, err := utils.NewGoHttp()
	if err != nil {
		panic(err)
	}
	mediator, err := mediator.NewRelayServer()
	if err != nil {
		panic(err)
	}
	go func() {
		if err := mediator.StartServer(); err != nil {
			log.Err(err).Msg("relay server exit")
		}
	}()
	// Migrate db, ensure db is in correct state
	if err := store.Migrate(); err != nil {
		panic(err)
	}

	// Create an instance of InstallMarkerService
	installMarkerService := &InstallMarkerService{}

	// Optionally handle fresh install logic in Go on startup
	if installMarkerService.IsFreshInstall() {
		log.Info().Msg("Fresh install detected. Creating install marker.")
		if err := installMarkerService.CreateInstallMarker(); err != nil {
			log.Err(err).Msg("Failed to create install marker")
		}
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
		OnStartup: func(ctx context.Context) {
			app.startup(ctx)
			tssIns.Startup(ctx)
		},
		OnShutdown: func(ctx context.Context) {
			if err := mediator.StopServer(); err != nil {
				log.Err(err).Msg("fail to stop mediator")
			}
		},
		Bind: []interface{}{
			app,
			tssIns,
			store,
			mediator,
			goHttp,
			installMarkerService,
		},
		EnumBind: []interface{}{},
		LogLevel: logger.ERROR,
		Windows:  &windows.Options{},
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
