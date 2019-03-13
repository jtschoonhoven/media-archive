import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import { ArchiveUploads } from '../components';
import { UploadsState } from '../reducers/uploads';
import { State } from '../types';

interface StateProps {
    uploadsState: UploadsState;
}

interface DispatchProps {}


function mapStateToProps(state: State): StateProps {
    return { uploadsState: state.uploads };
}

const ArchiveUploadsContainer = withRouter(
    connect<StateProps, DispatchProps, any>(mapStateToProps)(ArchiveUploads),
);

export default ArchiveUploadsContainer;
