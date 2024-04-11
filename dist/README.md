# React Utils

작고 간단한 유틸리티 패키지

## Index

* Hooks
  * useLoadedState
* Functional Components
* Utility Functions

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
> keepPrevOnLoad가 true일 때는 isLoading의 여부와 상관 없이 state는 `Result | undefined`.'


## Functional Components

## Utility Functions