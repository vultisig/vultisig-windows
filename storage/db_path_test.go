package storage

import (
	"os"
	"path/filepath"
	"runtime"
	"strings"
	"testing"
	"time"
)

func TestResolveStoreDBFilePathUsesEnvironmentPathDirectory(t *testing.T) {
	envDBPath := filepath.Join(t.TempDir(), "custom.db")

	dbFilePath, err := resolveStoreDBFilePath(storeDBPathConfig{
		envDBPath: envDBPath,
	})
	if err != nil {
		t.Fatal(err)
	}

	expectedPath := filepath.Join(filepath.Dir(envDBPath), DbFileName)
	if dbFilePath != expectedPath {
		t.Fatalf("expected %q, got %q", expectedPath, dbFilePath)
	}
}

func TestResolveStoreDBFilePathPreservesLinuxLocation(t *testing.T) {
	homeDir := filepath.Join(t.TempDir(), "home")

	dbFilePath, err := resolveStoreDBFilePath(storeDBPathConfig{
		goos:    "linux",
		homeDir: homeDir,
	})
	if err != nil {
		t.Fatal(err)
	}

	expectedPath := filepath.Join(homeDir, DbFileName)
	if dbFilePath != expectedPath {
		t.Fatalf("expected %q, got %q", expectedPath, dbFilePath)
	}
}

func TestResolveStoreDBFilePathUsesLocalAppDataOnWindows(t *testing.T) {
	cacheDir := filepath.Join(t.TempDir(), "AppData", "Local")

	dbFilePath, err := resolveStoreDBFilePath(storeDBPathConfig{
		goos:     "windows",
		cacheDir: cacheDir,
	})
	if err != nil {
		t.Fatal(err)
	}

	expectedPath := filepath.Join(cacheDir, appDataDirName, DbFileName)
	if dbFilePath != expectedPath {
		t.Fatalf("expected %q, got %q", expectedPath, dbFilePath)
	}
}

func TestResolveStoreDBFilePathUsesApplicationSupportOnDarwin(t *testing.T) {
	configDir := filepath.Join(t.TempDir(), "Library", "Application Support")

	dbFilePath, err := resolveStoreDBFilePath(storeDBPathConfig{
		goos:      "darwin",
		configDir: configDir,
	})
	if err != nil {
		t.Fatal(err)
	}

	expectedPath := filepath.Join(configDir, appDataDirName, DbFileName)
	if dbFilePath != expectedPath {
		t.Fatalf("expected %q, got %q", expectedPath, dbFilePath)
	}
}

func TestStoreDBFilePathUsesUserWritableLocationForCurrentOS(t *testing.T) {
	expectedPath := configureCurrentOSUserWritableDBPath(t)

	dbFilePath, err := storeDBFilePath()
	if err != nil {
		t.Fatal(err)
	}

	if dbFilePath != expectedPath {
		t.Fatalf("expected %q, got %q", expectedPath, dbFilePath)
	}

	if _, err := os.Stat(filepath.Dir(dbFilePath)); err != nil {
		t.Fatal(err)
	}
}

func TestNewStoreCanSaveVaultAtUserWritableLocationForCurrentOS(t *testing.T) {
	expectedPath := configureCurrentOSUserWritableDBPath(t)

	store, err := NewStore()
	if err != nil {
		t.Fatal(err)
	}
	defer store.db.Close()

	if err := store.Migrate(); err != nil {
		t.Fatal(err)
	}

	vault := &Vault{
		Name:           "Test Vault",
		PublicKeyECDSA: "test-public-key-ecdsa",
		PublicKeyEdDSA: "test-public-key-eddsa",
		Signers:        []string{"test-signer"},
		CreatedAt:      time.Unix(1, 0).UTC(),
		HexChainCode:   "test-chain-code",
		LocalPartyID:   "test-party",
		LibType:        "DKLS",
	}
	if err := store.SaveVault(vault); err != nil {
		t.Fatal(err)
	}

	if _, err := os.Stat(expectedPath); err != nil {
		t.Fatal(err)
	}

	savedVault, err := store.GetVault(vault.PublicKeyECDSA)
	if err != nil {
		t.Fatal(err)
	}

	if savedVault.Name != vault.Name {
		t.Fatalf("expected saved vault name %q, got %q", vault.Name, savedVault.Name)
	}
}

