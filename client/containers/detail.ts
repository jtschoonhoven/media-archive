import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { FormikValues } from 'formik';

import { ArchiveDetail } from '../components';
import { getFileDetail, updateFileDetail } from '../actions/detail';
import { DetailsState, DetailsModel } from '../reducers/detail';
import { State } from '../types';
import { showEditableModal } from '../actions/modal';

export interface StateProps {
    detailState: DetailsState;
}

export interface DetailActions {
    getFileDetail: (id: number) => void;
    showEditableModal: (
        title: string,
        formikFormJsx: () => React.ReactElement<HTMLFormElement>,
        initialValues: FormikValues,
        validator: (values: FormikValues) => { [fieldName: string]: string },
        onConfirm: (FormikValues) => void,
    ) => void;
    updateFileDetail: (id: number, detailsModel: DetailsModel) => void;
}

export interface DispatchProps {
    actions: DetailActions;
}


function mapStateToProps(state: State): StateProps {
    return { detailState: state.detail };
}

function mapDispatchToProps(dispatch: Dispatch): DispatchProps {
    return {
        actions: {
            getFileDetail: (id) => {
                dispatch(getFileDetail(id, dispatch));
            },
            showEditableModal: (title, formikFormJsx, initialValues, validator, onConfirm) => {
                dispatch(
                    showEditableModal(
                        title,
                        formikFormJsx,
                        initialValues,
                        validator,
                        onConfirm,
                        dispatch,
                    ),
                );
            },
            updateFileDetail: (id: number, detailsModel: DetailsModel) => {
                dispatch(updateFileDetail(id, detailsModel, dispatch));
            },
        },
    };
}

const ArchiveDetailContainer = withRouter(
    connect<StateProps, DispatchProps, any>(mapStateToProps, mapDispatchToProps)(ArchiveDetail),
);

export default ArchiveDetailContainer;
