import { FilesState } from './reducers/files';

export interface Action {
    readonly type: string;
    readonly payload: { [key: string]: any }; // tslint:disable-line no-any (payload varies)
    readonly error?: boolean;
    readonly meta?: object;
}

export interface DetailsState {
    readonly isFetching: boolean;
    readonly fileId: number;
    readonly errors: ReadonlyArray<string>;
    readonly details: {
        readonly title: string;
        readonly description: string;
        readonly filename: string;
        readonly path: string;
        readonly type: string;
        readonly url: string;
        readonly tags: string;
        readonly uploadStatus: string;
        readonly extension: string;
    };
}

export interface State {
    readonly detail?: DetailsState;
    readonly files?: FilesState;
    readonly modal?: { [propName: string]: string };
    readonly search?: { [propName: string]: string };
    readonly uploads?: { [propName: string]: string };
    readonly user?: { [propName: string]: string };
}

export interface Window {
    readonly __REDUX_DEVTOOLS_EXTENSION__?: () => void;
    readonly INITIAL_STATE: State;
    [propName: string]: any; // tslint:disable-line no-any (window is impossible to type)
}
