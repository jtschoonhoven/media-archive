import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import { ArchiveModal } from '../components';


function mapStateToProps(state) {
    return { modalState: state.modal };
}

const ArchiveModalContainer = withRouter(
    connect(mapStateToProps)(ArchiveModal),
);

export default ArchiveModalContainer;
