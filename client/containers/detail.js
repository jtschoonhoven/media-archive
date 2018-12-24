import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import { ArchiveDetail } from '../components';
import { getFileDetail } from '../actions/detail';


function mapStateToProps(state) {
    return state.detail || {};
}

function mapDispatchToProps(dispatch) {
    return {
        // fetch file details
        onGetFileDetail: (path) => {
            dispatch(getFileDetail(path, dispatch));
        },
    };
}

const ArchiveDetailContainer = withRouter(
    connect(mapStateToProps, mapDispatchToProps)(ArchiveDetail),
);

export default ArchiveDetailContainer;
