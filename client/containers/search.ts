import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import { ArchiveSearch } from '../components';
import { search, searchReset } from '../actions/search';
import { SearchState } from '../reducers/search';

export interface SearchActions {
    search: (searchString: string, filters) => void;
    reset: () => void;
}

export interface SearchStateProps {
    searchState: SearchState;
}


function mapStateToProps(state) {
    return { searchState: state.search };
}

function mapDispatchToProps(dispatch): { actions: SearchActions } {
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
