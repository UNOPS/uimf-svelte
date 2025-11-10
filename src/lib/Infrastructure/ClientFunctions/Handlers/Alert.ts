import { IClientFunction } from "../IClientFunction";

export class Alert implements IClientFunction {
    name: string = "alert";

    handle(params?: any): Promise<any> {
        const props = params?.functionToRun?.CustomProperties ?? {};
        const actions = props.Actions ?? null;
        const isActionMandatory = props.IsActionMandatory === true;

        const dialogClosedPromise = Promise.resolve({
            Stop: props.IsError === true
        });

        const alertDialog = (window as any).legacy?.alertDialog;
        if (alertDialog != null && typeof alertDialog.showModal === "function") {
            return Promise.resolve(
                alertDialog.showModal(
                    null,
                    {
                        headerText: props.Header,
                        bodyText: props.Message,
                        closeButtonText:
                            actions != null
                                ? isActionMandatory
                                    ? null
                                    : "Cancel"
                                : "OK",
                        isConfirmDialog: false,
                        actions
                    }
                )
            )
                .then(() => dialogClosedPromise)
                .catch(() => dialogClosedPromise);
        }

        const alertInvoker = params?.uimfApp?.alert;
        if (typeof alertInvoker === "function") {
            return Promise.resolve(
                alertInvoker({
                    headerText: props.Header,
                    bodyText: props.Message,
                    actions,
                    closeButtonText:
                        actions != null
                            ? isActionMandatory ? null : "Cancel"
                            : "OK"
                })
            )
                .then(() => dialogClosedPromise)
                .catch(() => dialogClosedPromise);
        }

        return dialogClosedPromise;
    }
}
