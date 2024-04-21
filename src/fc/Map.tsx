import {
  Dispatch,
  ReactNode,
  SetStateAction,
  useEffect,
  useMemo,
  useState,
} from "react";

type Entry<A> = [string | number, A];

export type MapComponent<A> = (props: {
  item: A;
  unsync: boolean;
}) => ReactNode;

interface MapEvent<A> {
  index: number;
  state: [Entry<A>[], Dispatch<SetStateAction<Entry<A>[]>>];
  preventDefault: () => void;
  defaultPrevented: boolean;
}

type MapInsertDefaultEventHandler<A> = (index: number, item: Entry<A>) => void;
type MapDeleteDefaultEventHandler = (index: number) => void;

export interface MapInsertEvent<A> extends MapEvent<A> {
  item: Entry<A>;
  default: MapInsertDefaultEventHandler<A>;
}

export interface MapDeleteEvent<A> extends MapEvent<A> {
  default: MapDeleteDefaultEventHandler;
}

export type MapInsertEventHandler<A> = (e: MapInsertEvent<A>) => void;
export type MapDeleteEventHandler<A> = (e: MapDeleteEvent<A>) => void;

interface MapProps<A> {
  array: Entry<A>[];
  sync?: Dispatch<SetStateAction<A[]>>;
  onInsert?: MapInsertEventHandler<A>;
  onDelete?: MapDeleteEventHandler<A>;
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
    const defaultAdd: MapInsertDefaultEventHandler<A> = (
      index: number,
      item: Entry<A>
    ) => {
      const newArray = [...state];
      newArray.splice(index, 0, item);
      setState(newArray);
    };

    const defaultDel: MapDeleteDefaultEventHandler = (index: number) => {
      const newArray = [...state];
      newArray.splice(index, 1);
      setState(newArray);
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
        let defaultPrevented = false;
        testState.splice(Number(index), 0, added);
        onInsert?.({
          index: parseInt(index),
          state: [testState, setState],
          item: added,
          default: (index, item) => {
            defaultPrevented = true;
            defaultAdd(index, item);
          },
          preventDefault: () => {
            defaultPrevented = true;
          },
          defaultPrevented,
        });
      }

      if (deleted) {
        let defaultPrevented = false;
        testState.splice(Number(index), 1);
        onDelete?.({
          index: parseInt(index),
          state: [testState, setState],
          default: (index) => {
            defaultPrevented = true;
            defaultDel(index);
          },
          preventDefault: () => {
            defaultPrevented = true;
          },
          defaultPrevented,
        });
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
