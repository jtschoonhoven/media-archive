import './style.scss';

import PropTypes from 'prop-types';
import React from 'react';
import queryString from 'query-string';
import { Link } from 'react-router-dom'; // eslint-disable-line no-unused-vars
import { withRouter } from 'react-router';

import SearchResult from './result.jsx'; // eslint-disable-line no-unused-vars

const SEARCH_INPUT_ID = 'archive-search-form-input';


class ArchiveSearch extends React.Component {
    constructor(props) {
        super(props);
        const query = queryString.parse(this.props.location.search);
        const { s, ...filters } = query;
        const searchTerm = s || '';

        // set default filter values
        filters.document = filters.document || 0;
        filters.image = filters.image || 0;
        filters.video = filters.video || 0;
        filters.audio = filters.audio || 0;

        // set initial state
        this.state = { searchTerm, filters };

        // bind event handlers
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleNextPage = this.handleNextPage.bind(this);
        this.handlePrevPage = this.handlePrevPage.bind(this);
        this.handleCheck = this.handleCheck.bind(this);
    }

    componentDidMount() {
        const searchTerm = this.state.searchTerm;
        const nextKey = this.state.filters.nextKey;
        const prevKey = this.state.filters.prevKey;
        if (searchTerm) {
            this.search({ nextKey, prevKey });
        }
    }

    componentWillUnmount() {
        this.props.onSearchReset();
        this.setState({ isDirty: false });
    }

    render() {
        const props = this.props;
        const state = this.state;
        const results = props.results || [];
        const Results = results.map(result => <SearchResult {...result} key={result.id} />);
        const noResult = !results.length && state.isSubmitted && !state.isFetching && !props.error;
        return (
            <div id="archive-search">
                {/* searchbar */}
                <form id="archive-search-form" className="form-inline form-row" onSubmit={this.handleSubmit}>
                    <div className="form-group col-7 col-sm-9 col-lg-10">
                        <label className="sr-only" htmlFor="archive-search-input">Search</label>
                        <input id={SEARCH_INPUT_ID} type="text" name="search" className="form-control form-control-lg" placeholder="Search" value={state.searchTerm} onChange={this.handleChange} />
                    </div>
                    <div className="form-group col-5 col-sm-3 col-lg-2">
                        <button type="submit" className="btn btn-primary btn-lg" disabled={!state.searchTerm.trim() || this.props.isFetching}>Search</button>
                    </div>
                </form>
                {/* filters */}
                <div className="form-check form-check-inline">
                    <label className="form-check-label"><strong>Filter:</strong></label>
                </div>
                {/* documents */}
                <div className="form-check form-check-inline">
                    <input id="archive-search-filter-documents" className="form-check-input" type="checkbox" value="document" onChange={this.handleCheck} checked={!!state.filters.document}/>
                    <label className="form-check-label" htmlFor="archive-search-filter-documents">documents</label>
                </div>
                {/* images */}
                <div className="form-check form-check-inline">
                    <input id="archive-search-filter-images" className="form-check-input" type="checkbox" value="image" onChange={this.handleCheck} checked={!!state.filters.image} />
                    <label className="form-check-label" htmlFor="archive-search-filter-images">images</label>
                </div>
                {/* videos */}
                <div className="form-check form-check-inline">
                    <input id="archive-search-filter-videos" className="form-check-input" type="checkbox" value="video" onChange={this.handleCheck} checked={!!state.filters.video} />
                    <label className="form-check-label" htmlFor="archive-search-filter-videos">videos</label>
                </div>
                {/* audio */}
                <div className="form-check form-check-inline">
                    <input id="archive-search-filter-audio" className="form-check-input" type="checkbox" value="audio" onChange={this.handleCheck} checked={!!state.filters.audio} />
                    <label className="form-check-label" htmlFor="archive-search-filter-audio">audio</label>
                </div>
                {/* results */}
                <div id="archive-search-results">
                    {Results}
                </div>
                {/* errors */}
                <div id="archive-search-errors" className="alert alert-danger" role="alert" style={{ display: props.error ? 'block' : 'none' }}>
                    {props.error && props.error.toString()}
                </div>
                {/* no results */}
                <div className="alert alert-secondary text-center" role="alert" style={{ display: noResult ? 'block' : 'none' }}>
                    <span className="text-muted">No results.</span>
                </div>
                {/* pagination */}
                <nav aria-label="pagination">
                    <ul className="pagination justify-content-center">
                        <li className="page-item">
                            <button className="page-link btn btn-link btn-lg" onClick={this.handlePrevPage} disabled={!props.prevKey || state.isDirty}>
                                Previous
                            </button>
                        </li>
                        <li className="page-item">
                            <button className="page-link btn btn-link btn-lg" onClick={this.handleNextPage} disabled={!props.nextKey || state.isDirty}>
                                Next
                            </button>
                        </li>
                    </ul>
                </nav>
            </div>
        );
    }

    search({ nextKey, prevKey }) {
        const searchTerm = this.state.searchTerm;
        const filters = Object.assign({}, this.state.filters || {});

        delete filters.nextKey;
        delete filters.prevKey;

        if (nextKey) {
            filters.nextKey = nextKey;
        }
        else if (prevKey) {
            filters.prevKey = prevKey;
        }
        if (!filters.document) {
            delete filters.document;
        }
        if (!filters.image) {
            delete filters.image;
        }
        if (!filters.video) {
            delete filters.video;
        }
        if (!filters.audio) {
            delete filters.audio;
        }
        if (filters.document && filters.image && filters.video && filters.audio) {
            delete filters.document;
            delete filters.image;
            delete filters.video;
            delete filters.audio;
        }

        const query = queryString.stringify({ s: searchTerm, ...filters });
        this.props.history.push({ search: `?${query}` });
        this.props.onSearchReset();
        this.props.onSearchSubmit(searchTerm, filters);
        this.setState({ isSubmitted: true, isDirty: false, filters });
    }

    /*
     * Handle keystrokes to searchbar.
     */
    handleChange(event) {
        event.preventDefault();
        const searchTerm = event.target.value;
        this.setState({ searchTerm, isDirty: true });
    }

    /*
     * Handle search query submit.
     */
    handleSubmit(event) {
        event.preventDefault();
        this.search({});
        this.setState({ isDirty: false });
    }

    /*
     * Handle click for next page of results.
     */
    handleNextPage(event) {
        event.preventDefault();
        const nextKey = this.props.nextKey;
        this.search({ nextKey });
    }

    /*
     * Handle click for previous page of results.
     */
    handlePrevPage(event) {
        event.preventDefault();
        const prevKey = this.props.prevKey;
        this.search({ prevKey });
    }

    /*
     * Handle click on filter checkbox.
     */
    handleCheck(event) {
        const filters = this.state.filters;
        const filterName = event.target.value;
        const isChecked = event.target.checked ? 1 : 0;
        this.setState({ isDirty: true, filters: { ...filters, [filterName]: isChecked } });
    }
}

ArchiveSearch.propTypes = {
    onSearchSubmit: PropTypes.func.isRequired,
};


export default withRouter(ArchiveSearch);
