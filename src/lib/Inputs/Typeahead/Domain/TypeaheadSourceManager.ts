import { FormInstance } from "../../../Infrastructure/FormController";
import type { IOption } from "./IOption";
import type { ITypeaheadConfig } from "./ITypeaheadConfig";
import type { IMultiselectValue, ITypeaheadValue } from "./ITypeaheadValue";

interface IResponse {
    Items: any[];
    TotalItemCount: number;
}

export class TypeaheadSourceManager {
    static #requestPromises: Record<string, Promise<any>> = {};
    #config: ITypeaheadConfig;
    #inlineItems: IOption[] | null;
    #form: FormInstance;

    constructor(config: ITypeaheadConfig, form: FormInstance) {
        if (form == null) {
            throw "Form is required to retrieve parameters, but was not provided.";
        }

        this.#form = form;
        this.#config = config;

        this.#inlineItems = Array.isArray(config.Items)
            ? TypeaheadSourceManager.augmentItems(config.Items)
            : null;
    }

    async #generateKey(query: ITypeaheadValue | IMultiselectValue | string | null): Promise<string> {
        let cachePrefix = `${this.#config.Source}`;

        if (this.#config.Parameters != null) {
            let promises = this.#config.Parameters.map((p) => {
                switch (p.SourceType) {
                    case 'response':
                        cachePrefix += `-${p.Parameter}=${this.#form.response[p.Source]}`;
                        return Promise.resolve();
                    case 'request':
                        return this.#form.inputs[p.Source]
                            .getValue()
                            .then((value) => (cachePrefix += `-${p.Parameter}=${value}`));
                }
            });

            await Promise.all(promises);
        }

        if (query == null) {
            // Key for all data.
            return `${cachePrefix}`;
        }

        let cacheKey: string = '';

        if (typeof query === 'object') {
            if ('Value' in query) {
                cacheKey = query.Value;
            } else if ('Items' in query) {
                cacheKey = query.Items.join('-');
            } else {
                throw new Error('Invalid query type.');
            }
        } else if (typeof query === 'string') {
            cacheKey = query;
        }

        return `${cachePrefix}-${cacheKey}`;
    }

    async getOptionsAndFilter(query: ITypeaheadValue | IMultiselectValue | string): Promise<IOption[]> {
        return this.#getOptions(query).then(data => {
            const visibleOptions = data.Items.filter((t) =>
                this.#form.app.hasPermission(t.RequiredPermission)
            );

            const filterById = typeof query !== 'string';

            if (filterById) {
                return visibleOptions;
            }

            const filterInLowercase = query.toLocaleLowerCase();

            return visibleOptions.filter((t) => t.SearchText?.includes(filterInLowercase) == true);
        });
    }

    async #getOptions(query: ITypeaheadValue | IMultiselectValue | string | null): Promise<IResponse> {
        if (this.#inlineItems != null) {
            return Promise.resolve({
                Items: this.#inlineItems,
                TotalItemCount: this.#inlineItems.length
            });
        }

        if (query != null) {
            // Retrieve all data without filtering by `query`.
            const allData = await this.#getOptions(null);

            // If the result includes entire dataset then don't make 
            // query-specific requests and just return this dataset.
            if (allData.TotalItemCount === allData.Items.length) {
                return allData;
            }
        }

        const key = await this.#generateKey(query);
        const cachedData = this.#getFromCache(key);

        if (cachedData) {
            return cachedData;
        }

        if (!TypeaheadSourceManager.#requestPromises[key]) {
            TypeaheadSourceManager.#requestPromises[key] = this.#makeHttpRequest(query)
                .then(data => {
                    this.#storeInCache(key, data);
                    delete TypeaheadSourceManager.#requestPromises[key];
                    return data;
                });
        }

        return TypeaheadSourceManager.#requestPromises[key];
    }

    #getFromCache(key: string): IResponse | null {
        const item = sessionStorage.getItem(key);
        if (item) {
            const { data, timestamp } = JSON.parse(item);
            if (Date.now() - timestamp < 30_000) {
                return data;
            }
        }

        return null;
    }

    #storeInCache(key: string, data: IResponse): void {
        const item = {
            data,
            timestamp: Date.now()
        };
        sessionStorage.setItem(key, JSON.stringify(item));
    }

    async #makeHttpRequest(query: ITypeaheadValue | IMultiselectValue | string | null): Promise<IResponse> {
        var postData: { [key: string]: any } = {};

        if (query != null) {
            if (typeof query === 'string') {
                postData = { Query: query };
            } else if (typeof query === 'object') {
                if ('Items' in query) {
                    postData = { Ids: { Items: query.Items?.length > 0 ? query.Items : [] } };
                } else if ('Value' in query) {
                    postData = { Ids: { Items: query.Value != null ? [query.Value] : [] } };
                }
            }
        }

        if (this.#config.Parameters != null) {
            let promises = this.#config.Parameters.map((p) => {
                switch (p.SourceType) {
                    case 'response':
                        postData[p.Parameter] = this.#form.response[p.Source];
                        return Promise.resolve();
                    case 'request':
                        return this.#form.inputs[p.Source]
                            .getValue()
                            .then((value) => (postData[p.Parameter] = value));
                }
            });

            await Promise.all(promises);
        }

        return (this.#form.app
            .postForm(this.#config.Source!, postData, null)
            .then((t: any) => {
                return {
                    Items: TypeaheadSourceManager.augmentItems(t.Items),
                    TotalItemCount: t.TotalItemCount
                };
            }));
    }

    static augmentItems(items: any[]): IOption[] {
        if (items == null) {
            return [];
        }

        return items.map((c) => {
            if (c.SearchText == null || c.SearchText.length == 0) {
                c.SearchText = c.Label + ' ' + c.Value + ' ' + (c.Description ?? '');
            }

            // Always search in lowercase.
            c.SearchText = c.SearchText.toLocaleLowerCase();

            return c as IOption;
        });
    }
}