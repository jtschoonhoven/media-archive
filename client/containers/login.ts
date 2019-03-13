import { connect } from 'react-redux';

import { ArchiveLogin } from '../components';


function mapStateToProps(state) {
    return { user: state.user || {} };
}


const ArchiveLoginContainer = connect(mapStateToProps)(ArchiveLogin);

export default ArchiveLoginContainer;
