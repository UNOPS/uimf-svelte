export interface IComponent<T = any | null | undefined> {
    Type: string;
    Configuration: T;
}
