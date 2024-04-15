import {Dispatch, SetStateAction, useEffect} from "react";
import {useFormStatus, FormStatus} from "react-dom";

export function FormStatus({ provide }: { provide: Dispatch<SetStateAction<FormStatus>> }) {
  const formStatus = useFormStatus();

  useEffect(() => {
    provide(formStatus);
  }, [formStatus]);

  return <></>
}