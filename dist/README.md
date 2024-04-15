# React Utils

작고 간단한 유틸리티 패키지

## Index

* Hooks
  * useLoadedState
  * useTransitioned
  * useFormProvider
* Functional Components
  * FormStatus
* Utilities
  * isPromise

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
  }, {
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

  const [ isSubmitting, startSubmit ] = useTransitioned(onSubmit);
  
  return <form onSubmit={startSubmit}>
    {/* ... */}
  </form>
}
```


### useFormProvider

> FormStatus 컴포넌트와 같이 사용해야 함. useFormStatus 훅을 form과 함께 쓸 수 있도록 하는 새로운 훅

```tsx
import { FormStatus } from "@worplo/react-utils/fc";
import { useFormProvider } from "@worplo/react-utils/hooks";

function action() {
  /* ... */
}

function Form() {
  const [ formStatus, provide ] = useFormProvider();
  
  return <form action={action}>
    <FormStatus provide={provide} />
    {/* ... */}
    <button type="submit" disabled={formStatus.pending} />
  </form>
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
isPromise(new Promise(() => {})) // true
isPromise(() => {}) // false
```