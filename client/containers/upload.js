import { connect } from 'react-redux';

import { ArchiveUpload } from '../components';
import { load } from '../actions/files';


function mapStateToProps(state) {
    return state.files || {};
}

function mapDispatchToProps(dispatch) {
    return {
        onLoad: (path) => {
            dispatch(load(path, dispatch));
        },
    };
}


const ArchiveUploadContainer = connect(mapStateToProps, mapDispatchToProps)(ArchiveUpload);

export default ArchiveUploadContainer;
