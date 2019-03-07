import { DetailsState } from './reducers/detail';
import { FilesState } from './reducers/files';
import { SearchState } from './reducers/search';
import { UploadsState } from './reducers/uploads';
import { ModalState } from './reducers/modal';
import { UserState } from './reducers/user';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface Dict { [key: string]: any }

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
