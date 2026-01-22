import type { ITagOption, ITagValue } from './tag-types';

export const toTagOptions = (options: string[] | ITagOption[]): ITagOption[] => {
  if (!options) return [];
  if (typeof options[0] === 'string') {
    return (options as string[]).map((v) => ({ Value: v, Label: v, SearchText: v }));
  }
  return options as ITagOption[];
};

export const toTagValue = (items: string[] | ITagValue): ITagValue => {
  if (Array.isArray(items)) {
    return { Items: items };
  }
  return items;
};
