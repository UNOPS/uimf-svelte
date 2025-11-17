import { BindToOutput } from "./Handlers/BindToOutput";
import { SubmitForm } from "./Handlers/SubmitForm";

export const InputEventHandlerRegistry: Record<string, any> = {
    'bind-to-output': new BindToOutput(),
    'submit-form': new SubmitForm(),
};

