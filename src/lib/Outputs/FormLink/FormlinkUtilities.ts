import { OutputController } from "../../Infrastructure/OutputController";
import { type IOutputFieldMetadata } from "../../Infrastructure/uimf";
import { FormlinkController } from "./FormLinkController";
import { type IFormLinkData } from "./IFormLinkData";

interface IOptions {
    data: IFormLinkData;
    parent: OutputController<any, any>;
    metadata?: IOutputFieldMetadata | null;
}

export class FormlinkUtilities {
    public static createFormlink({ parent, data, metadata }: IOptions): FormlinkController {

        return new FormlinkController({
            metadata: metadata ?? {
                OrderIndex: 0,
                Hidden: false,
                Id: crypto.randomUUID(),
                Component: {
                    Type: 'form-link',
                    Configuration: null
                }
            } as IOutputFieldMetadata,
            data: data,
            parent: parent,
            app: parent.app,
            form: parent.form,
        });
    }
}