import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import { ArchiveSearch } from '../components';
import { search, searchReset } from '../actions/search';
import { SearchState } from '../reducers/search';
import { State } from '../types';

export interface SearchActions {
    search: (searchString: string, filters) => void;
    reset: () => void;
}

export interface SearchStateProps {
    searchState: SearchState;
}

export interface DispatchProps {
    actions: SearchActions;
}


function mapStateToProps(state: State): SearchStateProps {
    return { searchState: state.search };
}

function mapDispatchToProps(dispatch: Dispatch): { actions: SearchActions } {
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
    connect<SearchStateProps, DispatchProps, any>(
        mapStateToProps,
        mapDispatchToProps,
    )(ArchiveSearch),
);

export default ArchiveSearchContainer;
