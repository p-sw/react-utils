# React Utils

작고 간단한 유틸리티 패키지

## Index

- Hooks
  - useLoadedState
  - useTransitioned
  - useFormProvider
  - useDialog
- Functional Components
  - FormStatus
- Utilities
  - isPromise

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

> **Note**: keepPrevOnLoad가 false일 때는 isLoading이 false일 때 state가 로드되어 있음이 보장됨.  
> keepPrevOnLoad가 true일 때는 isLoading의 여부와 상관 없이 state는 `Result | undefined`.

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

> FormStatus 컴포넌트와 같이 사용해야 함. useFormStatus & useActionState 훅을 form과 함께 쓸 수 있도록 하는 새로운 훅

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
    Dialog /* dialog 태그를 래핑한 컴포넌트 */,
    { close, show /* 모든 컨트롤 함수들은 호출 가능 (undefined X) */ },
  ] = useDialog();

  return <Dialog></Dialog>;
}
```

## Functional Components

### FormStatus

> useFormProvider 훅과 같이 사용해야 함.
>
> [useFormProvider](#useformprovider) 훅의 문서를 참조

## Utilities

### isPromise

```ts
isPromise(new Promise(() => {})); // true
isPromise(() => {}); // false
```
