import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import { ArchiveSearch } from '../components';
import { search, searchReset } from '../actions/search';


function mapStateToProps(state) {
    return state.search || {};
}

function mapDispatchToProps(dispatch) {
    return {
        onSearchSubmit: (searchString, filters) => {
            dispatch(search(searchString, filters, dispatch));
        },
        onSearchReset: () => {
            dispatch(searchReset());
        },
    };
}


const ArchiveSearchContainer = withRouter(
    connect(mapStateToProps, mapDispatchToProps)(ArchiveSearch),
);

export default ArchiveSearchContainer;
