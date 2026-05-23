package storage

import (
	"errors"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"runtime"
	"strings"
)

const appDataDirName = "Vultisig"

type storeDBPathConfig struct {
	goos           string
	envDBPath      string
	executablePath string
	homeDir        string
	configDir      string
	cacheDir       string
	localAppData   string
}

func storeDBFilePath() (string, error) {
	config, err := currentStoreDBPathConfig()
	if err != nil {
		return "", err
	}

	dbFilePath, err := resolveStoreDBFilePath(config)
	if err != nil {
		return "", err
	}

	if err := os.MkdirAll(filepath.Dir(dbFilePath), 0700); err != nil {
		return "", fmt.Errorf("failed to create vultisig directory: %w", err)
	}

	if shouldMigrateLegacyExecutableDB(config) {
		if err := migrateLegacyDB(dbFilePath, legacyExecutableDBFilePathCandidates(config)); err != nil {
			return "", err
		}
	}

	return dbFilePath, nil
}

func currentStoreDBPathConfig() (storeDBPathConfig, error) {
	config := storeDBPathConfig{
		goos:         runtime.GOOS,
		envDBPath:    os.Getenv(`VULTISIG_DB_PATH`),
		localAppData: os.Getenv("LOCALAPPDATA"),
	}

	if config.envDBPath != "" {
		return config, nil
	}

	switch config.goos {
	case "linux":
		homeDir, err := os.UserHomeDir()
		if err != nil {
			return config, fmt.Errorf("failed to get user home directory: %w", err)
		}
		config.homeDir = homeDir
	case "windows":
		cacheDir, err := os.UserCacheDir()
		if err != nil {
			return config, fmt.Errorf("failed to get user cache directory: %w", err)
		}
		config.cacheDir = cacheDir
	case "darwin":
		configDir, err := os.UserConfigDir()
		if err != nil {
			return config, fmt.Errorf("failed to get user config directory: %w", err)
		}
		config.configDir = configDir
	default:
		executablePath, err := os.Executable()
		if err != nil {
			return config, fmt.Errorf("fail to get current directory, err: %w", err)
		}
		config.executablePath = executablePath
	}

	if config.goos == "windows" || config.goos == "darwin" {
		executablePath, err := os.Executable()
		if err != nil {
			return config, fmt.Errorf("fail to get current directory, err: %w", err)
		}
		config.executablePath = executablePath
	}

	return config, nil
}

func resolveStoreDBFilePath(config storeDBPathConfig) (string, error) {
	if config.envDBPath != "" {
		return filepath.Join(filepath.Dir(config.envDBPath), DbFileName), nil
	}

	switch config.goos {
	case "linux":
		if config.homeDir == "" {
			return "", fmt.Errorf("failed to get user home directory")
		}

		// Preserve the current Linux DB location. The previous code created
		// ~/.vultisig but opened ~/vultisig.db via filepath.Dir.
		return filepath.Join(config.homeDir, DbFileName), nil
	case "windows":
		if config.cacheDir == "" {
			return "", fmt.Errorf("failed to get user cache directory")
		}

		return filepath.Join(config.cacheDir, appDataDirName, DbFileName), nil
	case "darwin":
		if config.configDir == "" {
			return "", fmt.Errorf("failed to get user config directory")
		}

		return filepath.Join(config.configDir, appDataDirName, DbFileName), nil
	default:
		if config.executablePath == "" {
			return "", fmt.Errorf("fail to get current directory")
		}

		return filepath.Join(filepath.Dir(config.executablePath), DbFileName), nil
	}
}

func shouldMigrateLegacyExecutableDB(config storeDBPathConfig) bool {
	return config.envDBPath == "" && (config.goos == "windows" || config.goos == "darwin")
}

func legacyExecutableDBFilePathCandidates(config storeDBPathConfig) []string {
	if config.executablePath == "" {
		return nil
	}

	executableDir := filepath.Dir(config.executablePath)
	candidates := make([]string, 0, 2)

	if config.goos == "windows" && config.localAppData != "" {
		if virtualStoreDir, ok := windowsVirtualStoreDir(config.localAppData, executableDir); ok {
			candidates = append(candidates, filepath.Join(virtualStoreDir, DbFileName))
		}
	}

	candidates = append(candidates, filepath.Join(executableDir, DbFileName))

	return candidates
}

func windowsVirtualStoreDir(localAppData string, executableDir string) (string, bool) {
	cleanExecutableDir := filepath.Clean(executableDir)
	volumeName := filepath.VolumeName(cleanExecutableDir)
	if volumeName == "" {
		return "", false
	}

	relativeExecutableDir := strings.TrimPrefix(cleanExecutableDir, volumeName)
	relativeExecutableDir = strings.TrimLeft(relativeExecutableDir, `\/`)
	if relativeExecutableDir == "" {
		return "", false
	}

	return filepath.Join(localAppData, "VirtualStore", relativeExecutableDir), true
}

