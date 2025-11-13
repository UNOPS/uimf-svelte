import type { FormResponse } from '../../../Infrastructure/App/FormResponse';
import { ActionHandler } from '../ActionHandler';
import type { ActionButtonData, ActionButtonParameters } from '../ActionHandler';

interface GeneratePdfArgs extends ActionButtonParameters {
	DocumentType: string;
	Filename: string | null;
	Form: string;
	InputFieldValues?: Record<string, any> | null;
}

interface SalesConfirmationResponse extends FormResponse {
	Confirmation: any;
}

export class GeneratePdfHandler extends ActionHandler {
	public readonly renderAs = 'button' as const;
	public readonly action: string = 'generate-pdf';

	async execute(data: ActionButtonData): Promise<void> {
		const params = data.Parameters as GeneratePdfArgs;


		const pdfMake = (window as any).pdfMake;
		if (!pdfMake) {
			console.error('[GeneratePdfHandler] pdfMake library not available');
			return;
		}

		const pdfFactory = (window as any).legacy.generatePDFFactory;
		if (!pdfFactory) {
			console.error('[GeneratePdfHandler] generatePDFFactory not available');
			return;
		}

		if (params.DocumentType === 'sales-order') {
			const inputFieldValues = params.InputFieldValues ?? {};
			const response = await this.controller.app.postForm<SalesConfirmationResponse>('sales-order-confirmation-pdf', inputFieldValues, null);

			pdfMake
				.createPdf(pdfFactory.salesOrderConfirmation(response.Confirmation))
				.download(params.Filename);
		} else {
			const result = await this.controller.app.getApi(params.Form);
			switch (params.DocumentType) {
				case 'purchase-order':
					pdfMake
						.createPdf(pdfFactory.purchaseOrder(result))
						.download(params.Filename);
					break;
				case 'proforma-invoice':
					pdfMake
						.createPdf(pdfFactory.pfi(result, "PROFORMA INVOICE"))
						.download(params.Filename);
					break;
				case 'quotation':
					pdfMake
						.createPdf(pdfFactory.quotation(result))
						.download(params.Filename);
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
					throw new Error('Unsupported document type: ' + params.DocumentType + '.');
			}
		}
	}
}

