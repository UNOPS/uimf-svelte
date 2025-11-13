import type { IFormLinkData } from "$lib/Outputs/FormLink/IFormLinkData";
import type { UimfApp } from "../../App/UimfApp";
import type { IFormLinkAction } from "../IFormLinkAction";

type LegacyPdfFactory = {
    salesOrderConfirmation: (confirmation: any) => any;
    purchaseOrder: (purchaseOrder: any) => any;
    pfi: (invoice: any, label: string) => any;
    quotation: (quotation: any) => any;
};

type LegacyPdfMake = {
    createPdf: (definition: any) => {
        download: (filename?: string) => void;
    };
};

export class GeneratePdfAction implements IFormLinkAction {
    async handle(formLink: IFormLinkData, inputFieldValues: any, app: UimfApp): Promise<void> {
        const pdfMake: LegacyPdfMake | undefined = (window as any)?.pdfMake;
        if (!pdfMake) {
            console.error("[GeneratePdfAction] pdfMake library not available");
            return;
        }

        const pdfFactory: LegacyPdfFactory | undefined = (window as any)?.legacy?.generatePDFFactory;
        if (!pdfFactory) {
            console.error("[GeneratePdfAction] generatePDFFactory not available");
            return;
        }

        try {
            switch (formLink.DocumentType) {
                case "sales-order": {
                    const response = await app.postForm<any>(
                        "sales-order-confirmation-pdf",
                        inputFieldValues,
                        null
                    );
                    const filename = formLink.Filename || "document.pdf";
                    pdfMake.createPdf(pdfFactory.salesOrderConfirmation(response.Confirmation)).download(filename);
                    break;
                }
                case "purchase-order": {
                    const result = await this.#getFormData(app, formLink);
                    const filename = formLink.Filename || "document.pdf";
                    pdfMake.createPdf(pdfFactory.purchaseOrder(result)).download(filename);
                    break;
                }
                case "proforma-invoice": {
                    const result = await this.#getFormData(app, formLink);
                    const filename = formLink.Filename || "document.pdf";
                    pdfMake.createPdf(pdfFactory.pfi(result, "PROFORMA INVOICE")).download(filename);
                    break;
                }
                case "quotation": {
                    const result = await this.#getFormData(app, formLink);
                    const filename = formLink.Filename || "document.pdf";
                    pdfMake.createPdf(pdfFactory.quotation(result)).download(filename);
                    break;
                }
                case "final-invoice": {
                    const result = await this.#getFormData(app, formLink);
                    const name = `UN Web Buy Plus FinalInvoice - ${result.Id} - ${result.CaseNumber}.pdf`;
                    pdfMake.createPdf(pdfFactory.pfi(result, "FINAL INVOICE")).download(name);
                    break;
                }
                case "quotation-final-invoices": {
                    const results = await this.#getFormData(app, formLink);
                    if (!Array.isArray(results)) {
                        throw new Error("Expected an array of invoices for quotation-final-invoices");
                    }
                    results.forEach((invoice: any) => {
                        const name =
                            `UN Web Buy Plus FinalInvoice - ${invoice.Id} - ${invoice.CaseNumber}.pdf`;
                        pdfMake.createPdf(pdfFactory.pfi(invoice, "FINAL INVOICE")).download(name);
                    });
                    break;
                }
                default:
                    throw new Error(`Unsupported document type: ${formLink.DocumentType}.`);
            }
        } catch (error) {
            console.error(`[GeneratePdfAction] Failed to generate PDF for ${formLink.DocumentType}`, error);
        }
    }

    async #getFormData(app: UimfApp, formLink: IFormLinkData): Promise<any> {
        if (!formLink.Form) {
            throw new Error(
                `[GeneratePdfAction] Form link for action "${formLink.Action}" is missing the Form property.`
            );
        }
        return app.getApi(formLink.Form);
    }
}

