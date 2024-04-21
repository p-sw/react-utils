import {
  Dispatch,
  ReactNode,
  SetStateAction,
  useEffect,
  useMemo,
  useState,
} from "react";

export type MapComponent<A> = (props: {
  item: A;
  unsync: boolean;
}) => ReactNode;

type Entry<A> = [string | number, A];

interface MapProps<A> {
  array: Entry<A>[];
  sync?: Dispatch<SetStateAction<A[]>>;
  onInsert?: (
    index: number,
    item: Entry<A>,
    state: [Entry<A>[], Dispatch<SetStateAction<Entry<A>[]>>],
    add: (
      index: number,
      item: Entry<A>,
      state: [Entry<A>[], Dispatch<SetStateAction<Entry<A>[]>>]
    ) => void
  ) => void;
  onDelete?: (
    index: number,
    state: [Entry<A>[], Dispatch<SetStateAction<Entry<A>[]>>],
    del: (
      index: number,
      state: [Entry<A>[], Dispatch<SetStateAction<Entry<A>[]>>]
    ) => void
  ) => void;
  children: MapComponent<A>;
}

export function Map<A>({
  array,
  sync,
  onInsert,
  onDelete,
  children,
}: MapProps<A>) {
  const [state, setState] = useState(array);
  const keys = useMemo(() => state.map(([key]) => key), [state]);
  const values = useMemo(() => state.map(([, value]) => value), [state]);
  const arrayKeys = useMemo(() => array.map(([key]) => key), [array]);

  useEffect(() => {
    const defaultAdd = (
      index: number,
      item: Entry<A>,
      state: [Entry<A>[], Dispatch<SetStateAction<Entry<A>[]>>]
    ) => {
      const [currentArray, setArray] = state;
      const newArray = [...currentArray];
      newArray.splice(index, 0, item);
      setArray(newArray);
    };

    const defaultDel = (
      index: number,
      state: [Entry<A>[], Dispatch<SetStateAction<Entry<A>[]>>]
    ) => {
      const [currentArray, setArray] = state;
      const newArray = [...currentArray];
      newArray.splice(index, 1);
      setArray(newArray);
    };

    let will: Record<number, { added?: Entry<A>; deleted?: Entry<A> }> = {};

    array.forEach(([key, value], index) => {
      if (keys.includes(key.toString())) {
        return;
      }

      will[index] = { added: [key, value] };
    });

    state.forEach(([key, value], index) => {
      if (arrayKeys.includes(key.toString())) {
        return;
      }

      will[index] = { ...will[index], deleted: [key, value] };
    });

    let testState = [...state];
    Object.entries(will).forEach(([index, { added, deleted }]) => {
      if (added) {
        testState.splice(Number(index), 0, added);
        (onInsert || defaultAdd)(
          parseInt(index),
          added,
          [testState, setState],
          defaultAdd
        );
      }

      if (deleted) {
        testState.splice(Number(index), 1);
        (onDelete || defaultDel)(
          parseInt(index),
          [testState, setState],
          defaultDel
        );
      }
    });
  }, [array]);

  useEffect(() => {
    if (sync) {
      sync(values);
    }
  }, [state, sync]);

  const Component = children;

  return (
    <>
      {state.map(([key, value]) => (
        <Component
          key={key}
          item={value}
          unsync={!arrayKeys.includes(key.toString())}
        />
      ))}
    </>
  );
}
