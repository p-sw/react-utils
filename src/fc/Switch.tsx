import { ReactNode } from "react";

export function Switch<T extends string>({
  value,
  ...chances
}: { value: T } & { [k in T]: ReactNode }) {
  return <>{(chances as unknown as { [k in T]: ReactNode })[value]}</>;
}
