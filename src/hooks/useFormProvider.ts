import { FormStatus } from "react-dom";
import { Dispatch, SetStateAction, useState } from "react";

export function useFormProvider(): [FormStatus, Dispatch<SetStateAction<FormStatus>>];
export function useFormProvider<AP, AR>(action: (e: AP) => Promise<AR>): [FormStatus, Dispatch<SetStateAction<FormStatus>>, (e: FormData) => Promise<AR>];
export function useFormProvider<AP, AR>(action?: (e: AP) => Promise<AR>): [FormStatus, Dispatch<SetStateAction<FormStatus>>, ((e: FormData) => Promise<AR>)?] {
  const [formStatus, setFormStatus] = useState<FormStatus>({ pending: false, data: null, action: null, method: null });
  const submitFunction = action ? async (e: FormData) => {
    return action(Object.fromEntries(e) as AP);
  } : undefined;

  return [formStatus, setFormStatus, submitFunction];
}