import { useState, useTransition, useEffect, Dispatch, SetStateAction, useRef } from "react";
import { isPromise } from "../utils";

type FLoader<R> = () => R

interface UseLoadedStateOptions<K extends boolean> {
  keepPrevOnLoad?: K;
  preventBurstLoad?: boolean;
  processQueue?: boolean;
}

type PartialUseLoadedStateOptions<K extends boolean> = Partial<UseLoadedStateOptions<K>>

const defaultOption: UseLoadedStateOptions<true> = {
  keepPrevOnLoad: true,
  preventBurstLoad: true,
  processQueue: true,
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
    processQueue: (opt?.processQueue ?? defaultOption.processQueue),
  } as Required<UseLoadedStateOptions<K>>;

  const [state, setState] = useState<Awaited<R> | undefined>(undefined);
  const [isLoading, startLoad] = useTransition();
  const loadQueue = useRef<(() => void)[]>([]);

  function loadState() {
    if (!defaultedOpt.keepPrevOnLoad)
      setState(undefined);

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

  function queueProvider() {
    if (defaultedOpt.preventBurstLoad && isLoading) {
      if (defaultedOpt.processQueue) {
        loadQueue.current.push(loadState);
      }
    } else if (defaultedOpt.processQueue && loadQueue.current.length > 0) {
      loadQueue.current.push(loadState);
    } else {
      loadState();
    }
  }

  useEffect(() => {
    queueProvider();
  }, deps);

  useEffect(() => {
    /* QueueConsumer */
    if (defaultedOpt.processQueue && loadQueue.current.length > 0 && !isLoading) {
      const nextLoad = loadQueue.current.shift();
      if (nextLoad) nextLoad();
    }
  }, [loadQueue.current.length, isLoading])

  if (defaultedOpt.keepPrevOnLoad) {
    if (isLoading || !state) {
      return [
        true,
        undefined,
        queueProvider,
        setState,
      ]
    } else {
      return [
        false,
        state,
        queueProvider,
        setState,
      ]
    }
  } else {
    return [
      isLoading,
      state,
      queueProvider,
      setState,
    ] as LoadedStateReturns<Awaited<R>, false>
  }
}
