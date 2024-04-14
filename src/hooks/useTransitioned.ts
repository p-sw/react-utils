import {useTransition} from "react";

export function useTransitioned<A extends any[]>(callback: (...args: A) => void): [boolean, (...args: A) => void] {
  const [ isIng, start ] = useTransition();

  return [
    isIng,
    (...args: A) => {
      start(() => {
        callback(...args)
      })
    }
  ]
}