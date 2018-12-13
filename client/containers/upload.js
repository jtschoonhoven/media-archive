import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import { ArchiveUpload } from '../components';
import { load, upload } from '../actions/files';


function mapStateToProps(state) {
    return state.files || {};
}

function mapDispatchToProps(dispatch) {
    return {
        onLoad: (path) => {
            dispatch(load(path, dispatch));
        },
        onUpload: (path, filesList) => {
            dispatch(upload(path, filesList, dispatch));
        },
    };
}


const ArchiveUploadContainer = withRouter(
    connect(mapStateToProps, mapDispatchToProps)(ArchiveUpload),
);

export default ArchiveUploadContainer;
