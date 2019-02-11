import { DetailsState } from './reducers/detail';
import { FilesState } from './reducers/files';
import { SearchState } from './reducers/search';
import { UploadsState } from './reducers/uploads';
import { ModalState } from './reducers/modal';
import { UserState } from './reducers/user';

export type Dict = { [key: string]: any };

export interface Action<Payload = Dict, Meta = Dict> {
    readonly type: string;
    readonly payload: Payload | Error;
    readonly meta?: Meta;
    readonly error?: boolean;
}

export interface State {
    readonly detail: DetailsState;
    readonly files: FilesState;
    readonly modal: ModalState;
    readonly search: SearchState;
    readonly uploads: UploadsState;
    readonly user: UserState;
}

export interface Window {
    readonly __REDUX_DEVTOOLS_EXTENSION__?: () => void;
    readonly INITIAL_STATE: State;
    [propName: string]: any; // tslint:disable-line no-any (window is impossible to type)
}
