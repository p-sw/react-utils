export function isPromise(f: (...p: any[]) => any): boolean {
  return !!(f.constructor.name === 'AsyncFunction' || (typeof f === 'object' && (<{
    then?: () => void
  }>f)["then"] && typeof (<{ then?: () => void }>f)["then"] === 'function'))
}