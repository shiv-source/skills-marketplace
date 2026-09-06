# GraphQL

Quick-reference for idiomatic GraphQL: schemas, resolvers, queries/mutations, and the N+1 problem. Use only the section relevant to the code in front of you.

## Schema

- A schema is the contract: `type Query`, `type Mutation`, object types, enums, and scalars. It is the public API — design it carefully.
- Name types `PascalCase`, fields `camelCase`; use enums for closed sets and custom scalars (`DateTime`, `ID`) only with validation.
- Every field must be nullable unless it can truly never be null — non-null on an optional join breaks the whole query when the join is empty.
- Document with descriptions (`""" ... """`); a self-documenting schema is the point of GraphQL.
- `ID` for identity fields; never expose internal database ids where an opaque id suffices.

## Queries & Mutations

- Mutations change state and return the affected data; name them as verbs (`createUser`, `archiveProject`) and always make them idempotent where sensible.
- Input types for arguments (a single `Input` object, not a list of flat args) so the shape is extensible and self-documenting.
- Query for exactly what the client needs — no over-fetching. Encourage nested selection and `connection` patterns for lists.
- Use field arguments for filtering/sorting/pagination (`users(filter: ..., first: 10, after: ...)`), not separate endpoints.
- Return a result object for mutations when the caller needs the created entity or errors: `type CreateUserResult { user: User, errors: [ValidationError!] }`.

## Resolvers

- A resolver is a function that resolves one field; the default resolves `parent[fieldName]` — add resolvers only when logic is needed.
- Keep resolvers thin: validate, call a service, return data. Business logic belongs in services, not resolver glue.
- Resolvers receive `(parent, args, context, info)`; put auth/user/session in `context`, never re-fetch it per resolver.
- Use `info`/DataLoader for field-level joins; avoid re-deriving the same data in sibling resolvers.
- Handle errors deliberately: `ApolloError`/typed error extensions for client handling; never leak stack traces or internals.

## The N+1 Problem

- A nested resolver that hits the DB per parent row is N+1: one query for the list, then N for each child.
- Batch with DataLoader: `loader.load(parent.userId)` coalesces a turn's lookups into one `WHERE id = ANY($1)` query.
- Group loads by key; prime the loader for values you already fetched to avoid redundant queries.
- Prefer a single joined query + resolver mapping when the shape is stable; DataLoader when the shape varies per request.
- Profile with query tracing/`extensions` to confirm you fixed the N+1, not just moved it.

## Mutations & Validation

- Validate input at the boundary and return structured field errors, not a single generic failure.
- Partial failures: a mutation that creates several records should report which succeeded and which failed (result object with `errors`).
- Guard every mutation with authorization — never assume the client is allowed because the field exists.
- Transactions around multi-step mutations; commit/rollback as a unit.

## Federation

- Federated services each own a subgraph; the gateway composes the supergraph.
- Mark the entity type with `@key(fields: "id")` and implement `__resolveReference` to load an entity by its key.
- Only extend fields you truly own; `@shareable` for fields all subgraphs can return consistently.
- Keep subgraph boundaries by domain; avoid tight coupling where one subgraph resolves deep into another's data.
