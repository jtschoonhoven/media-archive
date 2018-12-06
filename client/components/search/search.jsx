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
        this.state = { searchTerm, filters };

        // bind event handlers
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleNextPage = this.handleNextPage.bind(this);
        this.handlePrevPage = this.handlePrevPage.bind(this);
    }

    componentDidMount() {
        const searchTerm = this.state.searchTerm;
        const filters = this.state.filters;
        if (searchTerm) {
            this.props.onSearchSubmit(searchTerm, filters);
        }
    }

    render() {
        const results = this.props.results || [];
        const Results = results.map(result => <SearchResult {...result} key={result.id} />);
        return (
            <div id="archive-search">
                {/* searchbar */}
                <form id="archive-search-form" className="form-inline form-row" onSubmit={this.handleSubmit}>
                    <div className="form-group col-7 col-sm-9 col-lg-10">
                        <label className="sr-only" htmlFor="archive-search-input">Search</label>
                        <input id={SEARCH_INPUT_ID} type="text" name="search" className="form-control form-control-lg" placeholder="Search" value={this.state.searchTerm} onChange={this.handleChange} />
                    </div>
                    <div className="form-group col-5 col-sm-3 col-lg-2">
                        <button type="submit" className="btn btn-primary btn-lg" disabled={!this.state.searchTerm.trim() || this.props.isFetching}>Search</button>
                    </div>
                </form>
                {/* filters */}
                <div className="form-check form-check-inline">
                    <label className="form-check-label"><strong>Include:</strong></label>
                </div>
                {/* documents */}
                <div className="form-check form-check-inline">
                    <input id="archive-search-filter-documents" className="form-check-input" type="checkbox" value="documents" defaultChecked />
                    <label className="form-check-label" htmlFor="archive-search-filter-documents">documents</label>
                </div>
                {/* images */}
                <div className="form-check form-check-inline">
                    <input id="archive-search-filter-images" className="form-check-input" type="checkbox" value="images" defaultChecked />
                    <label className="form-check-label" htmlFor="archive-search-filter-images">images</label>
                </div>
                {/* videos */}
                <div className="form-check form-check-inline">
                    <input id="archive-search-filter-videos" className="form-check-input" type="checkbox" value="videos" defaultChecked />
                    <label className="form-check-label" htmlFor="archive-search-filter-videos">videos</label>
                </div>
                {/* results */}
                <div id="archive-search-results">
                    {Results}
                </div>
                {/* errors */}
                <div id="archive-search-errors" className="alert alert-danger" role="alert" style={{ display: this.props.error ? 'block' : 'none' }}>
                    {this.props.error && this.props.error.toString()}
                </div>
                {/* no results */}
                {/* TODO
                <div className="alert alert-secondary text-center" role="alert">
                    <span className="text-muted">No results.</span>
                </div>
                */}
                {/* pagination */}
                <nav aria-label="pagination">
                    <ul className="pagination justify-content-center">
                        <li className="page-item">
                            <button className="page-link btn btn-link btn-lg" onClick={this.handlePrevPage} disabled={!this.props.prevKey}>
                                Previous
                            </button>
                        </li>
                        <li className="page-item">
                            <button className="page-link btn btn-link btn-lg" onClick={this.handleNextPage} disabled={!this.props.nextKey}>
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
        this.setState({ filters });

        const query = queryString.stringify({ s: searchTerm, ...filters });
        this.props.history.push({ search: `?${query}` });
        this.props.onSearchSubmit(searchTerm, filters);
    }

    handleChange(event) {
        event.preventDefault();
        const searchTerm = event.target.value;
        this.setState({ searchTerm });
    }

    handleSubmit(event) {
        event.preventDefault();
        this.search({});
    }

    handleNextPage(event) {
        event.preventDefault();
        const nextKey = this.props.nextKey;
        this.search({ nextKey });
    }

    handlePrevPage(event) {
        event.preventDefault();
        const prevKey = this.props.prevKey;
        this.search({ prevKey });
    }
}

ArchiveSearch.propTypes = {
    onSearchSubmit: PropTypes.func.isRequired,
};


export default withRouter(ArchiveSearch);
