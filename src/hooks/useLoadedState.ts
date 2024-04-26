import { useState, useTransition, useEffect, Dispatch, SetStateAction } from "react";
import { isPromise } from "../utils";

type FLoader<R> = () => R

interface UseLoadedStateOptions<K extends boolean> {
  keepPrevOnLoad?: K;
  preventBurstLoad?: boolean;
}

type PartialUseLoadedStateOptions<K extends boolean> = Partial<UseLoadedStateOptions<K>>

const defaultOption: UseLoadedStateOptions<true> = {
  keepPrevOnLoad: true,
  preventBurstLoad: true,
}

type LoadedStateReturns<R, K extends boolean> =
  K extends true
  ? [
    boolean,
    R | undefined,
    () => void,
    Dispatch<SetStateAction<R | undefined>>
  ]
  :
  | [
    true,
    undefined,
    () => void,
    Dispatch<SetStateAction<R | undefined>>
  ]
  | [
    false,
    R,
    () => void,
    Dispatch<SetStateAction<R | undefined>>
  ]

export function useLoadedState<R, K extends boolean = true>(loader: FLoader<R>, deps: React.DependencyList, opt?: PartialUseLoadedStateOptions<K>): LoadedStateReturns<Awaited<R>, K> {
  const defaultedOpt = {
    keepPrevOnLoad: (opt?.keepPrevOnLoad ?? defaultOption.keepPrevOnLoad),
    preventBurstLoad: (opt?.preventBurstLoad ?? defaultOption.preventBurstLoad),
  } as Required<UseLoadedStateOptions<K>>;

  const [state, setState] = useState<Awaited<R> | undefined>(undefined);
  const [isLoading, startLoad] = useTransition();

  function loadState() {
    if (!defaultedOpt.keepPrevOnLoad)
      setState(undefined);
    if (defaultedOpt.preventBurstLoad && isLoading)
      return;

    startLoad(() => {
      const result: R = loader()
      if (isPromise(loader)) {
        (<{ then: (c: (p: R) => void) => void }>result)['then']((p: R) => {
          setState(p as Awaited<R>);
        })
      } else {
        setState(result as Awaited<R>);
      }
    })
  }

  useEffect(() => {
    loadState();
  }, deps);

  if (defaultedOpt.keepPrevOnLoad) {
    if (isLoading || !state) {
      return [
        true,
        undefined,
        loadState,
        setState,
      ]
    } else {
      return [
        false,
        state,
        loadState,
        setState,
      ]
    }
  } else {
    return [
      isLoading,
      state,
      loadState,
      setState,
    ] as LoadedStateReturns<Awaited<R>, false>
  }
}
