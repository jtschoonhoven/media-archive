import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import { ArchiveUploads } from '../components';
import { upload, uploadCancel } from '../actions/uploads';


function mapStateToProps(state) {
    return { uploadsState: state.uploads };
}

function mapDispatchToProps(dispatch) {
    return {
        // upload a list of files
        onUpload: (path, filesList) => {
            dispatch(upload(path, filesList, dispatch));
        },

        onUploadCancel: (uploadId) => {
            dispatch(uploadCancel(uploadId, dispatch));
        },
    };
}


const ArchiveUploadsContainer = withRouter(
    connect(mapStateToProps, mapDispatchToProps)(ArchiveUploads),
);

export default ArchiveUploadsContainer;
