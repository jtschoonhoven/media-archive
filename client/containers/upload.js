import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import { ArchiveUpload } from '../components';
import { load, upload, uploadCancel } from '../actions/files';


function mapStateToProps(state) {
    return state.files || {};
}

function mapDispatchToProps(dispatch) {
    return {
        // load directory contents
        onLoad: (path) => {
            dispatch(load(path, dispatch));
        },
        // upload a list of files
        onUpload: (path, filesList) => {
            dispatch(upload(path, filesList, dispatch));
        },

        onUploadCancel: (uploadId) => {
            dispatch(uploadCancel(uploadId, dispatch));
        },
    };
}


const ArchiveUploadContainer = withRouter(
    connect(mapStateToProps, mapDispatchToProps)(ArchiveUpload),
);

export default ArchiveUploadContainer;
