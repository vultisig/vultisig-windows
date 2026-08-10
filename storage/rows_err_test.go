package storage

import (
	"fmt"
	"go/ast"
	"go/parser"
	"go/token"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"testing"
)

// A rows.Next() loop that returns without consulting rows.Err() reports
// success on a truncated result set: if iteration aborts partway (connection
// loss, cancelled context), Next() simply returns false and the collected
// slice is silently short. Every read path in this package must check it.
//
// This is asserted structurally because the affected functions take no
// context, so a genuine mid-iteration failure cannot be injected from a test —
// every fault reachable from here surfaces earlier via the query or scan checks.
//
// The check is bound to the specific rows value being iterated: a function
// that iterates rowsA while only checking rowsB.Err() is still an offender.
func TestAllRowIterationsCheckRowsErr(t *testing.T) {
	sources, err := filepath.Glob("*.go")
	if err != nil {
		t.Fatal(err)
	}

	var offenders []string
	fset := token.NewFileSet()

	for _, source := range sources {
		if strings.HasSuffix(source, "_test.go") {
			continue
		}

		file, err := parser.ParseFile(fset, source, nil, 0)
		if err != nil {
			t.Fatalf("could not parse %s: %v", source, err)
		}

		ast.Inspect(file, func(n ast.Node) bool {
			fn, ok := n.(*ast.FuncDecl)
			if !ok || fn.Body == nil {
				return true
			}

			iterated := receiversOfCall(fn.Body, "Next")
			if len(iterated) == 0 {
				return true
			}
			checked := receiversOfCall(fn.Body, "Err")

			for rows := range iterated {
				if !checked[rows] {
					offenders = append(offenders,
						fmt.Sprintf("%s: %s (iterates %s)", source, fn.Name.Name, rows))
				}
			}
			return true
		})
	}

	sort.Strings(offenders)

	if len(offenders) > 0 {
		t.Fatalf("these row iterations never check Err() on the value they iterate, so a "+
			"mid-iteration failure would return a truncated list with a nil error:\n\t%s",
			strings.Join(offenders, "\n\t"))
	}
}

// receiversOfCall reports the identifiers x for every x.<method>() call in body,
// so an Err() check can be matched against the rows value actually iterated.
func receiversOfCall(body *ast.BlockStmt, method string) map[string]bool {
	found := map[string]bool{}
	ast.Inspect(body, func(n ast.Node) bool {
		call, ok := n.(*ast.CallExpr)
		if !ok {
			return true
		}
		sel, ok := call.Fun.(*ast.SelectorExpr)
		if !ok || sel.Sel.Name != method {
			return true
		}
		if ident, ok := sel.X.(*ast.Ident); ok {
			found[ident.Name] = true
		}
		return true
	})
	return found
}

// Guard against the test silently passing because it parsed nothing.
func TestRowsErrGuardActuallyInspectsSources(t *testing.T) {
	sources, err := filepath.Glob("*.go")
	if err != nil {
		t.Fatal(err)
	}

	var nonTest int
	for _, source := range sources {
		if !strings.HasSuffix(source, "_test.go") {
			nonTest++
		}
	}
	if nonTest == 0 {
		t.Fatal("no non-test sources found; the rows.Err() guard would vacuously pass")
	}

	if _, err := os.Stat("store.go"); err != nil {
		t.Fatalf("expected store.go in the package directory: %v", err)
	}
}
