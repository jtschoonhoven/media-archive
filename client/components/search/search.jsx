import './style.scss';

import React from 'react';
import queryString from 'query-string';
import { Link } from 'react-router-dom'; // eslint-disable-line no-unused-vars
import { Record } from 'immutable';
import { FiltersModel } from '../../reducers/search';

import Alert from '../common/alert.tsx';
import SearchResult from './result.jsx';

const SEARCH_INPUT_ID = 'archive-search-form-input';


class LocalState extends Record({
    searchTerm: '',
    filters: new FiltersModel(),
    formIsDirty: false,
    formIsSubmitted: false,
}) {}


class ArchiveSearch extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            search: new LocalState({
                searchTerm: this.getSearchTermFromQueryString(),
                filters: this.getFiltersModelFromQueryString(),
            }),
        };

        this.searchInputRef = React.createRef();

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
        const nextKey = this.state.search.filters.nextKey;
        const prevKey = this.state.search.filters.prevKey;
        if (this.state.search.searchTerm) {
            this.search({ nextKey, prevKey });
        }
    }

    componentWillUnmount() {
        const localState = this.state.search;
        this.props.actions.reset();
        this.setState({
            search: localState.merge({ formIsDirty: false }),
        });
    }

    render() {
        const localState = this.state.search; // local component state
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

        return new FiltersModel({
            document: filters.document ? 1 : 0,
            image: filters.image ? 1 : 0,
            video: filters.video ? 1 : 0,
            audio: filters.audio ? 1 : 0,
            nextKey: filters.nextKey || null,
            prevKey: filters.prevKey || null,
        });
    }

    /*
     * True only if a *successful* search returned no results.
     * False if there are no results because a search is in progress, or due to an error.
     */
    noResults() {
        const localState = this.state.search;
        const storeState = this.props.searchState;
        if (!localState.formIsSubmitted) {
            return false;
        }
        if (storeState.isFetching) {
            return false;
        }
        if (storeState.errors.size) {
            return false;
        }
        if (storeState.results.size) {
            return false;
        }
        return true;
    }

    search({ nextKey, prevKey }) {
        const localState = this.state.search;
        const searchTerm = localState.searchTerm;
        let filtersModel = localState.filters;

        filtersModel = filtersModel.merge({
            nextKey: nextKey || null,
            prevKey: prevKey || null,
        });

        const filtersObj = filtersModel.toFilteredObject();
        const query = queryString.stringify({ s: searchTerm, ...filtersObj });

        this.props.history.push({ search: `?${query}` });
        this.props.actions.search(searchTerm, filtersModel);

        this.setState({
            search: localState.merge({
                formIsSubmitted: true,
                formIsDirty: false,
                filters: filtersModel,
            }),
        });
    }

    /*
     * Handle keystrokes to searchbar.
     */
    handleSearchInput(event) {
        event.preventDefault();
        const localState = this.state.search;
        const searchTerm = event.target.value;
        this.setState({
            search: localState.merge({
                searchTerm,
                formIsDirty: true,
            }),
        });
    }

    /*
     * Handle search query submit.
     */
    handleSearchSubmit(event) {
        event.preventDefault();
        const localState = this.state.search;
        this.search({});
        this.setState({
            search: localState.merge({
                formIsDirty: false,
            }),
        });
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
        const localState = this.state.search;
        const filterName = event.target.value;
        const isChecked = event.target.checked ? 1 : 0;
        const filters = localState.filters.set(filterName, isChecked);
        this.setState({
            search: localState.merge({
                formIsDirty: true,
                filters: new FiltersModel(filters.toFilteredObject()),
            }),
        });
    }
}


export default ArchiveSearch;
