import {useState, useTransition} from "react";
import { isPromise } from "../utils";

type FLoader<R> = () => R

interface UseLoadedStateOptions<K extends boolean> {
  keepPrevOnLoad: K;
}

type PartialUseLoadedStateOptions<K extends boolean> = Partial<UseLoadedStateOptions<K>>

const defaultOption: UseLoadedStateOptions<true> = {
  keepPrevOnLoad: true,
}

type LoadedStateReturns<R, K extends boolean> = K extends true ? [boolean, R | undefined, () => void] : [true, undefined, () => void] | [false, R, () => void]

export function useLoadedState<R, K extends boolean = true>(loader: FLoader<R>, opt?: PartialUseLoadedStateOptions<K>): LoadedStateReturns<R, K> {
  const defaultedOpt = (opt ?? defaultOption) as UseLoadedStateOptions<K>;

  const [state, setState] = useState<R | undefined>(undefined);
  const [isLoading, startLoad] = useTransition();

  function loadState() {
    if (!defaultedOpt.keepPrevOnLoad)
      setState(undefined);
    startLoad(() => {
      const result: R = loader()
      if (isPromise(loader)) {
        (<{ then: (c: (p: R) => void) => void }>result)['then']((p: R) => {
          setState(p);
        })
      } else {
        setState(result);
      }
    })
  }

  return <LoadedStateReturns<R, K>>[
    isLoading,
    state,
    loadState
  ]
}
