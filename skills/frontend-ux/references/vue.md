# Vue

Quick-reference for idiomatic Vue: single-file components, reactivity, composables, and events. Use only the section relevant to the code in front of you.

## SFC Structure

- A single-file component (`.vue`) has three blocks: `<template>`, `<script setup>`, and optional scoped `<style>`.
- Prefer `<script setup>` (Composition API) for new code; it compiles top-level bindings into the template automatically.
- Name files `PascalCase.vue`; use multi-word component names to avoid clashing with native elements.
- Scoped styles (`<style scoped>`) keep component styles contained; global styles belong in a global stylesheet or design-token layer.

## Reactivity

- `ref()` for a single reactive value (`ref(0)` → `.value` in script, unwrapped in template).
- `reactive()` for an object of state; access properties directly.
- `computed()` for derived values that recompute only when dependencies change — never mutate inside a computed.
- `watch()` for side effects on reactive sources (debounce, persistence); `watchEffect()` when you only care that something ran.
- Avoid deep reactive objects in `reactive()` for hot paths; shallowRef for large/immutable payloads.

## Composables

- Extract reusable logic into functions named `useThing()` in `composables/` — the Composition-API analog of React hooks.
- Composables may return `ref`/`computed` (use `.value` at the call site in script) and cleanup (`onUnmounted`) for subscriptions/timers.
- Keep composables dependency-free where possible; accept params and return an API surface of state + actions.
- Name convention: `useAuth`, `useFetch`, `useDebouncedValue`.

## Events & v-model

- `v-model` gives two-way binding on inputs and custom components (`defineModel()` in `<script setup>`).
- Emit events with `defineEmits(['update:value', 'save'])`; listen with `@save="handler"`.
- `v-model:prop` supports multiple v-models on one component (e.g. `v-model:title`, `v-model:open`).
- Form inputs: bind with `v-model`; for native select/checkbox/radio Vue handles the value semantics.

## Conditional & List Rendering

- `v-if` / `v-else-if` / `v-else` for conditional rendering; `v-show` toggles CSS display when the element must stay mounted.
- `v-for` with `:key` — use a stable unique key (`item.id`), never the index for reorderable lists.
- Do not use `v-if` and `v-for` on the same element; prefer a computed filtered list.
- `template` tag can group multiple elements under one `v-if`/`v-for` without adding DOM.

## Performance

- Use `v-once` for static content rendered once and `v-memo` only where profiling shows it matters.
- Code-split route components and heavy libraries; lazy-load with dynamic `import()`.
- Avoid huge `reactive()` objects being watched wholesale; scope reactivity to what changes.
- `shallowRef` + explicit replacement for large immutable data (lists, blobs) to skip deep proxy cost.

## Testing

- Test with `@vue/test-utils` + Vitest: `mount(Component)`, `wrapper.find('[data-testid]')` or role-based queries.
- Interact via `wrapper.setValue`, `trigger('click')`, and `wrapper.emitted()` to assert emitted events.
- For async effects use `flushPromises()`/`nextTick()`; mock network at the boundary.
- Prefer testing user-visible behavior and emitted events over internal implementation details.