func TestMigrateLegacyDBCopiesMainDBAndSidecars(t *testing.T) {
	tempDir := t.TempDir()
	legacyDBFilePath := filepath.Join(tempDir, "legacy", DbFileName)
	targetDBFilePath := filepath.Join(tempDir, "target", DbFileName)

	writeFile(t, legacyDBFilePath, "main")
	writeFile(t, legacyDBFilePath+"-wal", "wal")
	writeFile(t, legacyDBFilePath+"-shm", "shm")

	if err := os.MkdirAll(filepath.Dir(targetDBFilePath), 0700); err != nil {
		t.Fatal(err)
	}

	if err := migrateLegacyDB(targetDBFilePath, []string{legacyDBFilePath}); err != nil {
		t.Fatal(err)
	}

	assertFileContent(t, targetDBFilePath, "main")
	assertFileContent(t, targetDBFilePath+"-wal", "wal")
	assertFileContent(t, targetDBFilePath+"-shm", "shm")
}

func TestMigrateLegacyDBDoesNotOverwriteExistingTarget(t *testing.T) {
	tempDir := t.TempDir()
	legacyDBFilePath := filepath.Join(tempDir, "legacy", DbFileName)
	targetDBFilePath := filepath.Join(tempDir, "target", DbFileName)

	writeFile(t, legacyDBFilePath, "legacy")
	writeFile(t, targetDBFilePath, "target")

	if err := migrateLegacyDB(targetDBFilePath, []string{legacyDBFilePath}); err != nil {
		t.Fatal(err)
	}

	assertFileContent(t, targetDBFilePath, "target")
}

func TestMigrateLegacyDBUsesFirstExistingCandidate(t *testing.T) {
	tempDir := t.TempDir()
	missingDBFilePath := filepath.Join(tempDir, "missing", DbFileName)
	legacyDBFilePath := filepath.Join(tempDir, "legacy", DbFileName)
	targetDBFilePath := filepath.Join(tempDir, "target", DbFileName)

	writeFile(t, legacyDBFilePath, "legacy")

	if err := os.MkdirAll(filepath.Dir(targetDBFilePath), 0700); err != nil {
		t.Fatal(err)
	}

	if err := migrateLegacyDB(targetDBFilePath, []string{missingDBFilePath, legacyDBFilePath}); err != nil {
		t.Fatal(err)
	}

	assertFileContent(t, targetDBFilePath, "legacy")
}

func TestMigrateLegacyDBReplacesStaleTargetSidecars(t *testing.T) {
	tempDir := t.TempDir()
	legacyDBFilePath := filepath.Join(tempDir, "legacy", DbFileName)
	targetDBFilePath := filepath.Join(tempDir, "target", DbFileName)

	writeFile(t, legacyDBFilePath, "main")
	writeFile(t, legacyDBFilePath+"-wal", "wal")
	writeFile(t, targetDBFilePath+"-wal", "stale")

	if err := migrateLegacyDB(targetDBFilePath, []string{legacyDBFilePath}); err != nil {
		t.Fatal(err)
	}

	assertFileContent(t, targetDBFilePath, "main")
	assertFileContent(t, targetDBFilePath+"-wal", "wal")
}

