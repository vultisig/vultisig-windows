package utils

import (
	"os"

	"github.com/sirupsen/logrus"
)

var Logger = logrus.New()

func init() {
	// st output to stdout instead of default stderr
	Logger.SetOutput(os.Stdout)

	// based on env
	env := os.Getenv("ENV")
	if env == "production" {
		Logger.SetLevel(logrus.InfoLevel)
		Logger.SetFormatter(&logrus.JSONFormatter{})
	} else {
		Logger.SetLevel(logrus.DebugLevel)
		Logger.SetFormatter(&logrus.TextFormatter{
			FullTimestamp: true,
		})
	}
}
