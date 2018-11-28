import { connect } from 'react-redux';

import { ArchiveUpload } from '../components';


function mapStateToProps(state) {
    return {
        upload: {
            files: state.upload.files || [],
        },
    };
}


const ArchiveUploadContainer = connect(mapStateToProps)(ArchiveUpload);

export default ArchiveUploadContainer;
