export interface Action {
    readonly type: string;
    readonly payload: { [key: string]: any };
    readonly error?: boolean;
    readonly meta?: object;
}
