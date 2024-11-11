package main

import (
	"encoding/json"
	"os"
	"path/filepath"
)

type AppData struct {
	InstallMarker string `json:"installMarker"`
}

type InstallMarkerService struct{}


func (s *InstallMarkerService) GetAppDataDir() string {
	dir, _ := os.UserConfigDir()
	return filepath.Join(dir, "Vultisig")
}

func (s *InstallMarkerService) IsFreshInstall() bool {
	filePath := filepath.Join(s.GetAppDataDir(), "install_marker.json")
	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		return true
	}
	return false
}


func (s *InstallMarkerService) CreateInstallMarker() error {
	dir := s.GetAppDataDir()
	if err := os.MkdirAll(dir, os.ModePerm); err != nil {
		return err
	}

	filePath := filepath.Join(dir, "install_marker.json")
	file, err := os.Create(filePath)
	if err != nil {
		return err
	}
	defer file.Close()

	data := AppData{InstallMarker: "installed"}
	return json.NewEncoder(file).Encode(data)
}