func migrateLegacyDB(targetDBFilePath string, candidateDBFilePaths []string) error {
	if _, err := os.Stat(targetDBFilePath); err == nil {
		return nil
	} else if !errors.Is(err, os.ErrNotExist) {
		return fmt.Errorf("could not inspect db at %q: %w", targetDBFilePath, err)
	}

	for _, candidateDBFilePath := range uniqueDBFilePathCandidates(candidateDBFilePaths, targetDBFilePath) {
		if _, err := os.Stat(candidateDBFilePath); err != nil {
			if errors.Is(err, os.ErrNotExist) {
				continue
			}

			return fmt.Errorf("could not inspect legacy db at %q: %w", candidateDBFilePath, err)
		}

		if err := copySQLiteDBFiles(candidateDBFilePath, targetDBFilePath); err != nil {
			return fmt.Errorf("could not migrate legacy db from %q to %q: %w", candidateDBFilePath, targetDBFilePath, err)
		}

		return nil
	}

	return nil
}

func uniqueDBFilePathCandidates(candidateDBFilePaths []string, targetDBFilePath string) []string {
	result := make([]string, 0, len(candidateDBFilePaths))
	seen := map[string]struct{}{}

	for _, candidateDBFilePath := range candidateDBFilePaths {
		if candidateDBFilePath == "" || sameFilePath(candidateDBFilePath, targetDBFilePath) {
			continue
		}

		normalizedPath := normalizeFilePath(candidateDBFilePath)
		if _, ok := seen[normalizedPath]; ok {
			continue
		}

		seen[normalizedPath] = struct{}{}
		result = append(result, candidateDBFilePath)
	}

	return result
}

func copySQLiteDBFiles(sourceDBFilePath string, targetDBFilePath string) error {
	suffixes, err := existingSQLiteDBFileSuffixes(sourceDBFilePath)
	if err != nil {
		return err
	}

	if err := removeTargetDBSidecars(targetDBFilePath); err != nil {
		return err
	}

	stagedFiles := make([]stagedSQLiteDBFile, 0, len(suffixes))
	defer func() {
		for _, stagedFile := range stagedFiles {
			if stagedFile.tempFilePath != "" {
				_ = os.Remove(stagedFile.tempFilePath)
			}
		}
	}()

	for _, suffix := range suffixes {
		tempFilePath, err := copyFileToTemp(
			sourceDBFilePath+suffix,
			filepath.Dir(targetDBFilePath),
			filepath.Base(targetDBFilePath)+suffix+".*.migrating",
		)
		if err != nil {
			return err
		}

		stagedFiles = append(stagedFiles, stagedSQLiteDBFile{
			suffix:       suffix,
			tempFilePath: tempFilePath,
		})
	}

	for i := len(stagedFiles) - 1; i >= 0; i-- {
		targetFilePath := targetDBFilePath + stagedFiles[i].suffix
		if err := os.Rename(stagedFiles[i].tempFilePath, targetFilePath); err != nil {
			return err
		}

		stagedFiles[i].tempFilePath = ""
	}

	return nil
}

type stagedSQLiteDBFile struct {
	suffix       string
	tempFilePath string
}

func removeTargetDBSidecars(targetDBFilePath string) error {
	for _, suffix := range []string{"-wal", "-shm"} {
		if err := os.Remove(targetDBFilePath + suffix); err != nil && !errors.Is(err, os.ErrNotExist) {
			return fmt.Errorf("could not remove stale target db sidecar %q: %w", targetDBFilePath+suffix, err)
		}
	}

	return nil
}

func existingSQLiteDBFileSuffixes(sourceDBFilePath string) ([]string, error) {
	suffixes := []string{""}
	for _, suffix := range []string{"-wal", "-shm"} {
		if _, err := os.Stat(sourceDBFilePath + suffix); err == nil {
			suffixes = append(suffixes, suffix)
		} else if !errors.Is(err, os.ErrNotExist) {
			return nil, fmt.Errorf("could not inspect legacy db sidecar %q: %w", sourceDBFilePath+suffix, err)
		}
	}

	return suffixes, nil
}

func copyFileToTemp(sourceFilePath string, targetDir string, targetPattern string) (tempFilePath string, returnErr error) {
	sourceFile, err := os.Open(sourceFilePath)
	if err != nil {
		return "", err
	}
	defer sourceFile.Close()

	targetFile, err := os.CreateTemp(targetDir, targetPattern)
	if err != nil {
		return "", err
	}
	createdTempFilePath := targetFile.Name()
	tempFilePath = createdTempFilePath
	defer func() {
		if err := targetFile.Close(); returnErr == nil && err != nil {
			returnErr = err
		}
		if returnErr != nil {
			_ = os.Remove(createdTempFilePath)
			tempFilePath = ""
		}
	}()

	if _, err := io.Copy(targetFile, sourceFile); err != nil {
		return "", err
	}

	return tempFilePath, nil
}

func sameFilePath(a string, b string) bool {
	return normalizeFilePath(a) == normalizeFilePath(b)
}

func normalizeFilePath(path string) string {
	cleanPath := filepath.Clean(path)
	if runtime.GOOS == "windows" {
		return strings.ToLower(cleanPath)
	}

	return cleanPath
}
