package storage

import (
	"go/ast"
	"go/parser"
	"go/token"
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
func TestAllRowIterationsCheckRowsErr(t *testing.T) {
	fset := token.NewFileSet()
	file, err := parser.ParseFile(fset, "store.go", nil, 0)
	if err != nil {
		t.Fatal(err)
	}

	var offenders []string
	ast.Inspect(file, func(n ast.Node) bool {
		fn, ok := n.(*ast.FuncDecl)
		if !ok || fn.Body == nil {
			return true
		}

		var iterates, checksErr bool
		ast.Inspect(fn.Body, func(m ast.Node) bool {
			sel, ok := m.(*ast.SelectorExpr)
			if !ok {
				return true
			}
			switch sel.Sel.Name {
			case "Next":
				iterates = true
			case "Err":
				checksErr = true
			}
			return true
		})

		if iterates && !checksErr {
			offenders = append(offenders, fn.Name.Name)
		}
		return true
	})

	if len(offenders) > 0 {
		t.Fatalf("these functions iterate rows without checking rows.Err(), so a "+
			"mid-iteration failure would return a truncated list with a nil error: %s",
			strings.Join(offenders, ", "))
	}
}
