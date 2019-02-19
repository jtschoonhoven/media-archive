import * as React from 'react';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import { ArchiveFiles } from '../components';
import { load } from '../actions/files';
import { upload } from '../actions/uploads';
import { showConfirmModal, showTextModal } from '../actions/modal';
import { FilesState } from '../reducers/files';
import { UploadsState } from '../reducers/uploads';

export interface StateProps {
    filesState: FilesState;
    uploadsState: UploadsState;
}


function mapStateToProps(state) {
    return {
        filesState: state.files,
        uploadsState: state.uploads,
    };
}

export interface FilesActions {
    load: (path: string) => void;
    upload: (path: string, fileList: File[]) => void;
    showConfirmModal: (
        title: string,
        message: React.ReactElement<any>,
        onConfirm: (value: string) => void,
    ) => void;
    showTextModal: (
        title: string,
        message: React.ReactElement<any>,
        placeholder: string,
        onConfirm: (value: string) => void,
        validator: (value: string) => void,
    ) => void;
}

export interface DispatchProps {
    actions: FilesActions;
}

function mapDispatchToProps(dispatch: Dispatch): { actions: FilesActions } {
    return {
        actions: {
            // load directory contents
            load: (path: string) => {
                dispatch(load(path, dispatch));
            },
            upload: (path: string, fileList: File[]) => {
                dispatch(upload(path, fileList, dispatch));
            },
            showConfirmModal: (
                title: string,
                message: React.ReactElement<any>,
                onConfirm: (string) => void,
            ) => {
                dispatch(showConfirmModal(title, message, onConfirm, dispatch));
            },
            showTextModal: (
                title: string,
                message: React.ReactElement<any>,
                placeholder: string,
                onConfirm: (string) => void,
                validator: (string) => void,
            ) => {
                dispatch(
                    showTextModal(title, message, placeholder, onConfirm, validator, dispatch),
                );
            },
        },
    };
}

const ArchiveFilesContainer = withRouter(
    connect<StateProps, DispatchProps, any>(mapStateToProps, mapDispatchToProps)(ArchiveFiles),
);


export default ArchiveFilesContainer;
