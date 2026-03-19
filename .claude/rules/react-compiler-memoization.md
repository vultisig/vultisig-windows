# React Compiler — No Manual Memoization

This project runs `babel-plugin-react-compiler`. It automatically memoizes components, values, and callbacks at compile time.

**Do not add `useMemo` or `useCallback`.** Write plain expressions and inline functions — the compiler optimizes them. Existing code has many legacy usages; do not follow that pattern in new code.
