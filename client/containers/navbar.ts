import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import { ArchiveNavbar } from '../components';


function mapStateToProps(state) {
    return { userState: state.user };
}

const ArchiveNavbarContainer = withRouter(connect(mapStateToProps)(ArchiveNavbar));

export default ArchiveNavbarContainer;
