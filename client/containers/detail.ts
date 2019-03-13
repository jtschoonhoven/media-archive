import { Dispatch } from 'redux';
import { connect, MapStateToPropsParam, MergeProps } from 'react-redux';
import { withRouter } from 'react-router';

import { ArchiveDetail } from '../components';
import { getFileDetail } from '../actions/detail';
import { DetailsState } from '../reducers/detail';
import { Props } from '../components/detail/detail';
import { State } from '../types';

export interface StateProps {
    detailState: DetailsState;
}

export interface DetailActions {
    getFileDetail: (id: number) => void;
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
        },
    };
}

const ArchiveDetailContainer = withRouter(
    connect<StateProps, DispatchProps, any>(mapStateToProps, mapDispatchToProps)(ArchiveDetail),
);

export default ArchiveDetailContainer;
