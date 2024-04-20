import { FormStatus } from "react-dom";
import { Dispatch, SetStateAction, useState, useActionState } from "react";

export function useFormProvider(): [FormStatus, Dispatch<SetStateAction<FormStatus>>];
export function useFormProvider<AP, AR>(action: (e: AP, p: AR | null) => Promise<AR>): [FormStatus, Dispatch<SetStateAction<FormStatus>>, (e: FormData) => void, AR | null];
export function useFormProvider<AP, AR>(action?: (e: AP, p: AR | null) => Promise<AR>): [FormStatus, Dispatch<SetStateAction<FormStatus>>, ((e: FormData) => void)?, (AR | null)?] {
  const [formStatus, setFormStatus] = useState<FormStatus>({ pending: false, data: null, action: null, method: null });
  const [state, formAction] = useActionState<AR | null, FormData>(async (prev, form) => {
    const n = Object.fromEntries(form) as AP;
    return action?.(n, prev) ?? null;
  }, null)

  if (action) {
    return [formStatus, setFormStatus, formAction, state];
  } else {
    return [formStatus, setFormStatus];
  }
}

