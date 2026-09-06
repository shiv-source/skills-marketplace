# React

Quick-reference for idiomatic React: function components, hooks, state, and rendering. Use only the section relevant to the code in front of you.

## Components

- Prefer function components over classes. A component is a function returning JSX.
- Props are read-only; treat them as the component's public contract. Name props for intent: `onClick`, `disabled`, `items`.
- Key props: a stable, unique key per list item (`id`, not array index) so reconciliation keeps state attached to the right element.
- Keep components small and single-purpose. Split presentation from data-fetching (container vs presentational).
- Co-locate a component's styles, types, and tests next to it when the repo follows that convention.

## Hooks

- Rules: only call hooks at the top level, and only from React function components or custom hooks — never conditionally, never in loops.
- `useState` for local UI state. Use the functional updater when the next value depends on the previous: `setCount(c => c + 1)`.
- `useEffect` for synchronizing with things outside React: subscriptions, timers, network, DOM. Return a cleanup function for subscriptions/timers.
- `useRef` for mutable values that must not trigger re-renders and for holding DOM nodes.
- `useMemo`/`useCallback` only when the derived value or callback is a dependency of a memoized child or effect — not as a blanket micro-optimization.
- `useReducer` when a piece of state has several related transitions (form state, machine-like flows).
- Extract reusable logic into custom hooks named `use<Thing>`.

## State

- Lift state to the lowest common ancestor that needs it. Prefer passing data down and callbacks up over prop-drilling through many layers.
- A single source of truth: don't mirror props into local state; derive it instead (`const isOver = count > limit`).
- Server data: keep fetched data outside component state when a data layer (react-query, Redux, SWR) already exists; let it own caching and invalidation.
- Avoid stale closures: if an effect or callback captures changing state, include it in the dependency array or read through a ref.

## Events & Forms

- Controlled inputs: value from state, `onChange` updates state. This keeps the input and state in sync and makes validation predictable.
- Read `event.target.value` directly in the handler; don't block on re-render ordering.
- Form submission: `onSubmit` with `preventDefault()`, validate before submit, disable while pending, and handle error state.
- Debounce search/autocomplete inputs instead of firing a request per keystroke.

## Performance

- Re-renders are cheap; only memoize when profiling shows a problem. Pass stable references via `useCallback`/`useMemo` where a memoized child actually benefits.
- Avoid creating new arrays/objects inline in props to memoized children (`items={[...]}` breaks `React.memo`).
- Code-split routes and heavy dependencies (`React.lazy` + `Suspense`) instead of growing the initial bundle.
- Keep effects minimal; unrelated subscriptions in one effect make cleanup and reasoning harder.

## Testing

- Test behavior from the user's perspective with Testing Library (`@testing-library/react`): query by role/label/text, not by implementation details.
- `render(<Component />)`, interact via `fireEvent`/`userEvent`, assert on visible outcomes.
- Wrap async effects in `findBy*` queries or `waitFor`; mock only what crosses the boundary (network, time).
- Test loading, empty, error, and success states of every async view.
