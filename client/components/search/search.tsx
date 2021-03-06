import './style.scss';

import * as React from 'react';
import _ from 'lodash';
import queryString from 'query-string';
import Accordion from 'react-bootstrap/Accordion';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';

import Alert from '../common/alert';
import SearchResult from './result';
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
        this.showAdvancedSearchModal = this.showAdvancedSearchModal.bind(this);
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
                <form className="form-inline form-row">
                    <div className="form-check form-check-inline">
                        <label className="form-check-label">
                            <strong>Filter:</strong>
                        </label>
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

                    {/* advanced search */}
                    <div className="ml-auto d-none d-sm-block">
                        <Button variant="link" size="lg" onClick={ this.showAdvancedSearchModal }>
                            <small>advanced search</small>
                        </Button>
                    </div>
                </form>

                <div>
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
     * Display an info modal to explain advanced search features.
     */
    showAdvancedSearchModal(): void {
        const showInfoModal = this.props.actions.showInfoModal;
        const title = 'Advanced Search Operators';
        const message = (
            <div>
                <Accordion>
                    {/* AND */}
                    <Card>
                        <Accordion.Toggle as={Card.Header} variant="link" eventKey="0" style={{ cursor: 'pointer ' }}>
                            <p className="lead mb-0 d-flex">
                                <span className="badge badge-success mr-1 pl-2 pr-2 font-weight-bold">& ampersand</span>
                                <small>Search for media that have ALL words.</small>
                                <span className="ml-auto lead font-weight-bold">+</span>
                            </p>
                        </Accordion.Toggle>
                        <Accordion.Collapse eventKey="0">
                            <Card.Body>
                                <pre className="small mb-0 d-inline bg-light text-dark p-1 mr-2">(monkey & ape)</pre>
                                <p className="small d-inline">Search for media that include both "monkey" and "ape"</p>
                            </Card.Body>
                        </Accordion.Collapse>
                    </Card>
                    {/* OR */}
                    <Card>
                        <Accordion.Toggle as={Card.Header} variant="link" eventKey="1">
                            <p className="lead mb-0 d-flex">
                                <span className="badge badge-warning mr-1 pl-2 pr-2 font-weight-bold">| vertical pipe</span>
                                <small>Search for media that have ANY words.</small>
                                <span className="ml-auto lead font-weight-bold">+</span>
                            </p>
                        </Accordion.Toggle>
                        <Accordion.Collapse eventKey="1">
                            <Card.Body>
                                <pre className="small mb-0 d-inline bg-light text-dark p-1 mr-2">(monkey | ape)</pre>
                                <p className="small d-inline">Search for media that include "monkey" or "ape"</p>
                            </Card.Body>
                        </Accordion.Collapse>
                    </Card>
                    {/* NOT */}
                    <Card>
                        <Accordion.Toggle as={Card.Header} variant="link" eventKey="2">
                            <p className="lead mb-0 d-flex">
                                <span className="badge badge-danger mr-1 pl-2 pr-2 font-weight-bold">! exclamation</span>
                                <small>Search for media that do NOT have a word.</small>
                                <span className="ml-auto lead font-weight-bold">+</span>
                            </p>
                        </Accordion.Toggle>
                        <Accordion.Collapse eventKey="2">
                            <Card.Body>
                                <pre className="small mb-0 d-inline bg-light text-dark p-1 mr-2">(monkey !ape)</pre>
                                <p className="small d-inline">Search for media that include "monkey" but not "ape"</p>
                            </Card.Body>
                        </Accordion.Collapse>
                    </Card>
                    {/* GROUP */}
                    <Card>
                        <Accordion.Toggle as={Card.Header} variant="link" eventKey="3">
                            <p className="lead mb-0 d-flex">
                                <span className="badge badge-info mr-1 pl-2 pr-2 font-weight-bold">(...) parens</span>
                                <small>Group words to COMBINE search operators.</small>
                                <span className="ml-auto lead font-weight-bold">+</span>
                            </p>
                        </Accordion.Toggle>
                        <Accordion.Collapse eventKey="3">
                            <Card.Body>
                                <pre className="small mb-0 d-inline bg-light text-dark p-1 mr-2">(monkey & ape) !(bonobo | rhesus)</pre>
                                <p className="small d-inline">Search for media that include "monkey" and "ape" but neither "bonobo" nor "rhesus"</p>
                            </Card.Body>
                        </Accordion.Collapse>
                    </Card>
                </Accordion>
                <p className="text-muted mt-3 mb-0">Click above for example usage.</p>
            </div>
        );
        showInfoModal(title, message);
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
