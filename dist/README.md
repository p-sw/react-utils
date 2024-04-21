# React Utils

Small & Simple Utility Package

## Index

- [Hooks](#hooks)
  - **[useLoadedState](#useLoadedState)** - useState with loading state
  - **[useTransitioned](#useTransitioned)** - useTransition without defining another function
  - **[useFormProvider](#useFormProvider)** - useFormState & useFormStatus without additional component
  - **[useDialog](#useDialog)** - native dialog tag without ref and optional chain calling
- [Functional Components](#functional-components)
  - **[FormStatus](#FormStatus)** - used for useFormProvider to provide useFormStatus
  - **[Map](#Map)** - customizable added & deleted event
  - **[Switch](#Switch)** - switch-case component
- [Utilities](#utilities)
  - **[isPromise](#isPromise)** - check if value is promise or not

# Features

## Hooks

### useLoadedState

```tsx
import { useLoadedState } from "@worplo/react-utils/hooks";

async function serverActionThatLoadsSomething() {
  "use server"
  // ...
}

function ClientComponent() {
  const [isLoading, state, triggerReload] = useLoadedState(async function loader() {
    return await serverActionThatLoadsSomething();
  }, [ /* Dependency Array - it automatically reloads state when dependency changes */ ], {
    keepPrevOnLoad: false, // default: true
  })

  return <>
    {
      isLoading
        ? <MdiLoading className={"animate-spin"} />
        : { state.map(() => <>{/*...*/}</>) }
    }
  </>
}
```

> **Note**: It is guaranteed that state is loaded when `isLoading` is false with `keepPrevOnLoad` is false.
> If `keepPrevOnLoad` is true, state is `Result | undefined` regardless of `isLoading`

### useTransitioned

```tsx
import { useTransitioned } from "@worplo/react-utils/hooks";
import React from "react";

function Component() {
  function onSubmit(e: FormEvent<HTMLFormElement>) {
    console.log(e);
  }

  const [isSubmitting, startSubmit] = useTransitioned(onSubmit);

  return <form onSubmit={startSubmit}>{/* ... */}</form>;
}
```

### useFormProvider

> Should be used with [FormStatus](#formstatus).

#### Without server action as parameter

```tsx
import { FormStatus } from "@worplo/react-utils/fc";
import { useFormProvider } from "@worplo/react-utils/hooks";

interface FormState {
  name: string;
  email: string;
}

function Form() {
  const [
    formStatus /* result of useFormStatus - pending, data (FormData), method */,
    provide /* set internal state for formStatus */,
  ] = useFormProvider<FormState>();

  return (
    <form>
      <FormStatus provide={provide} />
      <input name="name" type="text" />
      <input name="email" type="email" />
      <button type="submit" disabled={formStatus.pending}>
        {formStatus.pending ? "Loading..." : "Submit"}
      </button>
    </form>
  );
}
```

#### With server action as parameter

```tsx
import { FormStatus } from "@worplo/react-utils/fc";
import { useFormProvider } from "@worplo/react-utils/hooks";

interface FormState {
  name: string;
  email: string;
}

async function action(d: FormState): Promise<FormState> {
  "use server";
  /* ... */
  return d;
}

function Form() {
  const [
    formStatus /* result of useFormStatus - pending, data (FormData), method, action */,
    provide /* set internal state for formStatus */,
    submit /* submit function - wrapped with useActionState */,
    result /* result of useActionState - ReturnType | null */,
  ] = useFormProvider<FormState>((e: FormState, prev: FormState | null) => {
    return action(e);
  });

  return (
    <form action={submit}>
      {result && <div>Submitted : {JSON.stringify(result)}</div>}
      <FormStatus provide={provide} />
      <input name="name" type="text" />
      <input name="email" type="email" />
      <button type="submit" disabled={formStatus.pending}>
        {formStatus.pending ? "Loading..." : "Submit"}
      </button>
    </form>
  );
}
```

### useDialog

> WARNING: useDialog is not tested yet. Be careful when using it.

```tsx
import { useDialog } from "@worplo/react-utils/hooks";

export function Page() {
  const [
    Dialog /* Component wrapped native <dialog> tag */,
    {
      close,
      show /* All control functions are not undefined and callable without optional chain */,
    },
  ] = useDialog();

  return <Dialog></Dialog>;
}
```

## Functional Components

### FormStatus

> Should be used with [useFormProvider](#useformprovider).

### Map

> WARNING: Map is not tested yet. Be careful when using it.

```tsx
import { Map, type MapComponent } from "@worplo/react-utils/fc";

interface Toast {
  title: string;
  content: string;
}

const Toast: MapComponent<Toast> = ({ item: Toast, unsync: boolean }) => {
  return (
    <div
      className="toast"
      style={{ transition: "opacity 0.3s", opacity: unsync ? 0.5 : 1 }}
    >
      {item.title}
    </div>
  );
};

function Component() {
  const [toast, setToast] = useState<Toast[]>([]);
  const [renderedToast, setRenderedToast] = useState<Toast[]>([]); // used for getting internal state

  useEffect(() => {
    console.log(toast, renderedToast);
  }, [renderedToast]);

  return (
    <>
      <Map
        array={toast.map((item) => [
          item.title /* key - used like key props in React - it should be unique and stable */,
          item,
        ])}
        onInsert={(e) => {
          console.log(`Item added to toast array: ${e.item} at ${e.index}`);
          e.default(e.index, e.item); // default behavior when onInsert is not given - mutate state & automatically prevent default
          /* or, you can use */
          e.preventDefault();
          const [state, setState] = e.state;
          const newState = [...state];
          newState.splice(e.index, 0, e.item);
          setState(newState);
        }}
        onDelete={(e) => {
          e.preventDefault();
          console.log(
            `Deleting item from toast array after 350ms: ${
              e.state[e.index]
            } at ${e.index}`
          );
          setTimeout(() => {
            e.default(e.index); // In setTimeout, it cannot call preventDefault
          }, 350);
        }}
        sync={setRenderedToast}
      >
        {Toast}
      </Map>
    </>
  );
}
```

### Switch

```tsx
import { Switch } from "@worplo/react-utils/fc";

function Component({ value }: { value: "a" | "b" | "c" }) {
  return (
    <Switch value={value} a={<div>a</div>} b={<div>b</div>} c={<div>c</div>} />
  );
}
```

## Utilities

### isPromise

```ts
isPromise(new Promise(() => {})); // true
isPromise(() => {}); // false
```
