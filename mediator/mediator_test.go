package mediator

import "testing"

func TestResolveMediatorPort(t *testing.T) {
	t.Run("default", func(t *testing.T) {
		port, err := resolveMediatorPort("")
		if err != nil {
			t.Fatal(err)
		}
		if port != DefaultMediatorPort {
			t.Fatalf("expected %d, got %d", DefaultMediatorPort, port)
		}
	})

	t.Run("custom", func(t *testing.T) {
		port, err := resolveMediatorPort("25220")
		if err != nil {
			t.Fatal(err)
		}
		if port != 25220 {
			t.Fatalf("expected 25220, got %d", port)
		}
	})

	for _, value := range []string{"0", "70000", "invalid"} {
		t.Run(value, func(t *testing.T) {
			if _, err := resolveMediatorPort(value); err == nil {
				t.Fatalf("expected %q to fail", value)
			}
		})
	}
}

func TestNormalizeMDNSHostname(t *testing.T) {
	tests := map[string]string{
		"vika":                   "vika.local.",
		"vika.local":             "vika.local.",
		"vika.LOCAL":             "vika.local.",
		"vika.local.local":       "vika.local.",
		"vika.LOCAL.local.LOCAL": "vika.local.",
	}

	for input, expected := range tests {
		t.Run(input, func(t *testing.T) {
			if actual := normalizeMDNSHostname(input); actual != expected {
				t.Fatalf("normalizeMDNSHostname(%q) = %q, want %q", input, actual, expected)
			}
		})
	}
}
