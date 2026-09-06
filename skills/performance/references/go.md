# Go

Quick-reference for idiomatic Go: packages, errors, concurrency, and testing. Use only the section relevant to the code in front of you.

## Packages & Naming

- One directory, one package; `package` name matches the last path element (lowercase, no underscores).
- Exported identifiers start uppercase; unexported lowercase. Exported only what consumers need — a small API surface is a feature.
- Short, unambiguous names: `user`, `cfg`, `db` — avoid `userObject`, `configData`. Acronyms are uppercase (`HTTP`, `ID`, `URL`).
- Keep dependencies acyclic and packages cohesive: put types near the code that owns them, not in a shared `models` dumping ground.

## Errors

- Return errors, don't swallow them; wrap with context using `fmt.Errorf("do thing: %w", err)` so the %w chain is preserved.
- Use `errors.Is`/`errors.As` to match sentinel/typed errors; never string-compare error messages.
- A function that can fail returns `(T, error)`; callers must handle the error before using the value.
- Sentinel errors (`var ErrNotFound = errors.New(...)`) for expected, catchable conditions; typed errors when callers need extra fields.
- Log with context via the repo's logger (zerolog), and never log secrets or tokens.

## Concurrency

- "Do not communicate by sharing memory; share memory by communicating": use channels and goroutines over shared mutable state.
- A goroutine must be canceled or bounded: pass `context.Context`, never leak goroutines past the caller's scope.
- `sync.WaitGroup` to wait for a fixed set of goroutines; always `defer wg.Done()` right after `wg.Add(1)`.
- `sync.Mutex`/`RWMutex` to protect shared state; prefer `RWMutex` when reads dominate. Never copy a mutex.
- Prefer `errgroup.Group` for fan-out where one failure should cancel the rest; surface the first error.

## Structs & Methods

- Prefer value receivers for small, immutable types; pointer receivers when the method mutates or the type is large.
- Zero-value structs should be usable (a nil/empty value must not panic) — design for the zero value.
- `New*` constructors when a struct needs setup or invariants; otherwise literals are fine.
- Use `json:"name,omitempty"` tags deliberately; `omitempty` on a zero value hides it from output — know when you want that.
- Embedding gives promoted methods/fields — use it for behavior reuse (e.g. `io.Reader` composition), not as inheritance.

## Interfaces

- Define interfaces where you consume them, not where you implement them (consumer-side interfaces, implicit satisfaction).
- Keep interfaces small (1–3 methods); a large interface is usually a god interface in disguise.
- `interface{}`/`any` is a last resort — prefer concrete types or generics; validate early when decoding untrusted data.
- Accept interfaces, return structs: parameters express what the caller needs, returns stay concrete and discoverable.

## Testing

- Tests live in `*_test.go` beside the code, package `<pkg>` or `<pkg>_test`. Table-driven tests with subtests (`t.Run`) for input/output matrices.
- `t.Helper()` in assertion helpers so failures point at the real line; `t.Fatalf` to abort, `t.Errorf` to continue.
- Test the exported API (behavior), not internals; use `_test` external package to force the public contract.
- Mock at boundaries with `net/http/httptest`, an interface fake, or a test double the interface already implies — avoid heavy mocking frameworks.
- Fuzz and property checks for parsers; always cover error paths and boundary values, not just the happy path.
