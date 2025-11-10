import { IClientFunction } from "../IClientFunction";

export class SendPdfByEmail implements IClientFunction {
    name: string = "send-pdf-by-email";

    async handle(params: any): Promise<void> {
        const props = params.functionToRun.CustomProperties;

        const pdfMake = (window as any).pdfMake;
        if (!pdfMake) {
            console.error("[SendPdfByEmail] Make sure pdfMake is included in your page");
            return;
        }

        const pdfFactory = (window as any).legacy.generatePDFFactory;
        if (!pdfFactory) {
            console.error("[SendPdfByEmail] Make sure: window.generatePDFFactory = $injector.get('generatePDFFactory'); is running");
            return;
        }

        const uimfApp = params?.uimfApp;
        if (!uimfApp) {
            console.error("[SendPdfByEmail] This should be passed by UimfApp.runClientFunctions()");
            return;
        }

        const data: {
            EmailAttachmentEntityType: string;
            EmailAttachmentFiles: Array<{ FileContent: string; EntityId: any }>;
        } = {
            EmailAttachmentEntityType: props.Type,
            EmailAttachmentFiles: []
        };

        const pdfs = props.Pdf;
        const loopPromises: Promise<void>[] = [];

        pdfs.forEach((i: any) => {
            const promise = (async () => {
                const name = data.EmailAttachmentEntityType === 'FinalInvoice' ? 'FINAL INVOICE' : null;

                const response = await uimfApp.getApi(i.Url);

                await new Promise<void>((resolve) => {
                    pdfMake.createPdf(pdfFactory.pfi(response, name))
                        .getBase64((encodedString: string) => {
                            data.EmailAttachmentFiles.push({
                                FileContent: encodedString,
                                EntityId: i.Id
                            });
                            resolve();
                        });
                });
            })();

            loopPromises.push(promise);
        });

        await Promise.all(loopPromises);

        if (data.EmailAttachmentFiles.length > 0) {

            const token = localStorage['Token'];
            const headers: any = {
                'Content-Type': 'application/json',
                'uimf': 'true'
            };
            if (token) {
                headers.Authorization = 'Bearer ' + token;
            }

            await fetch('/api/Email/AttachFileToEmail', {
                method: 'POST',
                headers: headers,
                credentials: 'include',
                body: JSON.stringify(data)
            });

            await uimfApp.alert({
                bodyText: params.SuccessMessage || "Email sent successfully",
                closeButtonText: "OK"
            });
        }
    }
}



