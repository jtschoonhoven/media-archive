import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import { ArchiveSearch } from '../components';
import { search, searchReset } from '../actions/search';


function mapStateToProps(state) {
    return { searchState: state.search };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: {
            search: (searchString, filters) => {
                dispatch(search(searchString, filters, dispatch));
            },
            reset: () => {
                dispatch(searchReset());
            },
        },
    };
}


const ArchiveSearchContainer = withRouter(
    connect(mapStateToProps, mapDispatchToProps)(ArchiveSearch),
);

export default ArchiveSearchContainer;
