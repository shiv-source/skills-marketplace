# Angular

Quick-reference for idiomatic Angular: components, templates, DI, services, and signals. Use only the section relevant to the code in front of you.

## Components

- A component is a class decorated with `@Component({ selector, template/templateUrl, standalone: true })`. Prefer standalone components over NgModules for new code.
- Class fields are bound into the template; private members use `private` and signal inputs for strict typing.
- Inputs/outputs: `@Input() items = []` and `@Output() selected = new EventEmitter<T>()`. Use signal inputs (`input<T>()`) where the repo has upgraded.
- Lifecycle: `ngOnInit` for one-time setup, `ngOnDestroy` for teardown (unsubscribe, clear timers), `ngOnChanges`/`effect()` for reactive responses to input changes.
- Keep components presentational; inject services for data and state.

## Templates & Binding

- Interpolation `{{ value }}`, property binding `[prop]="expr"`, event binding `(event)="handler($event)"`, two-way `[(ngModel)]` for forms.
- Control flow: `@if / @else`, `@for (item of items; track item.id)`, `@switch` (Angular 17+). Avoid `*ngIf`/`*ngFor` in new code.
- Track by a stable id in `@for` to keep identity across updates.
- `ngClass`/`ngStyle` only for dynamic values; static styles belong in the component stylesheet.
- Pipes for transforms: built-in `date`, `uppercase`, `async`; use `| async` to unwrap `Observable`/`Promise` and auto-subscribe/unsubscribe.

## Dependency Injection

- Services are `@Injectable({ providedIn: 'root' })` singletons by default; scope to a component/route only when state must be per-instance.
- Inject via constructor parameters: `constructor(private api: ApiService) {}`.
- Use `@Inject(TOKEN)` or `InjectionToken`s for config values so they can be overridden per environment.
- Prefer `providedIn` over declaring providers in `@NgModule.providers` or `providers` arrays for tree-shakable, explicit scoping.
- Never `new` a service manually; let the injector construct the graph.

## Services

- Services hold HTTP calls, shared state, and business logic; components delegate to them and stay thin.
- Return `Observable<T>` or signals from services; handle errors with `catchError` returning a typed fallback.
- Keep a single responsibility per service (one domain/aggregate), and prefer small focused services over god objects.
- Use `HttpClient` from `@angular/common/http` for requests; typed responses via generics.

## RxJS & Signals

- Prefer signals (`signal()`, `computed()`) for synchronous state and `effect()` for side effects; RxJS remains for event streams, debouncing, and combining async sources.
- `computed` derives values reactively; never mutate a signal inside a `computed`.
- When using subscriptions, prefer `| async` or `takeUntilDestroyed()`/explicit `ngOnDestroy` unsubscribe to avoid leaks.
- Combine streams with `combineLatest`, `merge`, `switchMap`; use `switchMap` for search/typeahead to cancel stale requests.

## Forms

- Reactive forms (`FormGroup`/`FormControl`) for anything non-trivial: validation, dynamic fields, and typed controls are easier than template-driven.
- Build the group once in the component and bind `[formGroup]`; `FormBuilder.group` for concise construction.
- Validate with built-in validators plus custom ones; surface `control.errors` and touched state in the template.
- Reset/set value carefully (`setValue` requires all controls, `patchValue` partial) and mark touched after submit attempts.

## Testing

- `TestBed.configureTestingModule` with standalone components; provide mock services via `providers`.
- Use `@angular/platform-browser-dynamic/testing` and `ComponentFixtureAutoDetect` for simpler change detection.
- Query via `fixture.debugElement.query(By.css(...))` or `By.directive`; prefer testing by rendered output and user-visible behavior.
- Mock `HttpClient` with `provideHttpClientTesting()` and `HttpTestingController`; never hit the network in unit tests.
- Test loading, empty, error, and success states of every async view.
