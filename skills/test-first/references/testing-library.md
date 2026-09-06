# Testing Library

Quick-reference for user-centric component tests with `@testing-library/*`. Use only the section relevant to the code in front of you.

## Philosophy

- Test the way users use the app: query by roles, labels, and visible text — never by implementation details (class names, component internals, DOM structure).
- The guiding query is the one a user finds; if you must reach for `container.querySelector` or a test id, question the design.
- Prefer the same queries a screen reader uses (`getByRole`, `getByLabelText`) — this doubles as an accessibility check.
- Assert on outcomes the user can observe (visible text, enabled/disabled, presence/absence), not internal state.

## Queries

- Priority order: `getByRole` (with name), `getByLabelText`, `getByPlaceholderText`, `getByText`, `getByDisplayValue`, `getByAltText`, `getByTitle`, then `data-testid` as last resort.
- Variants: `getBy*` (throw if not found / multiple), `queryBy*` (null when absent — for "does not render"), `findBy*` (async, waits up to timeout), `getAllBy*`/`queryAllBy*` (collections).
- Scope queries with `within(element)` for section-specific assertions.
- Use regex for flexible text matching: `getByRole('button', { name: /save/i })`.

## Async & Waiting

- Prefer `findBy*` for anything that appears after a promise resolves; it retries until the element shows up.
- `waitFor(() => expect(...))` for assertions tied to side effects (mock calls, element state changes) without a clean query.
- Avoid `await new Promise(r => setTimeout(r))` sleeps — they make tests slow and flaky; prefer real waits on the UI.
- When awaiting an element's disappearance, use `waitForElementToBeRemoved` or `waitFor` with `queryBy*` null.

## User Events

- Prefer `@testing-library/user-event` over raw `fireEvent` — it fires the full sequence of events a real user triggers (pointer, key, focus, blur).
- `userEvent.setup()` once per test, then `await user.click(element)`, `await user.type(input, 'text')`, `await user.keyboard('{Enter}')`.
- Use `fireEvent` only for cases user-event doesn't model (rare DOM events).
- Realistic interactions catch bugs fireEvent misses (double-change events, keyboard navigation).

## Setup & Mocking

- Mock only the boundary: network (fetch/MSW), timers, and browser APIs the component relies on. Never mock the component's own rendering.
- Use `vi.mock` (Vitest) or `jest.mock` for modules; keep mocks minimal and typed.
- Clean up between tests (RTL does automatically with the framework adapter); reset mocks in `beforeEach`.
- Provide a test wrapper for providers/contexts the component needs (Router, Redux store, theme) via the `wrapper` option.

## Common Pitfalls

- Don't assert on `data-testid` where role/text works; test ids are a maintenance smell.
- Don't couple tests to specific libraries by asserting on their internals (`screen` vs prop drilling is fine, DOM structure is not).
- Don't wrap the component in unnecessary providers per test; extract a shared `renderWithProviders` helper.
- Avoid `act` warnings by ensuring all state updates happen inside user events or async waits.
- Test loading, empty, error, and success states of async views — not just the happy path.
