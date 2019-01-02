import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import { ArchiveModal } from '../components';
import { hideModal } from '../actions/modal';


function mapStateToProps(state) {
    return { modalState: state.modal };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: {
            hideModal: () => {
                dispatch(hideModal());
            },
        },
    };
}


const ArchiveModalContainer = withRouter(
    connect(mapStateToProps, mapDispatchToProps)(ArchiveModal),
);

export default ArchiveModalContainer;