func TestMigrateLegacyDBCreatesWritableTarget(t *testing.T) {
	tempDir := t.TempDir()
	legacyDBFilePath := filepath.Join(tempDir, "legacy", DbFileName)
	targetDBFilePath := filepath.Join(tempDir, "target", DbFileName)

	writeFile(t, legacyDBFilePath, "legacy")
	if err := os.Chmod(legacyDBFilePath, 0400); err != nil {
		t.Fatal(err)
	}
	if err := os.MkdirAll(filepath.Dir(targetDBFilePath), 0700); err != nil {
		t.Fatal(err)
	}

	if err := migrateLegacyDB(targetDBFilePath, []string{legacyDBFilePath}); err != nil {
		t.Fatal(err)
	}

	targetFile, err := os.OpenFile(targetDBFilePath, os.O_WRONLY|os.O_APPEND, 0)
	if err != nil {
		t.Fatal(err)
	}
	if err := targetFile.Close(); err != nil {
		t.Fatal(err)
	}
}

func TestLegacyExecutableDBFilePathCandidatesIncludesExecutableDir(t *testing.T) {
	executablePath := filepath.Join(t.TempDir(), "Vultisig", "vultisig.exe")

	candidates := legacyExecutableDBFilePathCandidates(storeDBPathConfig{
		goos:           "windows",
		executablePath: executablePath,
	})

	expectedPath := filepath.Join(filepath.Dir(executablePath), DbFileName)
	if len(candidates) == 0 || candidates[0] != expectedPath {
		t.Fatalf("expected first candidate %q, got %q", expectedPath, strings.Join(candidates, ", "))
	}
}

func TestLegacyExecutableDBFilePathCandidatesPrefersWindowsVirtualStore(t *testing.T) {
	if runtime.GOOS != "windows" {
		t.Skip("Windows VirtualStore paths use Windows filepath semantics")
	}

	localAppData := filepath.Join(t.TempDir(), "AppData", "Local")
	executablePath := filepath.Join("C:\\", "Program Files", "Vultisig", "Vultisig", "vultisig.exe")

	candidates := legacyExecutableDBFilePathCandidates(storeDBPathConfig{
		goos:           "windows",
		executablePath: executablePath,
		localAppData:   localAppData,
	})

	expectedVirtualStorePath := filepath.Join(
		localAppData,
		"VirtualStore",
		"Program Files",
		"Vultisig",
		"Vultisig",
		DbFileName,
	)
	if len(candidates) < 2 || candidates[0] != expectedVirtualStorePath {
		t.Fatalf("expected first candidate %q, got %q", expectedVirtualStorePath, strings.Join(candidates, ", "))
	}
}

func writeFile(t *testing.T, filePath string, content string) {
	t.Helper()

	if err := os.MkdirAll(filepath.Dir(filePath), 0700); err != nil {
		t.Fatal(err)
	}

	if err := os.WriteFile(filePath, []byte(content), 0600); err != nil {
		t.Fatal(err)
	}
}

func assertFileContent(t *testing.T, filePath string, expectedContent string) {
	t.Helper()

	content, err := os.ReadFile(filePath)
	if err != nil {
		t.Fatal(err)
	}

	if string(content) != expectedContent {
		t.Fatalf("expected %q to contain %q, got %q", filePath, expectedContent, string(content))
	}
}

func configureCurrentOSUserWritableDBPath(t *testing.T) string {
	t.Helper()

	tempDir := t.TempDir()
	t.Setenv("VULTISIG_DB_PATH", "")

	switch runtime.GOOS {
	case "windows":
		localAppData := filepath.Join(tempDir, "AppData", "Local")
		t.Setenv("LOCALAPPDATA", localAppData)
		return filepath.Join(localAppData, appDataDirName, DbFileName)
	case "darwin":
		homeDir := filepath.Join(tempDir, "home")
		t.Setenv("HOME", homeDir)
		return filepath.Join(homeDir, "Library", "Application Support", appDataDirName, DbFileName)
	case "linux":
		homeDir := filepath.Join(tempDir, "home")
		t.Setenv("HOME", homeDir)
		return filepath.Join(homeDir, DbFileName)
	default:
		t.Skipf("store db path smoke test is not defined for %s", runtime.GOOS)
		return ""
	}
}
