import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import { ArchiveDetail } from '../components';
import { getFileDetail } from '../actions/detail';


function mapStateToProps(state) {
    return { detailState: state.detail };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: {
            getFileDetail: (id) => {
                dispatch(getFileDetail(id, dispatch));
            },
        },
    };
}

const ArchiveDetailContainer = withRouter(
    connect(mapStateToProps, mapDispatchToProps)(ArchiveDetail),
);

export default ArchiveDetailContainer;
