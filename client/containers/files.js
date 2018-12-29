import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import { ArchiveFiles } from '../components';
import { load } from '../actions/files';
import { upload } from '../actions/uploads';


function mapStateToProps(state) {
    return {
        filesState: state.files,
        uploadsState: state.uploads,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: {
            // load directory contents
            load: (path) => {
                dispatch(load(path, dispatch));
            },
            upload: (path, fileList) => {
                dispatch(upload(path, fileList, dispatch));
            },
        },
    };
}

const ArchiveFilesContainer = withRouter(
    connect(mapStateToProps, mapDispatchToProps)(ArchiveFiles),
);


export default ArchiveFilesContainer;
