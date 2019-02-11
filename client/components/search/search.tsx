import './style.scss';

import * as React from 'react';
import _ from 'lodash';
import queryString from 'query-string';
import { DispatchProp } from 'react-redux';
import { Link } from 'react-router-dom'; // eslint-disable-line no-unused-vars
import { Record } from 'immutable';

import Alert from '../common/alert';
import SearchResult from './result.jsx';
import { FiltersModel, SearchState } from '../../reducers/search';
import { SearchActions } from '../../containers/search';
import { Action } from '../../types';

const SEARCH_INPUT_ID = 'archive-search-form-input';

export interface SearchProps {
    actions: SearchActions;
    searchState: SearchState;
    location: { search: string };
    history: { search: string }[];
    dispatch: (action: Action) => void;
}

interface State {
    search: SearchState;
}

interface LocalState {
    searchTerm: string;
    filters: FiltersModel;
    formIsDirty: boolean;
    formIsSubmitted: boolean;
}

const INITIAL_STATE: LocalState = {
    searchTerm: '',
    filters: new FiltersModel(),
    formIsDirty: false,
    formIsSubmitted: false,
};


class ArchiveSearch extends React.Component<SearchProps> {

    state: LocalState = INITIAL_STATE;
    searchInputRef: React.RefObject<HTMLInputElement> = React.createRef();

    constructor(props: SearchProps) {
        super(props);

        this.state.searchTerm = this.getSearchTermFromQueryString();
        this.state.filters = this.getFiltersModelFromQueryString();

        // bind event handlers
        this.handleSearchSubmit = this.handleSearchSubmit.bind(this);
        this.handleSearchInput = this.handleSearchInput.bind(this);
        this.handleNextPage = this.handleNextPage.bind(this);
        this.handlePrevPage = this.handlePrevPage.bind(this);
        this.handleFilterCheck = this.handleFilterCheck.bind(this);
    }

    componentDidMount() {
        this.searchInputRef.current.focus();

        // search on load if a search term is present in the initial url
        const nextKey = this.state.filters.nextKey;
        const prevKey = this.state.filters.prevKey;
        if (this.state.searchTerm) {
            this.search({ nextKey, prevKey });
        }
    }

    componentWillUnmount() {
        this.props.actions.reset();
        this.setState({ formIsDirty: false });
    }

    render() {
        const localState = this.state; // local component state
        const storeState = this.props.searchState; // global redux store state

        const Errors = storeState.errors.map((msg, idx) => {
            return Alert(msg, { idx });
        });

        const Results = storeState.results.map((resultModel) => {
            return SearchResult(resultModel);
        });

        return (
            <div id="archive-search">

                {/* searchbar */}
                <form
                    id="archive-search-form"
                    className="form-inline form-row"
                    onSubmit={ this.handleSearchSubmit }
                >
                    <div className="form-group col-7 col-sm-9 col-lg-10">
                        <label className="sr-only" htmlFor="archive-search-input">Search</label>
                        <input
                            id={ SEARCH_INPUT_ID }
                            type="text"
                            name="search"
                            className="form-control form-control-lg"
                            placeholder="Search"
                            ref={ this.searchInputRef }
                            value={ localState.searchTerm }
                            onChange={ this.handleSearchInput }
                        />
                    </div>
                    <div className="form-group col-5 col-sm-3 col-lg-2">
                        <button
                            type="submit"
                            className="btn btn-primary btn-lg"
                            disabled={ !localState.searchTerm.trim() || storeState.isFetching }
                        >
                            Search
                        </button>
                    </div>
                </form>

                {/* filters */}
                <div className="form-check form-check-inline">
                    <label className="form-check-label"><strong>Filter:</strong></label>
                </div>

                {/* documents */}
                <div className="form-check form-check-inline">
                    <input
                        id="archive-search-filter-documents"
                        className="form-check-input"
                        type="checkbox"
                        value="document"
                        onChange={ this.handleFilterCheck }
                        checked={ !!localState.filters.document }
                    />
                    <label
                        className="form-check-label"
                        htmlFor="archive-search-filter-documents"
                    >
                        documents
                    </label>
                </div>

                {/* images */}
                <div className="form-check form-check-inline">
                    <input
                        id="archive-search-filter-images"
                        className="form-check-input"
                        type="checkbox"
                        value="image"
                        onChange={ this.handleFilterCheck }
                        checked={ !!localState.filters.image }
                    />
                    <label
                        className="form-check-label"
                        htmlFor="archive-search-filter-images"
                    >
                        images
                    </label>
                </div>

                {/* videos */}
                <div className="form-check form-check-inline">
                    <input
                        id="archive-search-filter-videos"
                        className="form-check-input"
                        type="checkbox"
                        value="video"
                        onChange={ this.handleFilterCheck }
                        checked={ !!localState.filters.video }
                    />
                    <label
                        className="form-check-label"
                        htmlFor="archive-search-filter-videos"
                    >
                        videos
                    </label>
                </div>

                {/* audio */}
                <div className="form-check form-check-inline">
                    <input
                        id="archive-search-filter-audio"
                        className="form-check-input"
                        type="checkbox"
                        value="audio"
                        onChange={ this.handleFilterCheck }
                        checked={ !!localState.filters.audio }
                    />
                    <label
                        className="form-check-label"
                        htmlFor="archive-search-filter-audio"
                    >
                        audio
                    </label>
                </div>

                {/* errors */}
                <div id="archive-search-errors">
                    { Errors }
                </div>

                {/* results */}
                <div id="archive-search-results">
                    { Results }
                </div>

                {/* no results */}
                <div className="archive-search-results-empty">
                    {
                        this.noResults()
                            ? Alert('No results', {
                                style: 'secondary',
                                centered: true,
                                muted: true,
                            })
                            : ''
                    }
                </div>

                {/* pagination */}
                <nav aria-label="pagination">
                    <ul className="pagination justify-content-center">
                        <li className="page-item">
                            <button
                                className="page-link btn btn-link btn-lg"
                                onClick={ this.handlePrevPage }
                                disabled={ !storeState.filters.prevKey || localState.formIsDirty }
                            >
                                Previous
                            </button>
                        </li>
                        <li className="page-item">
                            <button
                                className="page-link btn btn-link btn-lg"
                                onClick={this.handleNextPage}
                                disabled={ !storeState.filters.nextKey || localState.formIsDirty }
                            >
                                Next
                            </button>
                        </li>
                    </ul>
                </nav>
            </div>
        );
    }

