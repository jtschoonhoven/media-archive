import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import { ArchiveModal } from '../components';
import { State } from '../types';
import { ModalState } from '../reducers/modal';

interface StateProps {
    modalState: ModalState;
}

interface DispatchProps {}

function mapStateToProps(state: State): StateProps {
    return { modalState: state.modal };
}


const ArchiveModalContainer = withRouter(
    connect<StateProps, DispatchProps, any>(mapStateToProps)(ArchiveModal),
);

export default ArchiveModalContainer;
