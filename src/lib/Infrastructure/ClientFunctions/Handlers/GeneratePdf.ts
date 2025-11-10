import { IClientFunction } from "../IClientFunction";

export class GeneratePdf implements IClientFunction {
    name: string = "generate-pdf";

    handle(params?: any): void {
        const props = params?.functionToRun?.CustomProperties;

        if (!props) {
            console.error("[GeneratePdf] No CustomProperties in params");
            return;
        }

        const pdfMake = (window as any).pdfMake;
        if (!pdfMake) {
            console.error("[GeneratePdf] pdfMake library not available");
            return;
        }

        const pdfFactory = (window as any).legacy.generatePDFFactory;
        if (!pdfFactory) {
            console.error("[GeneratePdf] generatePDFFactory not available");
            return;
        }

        switch (props.Type) {
            case 'sales-order':
                pdfMake
                    .createPdf(pdfFactory.salesOrderConfirmation(props.Data))
                    .download(props.Filename);
                break;
            case 'purchase-order':
                pdfMake
                    .createPdf(pdfFactory.purchaseOrder(props.Data))
                    .download(props.Filename);
                break;
            case 'proforma-invoice':
                pdfMake
                    .createPdf(pdfFactory.pfi(props.Data, "PROFORMA INVOICE"))
                    .download(props.Filename);
                break;
            case 'quotation':
                pdfMake
                    .createPdf(pdfFactory.quotation(props.Data))
                    .download(props.Filename);
                break;
            case 'final-invoice':
                pdfMake
                    .createPdf(pdfFactory.pfi(props.Data, 'FINAL INVOICE'))
                    .download(props.Filename);
                break;
            default:
                throw new Error('Unsupported document type: ' + props.Type + '.');
        }
    }
}



