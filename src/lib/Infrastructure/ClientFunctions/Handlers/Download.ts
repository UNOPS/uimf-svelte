import type { IClientFunction } from "../IClientFunction";

export class Download implements IClientFunction {
    name: string = "download";

    handle(params?: any): void {
        const file = params?.functionToRun?.CustomProperties?.Data;

        if (!file) {
            return;
        }

        try {
            const binString = atob(file.Data);
            const bytes = Uint8Array.from(binString, (m) => m.codePointAt(0) || 0);

            // Create blob and download
            const blob = new Blob([bytes], { type: file.ContentType });
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = file.Filename;

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("download: Failed to download file", error);
        }
    }
}