    /*
     * Return the search term from the query string of the current URL.
     */
    getSearchTermFromQueryString() {
        const query = queryString.parse(this.props.location.search);
        const searchTerm = query.s || '';
        return searchTerm;
    }

    /*
     * Return a FiltersModel containing each filter in the query string of the current URL.
     */
    getFiltersModelFromQueryString() {
        const query = queryString.parse(this.props.location.search);
        const { s, ...filters } = query;

        return new FiltersModel(
            filters.document ? 1 : 0,
            filters.image ? 1 : 0,
            filters.video ? 1 : 0,
            filters.audio ? 1 : 0,
            filters.nextKey || null,
            filters.prevKey || null,
        );
    }

    /*
     * True only if a *successful* search returned no results.
     * False if there are no results because a search is in progress, or due to an error.
     */
    noResults() {
        const localState = this.state;
        const storeState = this.props.searchState;
        if (!localState.formIsSubmitted) {
            return false;
        }
        if (storeState.isFetching) {
            return false;
        }
        if (storeState.errors.length) {
            return false;
        }
        if (storeState.results.length) {
            return false;
        }
        return true;
    }

    search({ nextKey, prevKey }: { nextKey?: string, prevKey?: string }): void {
        const localState = this.state;
        const searchTerm = localState.searchTerm;
        const oldFiltersModel = localState.filters;
        const newFiltersModel = oldFiltersModel.update({ nextKey, prevKey });

        const filtersObj = newFiltersModel.toFilteredObject();
        const query = queryString.stringify({ s: searchTerm, ...filtersObj });

        this.props.history.push({ search: `?${query}` });
        this.props.actions.search(searchTerm, newFiltersModel);

        this.setState({
            formIsSubmitted: true,
            formIsDirty: false,
            filters: newFiltersModel,
        });
    }

    /*
     * Handle keystrokes to searchbar.
     */
    handleSearchInput(event) {
        event.preventDefault();
        const localState = this.state;
        const searchTerm = event.target.value;
        this.setState({ searchTerm, formIsDirty: true });
    }

    /*
     * Handle search query submit.
     */
    handleSearchSubmit(event) {
        event.preventDefault();
        const localState = this.state;
        this.search({});
        this.setState({ formIsDirty: false });
    }

    /*
     * Handle click for next page of results.
     */
    handleNextPage(event) {
        event.preventDefault();
        const storeState = this.props.searchState;
        const nextKey = storeState.filters.nextKey;
        this.search({ nextKey });
    }

    /*
     * Handle click for previous page of results.
     */
    handlePrevPage(event) {
        event.preventDefault();
        const storeState = this.props.searchState;
        const prevKey = storeState.filters.prevKey;
        this.search({ prevKey });
    }

    /*
     * Handle click on filter checkbox.
     */
    handleFilterCheck(event) {
        const localState = this.state;
        const filterName = event.target.value;
        const isChecked = event.target.checked ? 1 : 0;
        const filters = localState.filters.update({ [filterName]: isChecked });
        this.setState({ filters, formIsDirty: true });
    }
}


export default ArchiveSearch;
