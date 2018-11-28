import { connect } from 'react-redux';

import { ArchiveNavbar } from '../components';


function mapStateToProps(state) {
    return { user: state.user || {} };
}

const ArchiveNavbarContainer = connect(mapStateToProps)(ArchiveNavbar);

export default ArchiveNavbarContainer;
