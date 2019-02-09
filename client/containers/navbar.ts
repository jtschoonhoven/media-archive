import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import { ArchiveNavbar } from '../components';
import { UserState } from '../reducers/user';
import { State } from '../types';

interface NavbarState {
    userState: UserState;
}

interface DispatchProps {}

function mapStateToProps(state: State): NavbarState {
    return { userState: state.user };
}

const ArchiveNavbarContainer = withRouter(
    connect<NavbarState, DispatchProps, any>(mapStateToProps)(ArchiveNavbar),
);

export default ArchiveNavbarContainer;
