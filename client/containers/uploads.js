import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import { ArchiveUploads } from '../components';


function mapStateToProps(state) {
    return { uploadsState: state.uploads };
}


const ArchiveUploadsContainer = withRouter(
    connect(mapStateToProps)(ArchiveUploads),
);

export default ArchiveUploadsContainer;
