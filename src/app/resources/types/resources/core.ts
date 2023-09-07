export type u64 = number;

export interface ISend {
    data: Object; resolve: (value: any) => void
}

export interface IToResolve {
    data: Object; resolve: (value: any) => void
};