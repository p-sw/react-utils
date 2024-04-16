import {
  DetailedHTMLProps,
  DialogHTMLAttributes,
  ReactNode,
  useCallback,
  useRef,
} from "react";

type DialogProps = Omit<
  DetailedHTMLProps<DialogHTMLAttributes<HTMLDialogElement>, HTMLDialogElement>,
  "ref"
>;
type Actions = {
  close: () => void;
  show: () => void;
  showModal: () => void;
  showPopover: () => void;
  hidePopover: () => void;
  togglePopover: () => void;
};

export function useDialog(): [(props: DialogProps) => ReactNode, Actions] {
  const ref = useRef<HTMLDialogElement | null>(null);
  const dialog = useCallback((props: DialogProps) => {
    return <dialog ref={ref} {...props} />;
  }, []);

  return [
    dialog,
    {
      close: ref.current?.close ?? (() => {}),
      show: ref.current?.show ?? (() => {}),
      showModal: ref.current?.showModal ?? (() => {}),
      showPopover: ref.current?.showPopover ?? (() => {}),
      hidePopover: ref.current?.hidePopover ?? (() => {}),
      togglePopover: ref.current?.togglePopover ?? (() => {}),
    },
  ];
}
