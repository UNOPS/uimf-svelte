import { Field } from "../../../Infrastructure/Fields/Field";
import type { FormInstance } from "../../../Infrastructure/FormInstance";
import { ITypeaheadMetadata } from "../Typeahead.svelte";
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
    #cachedItems: IOption[] = [];
    #form: FormInstance;
    #field: Field<ITypeaheadMetadata>;

    constructor(config: ITypeaheadConfig, field: Field<ITypeaheadMetadata>) {
        if (field.form == null) {
            throw "Form is required to retrieve parameters, but was not provided.";
        }

        this.#field = field;
        this.#form = field.form;
        this.#config = config;

        this.#inlineItems = Array.isArray(config.Items)
            ? TypeaheadSourceManager.augmentItems(config.Items)
            : null;
    }

    async #generateKey(query: ITypeaheadValue | IMultiselectValue | string | null): Promise<string> {
        let cachePrefix = `${this.#config.Source}`;

        let parameters = await this.#getConfigs();

        for (const key in parameters) {
            const valueAsString = JSON.stringify(parameters[key]);
            cachePrefix += `-${key}=${valueAsString}`;
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

    async getOptionsAndFilter(query: ITypeaheadValue | IMultiselectValue | string | null): Promise<IOption[]> {
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

    static #isMultiselectValue(object: any): object is IMultiselectValue {
        return object != null && object.hasOwnProperty('Items');
    }

    static #isTypeaheadValue(object: any): object is ITypeaheadValue {
        return object != null && object.hasOwnProperty('Value');
    }


    async #getOptions(query: ITypeaheadValue | IMultiselectValue | string | null): Promise<IResponse> {
        if (this.#inlineItems != null) {
            return Promise.resolve({
                Items: this.#inlineItems,
                TotalItemCount: this.#inlineItems.length
            });
        }

        let effectiveQuery = query;

        if (effectiveQuery === '') {
            effectiveQuery = null;
        }

        if (effectiveQuery != null) {
            // Retrieve all data without filtering by `query`. It is assumed
            // that the endpoint should query entire dataset if the query is null.
            const allData = await this.#getOptions(null);

            // If the result includes entire dataset then don't make 
            // query-specific requests and just return this dataset.
            if (allData.TotalItemCount > 0 &&
                allData.TotalItemCount === allData.Items.length) {
                return allData;
            }
        }

        const key = await this.#generateKey(effectiveQuery);
        const cachedData = this.#getFromCache(key);

        if (cachedData) {
            return cachedData;
        }

        if (!TypeaheadSourceManager.#requestPromises[key]) {
            const cachedItems: IOption[] = [];

            if (TypeaheadSourceManager.#isMultiselectValue(query)) {
                effectiveQuery = { Items: [] };

                for (const item of query.Items) {
                    const cachedItem = this.#getCachedItem(item);

                    if (cachedItem) {
                        cachedItems.push(cachedItem);
                    }
                    else {
                        effectiveQuery.Items.push(item);
                    }
                }

                if (effectiveQuery.Items.length === 0) {
                    return {
                        Items: cachedItems,
                        TotalItemCount: cachedItems.length
                    }
                }
            } else if (TypeaheadSourceManager.#isTypeaheadValue(query)) {
                const cachedItem = this.#getCachedItem(query.Value);

                if (cachedItem) {
                    return {
                        Items: [cachedItem],
                        TotalItemCount: 1
                    }
                }
            }

            TypeaheadSourceManager.#requestPromises[key] = this.#makeHttpRequest(effectiveQuery)
                .then(data => {
                    this.#storeInCache(key, data);
                    delete TypeaheadSourceManager.#requestPromises[key];

                    for (const item of data.Items) {
                        this.#cachedItems.push(item);
                    }

                    for (const cachedItem of cachedItems) {
                        data.Items.push(cachedItem);
                        data.TotalItemCount += 1;
                    }

                    return data;
                });
        }

        return TypeaheadSourceManager.#requestPromises[key];
    }

    #getCachedItem(value: any): IOption | null {
        const match = this.#cachedItems.find((t) => {
            return t.Value.toString() == value.toString();
        });

        return match ?? null;
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

        let params = await this.#getConfigs();

        for (const key in params) {
            postData[key] = params[key];
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

    async #getConfigs(): Promise<{ [key: string]: any }> {
        let postData: { [key: string]: any } = {};

        if (this.#config.Parameters != null) {
            let promises = this.#config.Parameters.map((p) => {
                switch (p.SourceType) {
                    case 'constant':
                        postData[p.Parameter] = p.Source;
                        return Promise.resolve();
                    case 'response':
                        postData[p.Parameter] = this.#form.response[p.Source]?.value;
                        return Promise.resolve();
                    case 'request':
                        return this.#form.inputs[p.Source]
                            .getValue()
                            .then((value) => (postData[p.Parameter] = value));
                    case 'path':
                        return this.#field
                            .getRelatedFieldByPath(p.Source)!
                            .getValue()
                            .then((value) => (postData[p.Parameter] = value));
                }
            });

            await Promise.all(promises);
        }

        return postData;
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