import type { IFormLinkData } from "$lib/Outputs/FormLink/IFormLinkData";
import type { UimfApp } from "../../App/UimfApp";
import type { IFormLinkAction } from "../IFormLinkAction";

export class GeneratePdfAction implements IFormLinkAction {
    async handle(formLink: IFormLinkData, inputFieldValues: any, app: UimfApp): Promise<void> {
        const pdfMake = (window as any).pdfMake;
        const pdfFactory = (window as any).legacy.generatePDFFactory;

        if (formLink.DocumentType === 'sales-order') {
            const response = await app.postForm('sales-order-confirmation-pdf', inputFieldValues, null);
            pdfMake
                .createPdf(pdfFactory.salesOrderConfirmation(response.Confirmation))
                .download(formLink.Filename);
        } else {
            const result = await app.getApi(formLink.Form);
            switch (formLink.DocumentType) {
                case 'purchase-order':
                    pdfMake
                        .createPdf(pdfFactory.purchaseOrder(result))
                        .download(formLink.Filename);
                    break;
                case 'proforma-invoice':
                    pdfMake
                        .createPdf(pdfFactory.pfi(result, "PROFORMA INVOICE"))
                        .download(formLink.Filename);
                    break;
                case 'quotation':
                    pdfMake
                        .createPdf(pdfFactory.quotation(result))
                        .download(formLink.Filename);
                    break;
                case 'final-invoice':
                    const filename =
                        'UN Web Buy Plus FinalInvoice - ' + result.Id + ' - ' + result.CaseNumber + '.pdf';
                    pdfMake
                        .createPdf(pdfFactory.pfi(result, 'FINAL INVOICE'))
                        .download(filename);
                    break;
                case 'quotation-final-invoices':
                    result.forEach(function (invoice: any) {
                        const filename = 'UN Web Buy Plus FinalInvoice - ' + invoice.Id + ' - ' + invoice.CaseNumber + '.pdf';
                        pdfMake
                            .createPdf(pdfFactory.pfi(invoice, 'FINAL INVOICE'))
                            .download(filename);
                    });
                    break;
                default:
                    throw 'Unsupported document type: ' + formLink.DocumentType + '.';
            }
        }
    }
}

