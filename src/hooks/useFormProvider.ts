import { FormStatus } from "react-dom";
import { Dispatch, SetStateAction, useState } from "react";

export function useFormProvider(): [FormStatus, Dispatch<SetStateAction<FormStatus>>] {
  return useState<FormStatus>({ pending: false, data: null, action: null, method: null });
}