import './style.scss';

import PropTypes from 'prop-types';
import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik'; // eslint-disable-line no-unused-vars

import SearchResult from './result.jsx'; // eslint-disable-line no-unused-vars


class ArchiveSearch extends React.Component {
    render() {
        const results = this.props.results || [];
        const Results = results.map(
            result => <SearchResult {...result} key={result.id} />,
        );
        return (
            <div id="archive-search">
                {/* searchbar */}
                <Formik initialValues={{ search: '' }} onSubmit={values => this.props.onSearchSubmit(values.search)}>
                    {({ values }) => (
                        <Form id="archive-search-form" className="form-inline form-row">
                            <div className="form-group col-7 col-sm-9 col-lg-10">
                                <label className="sr-only" htmlFor="archive-search-input">Search</label>
                                <Field type="text" name="search" value={values.search} className="form-control form-control-lg" placeholder="Search" />
                                <ErrorMessage name="search" component="div" />
                            </div>
                            <div className="form-group col-5 col-sm-3 col-lg-2">
                                <button type="submit" className="btn btn-primary btn-lg" disabled={this.props.isFetching}>Search</button>
                            </div>
                        </Form>
                    )}
                </Formik>
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
            </div>
        );
    }
}

ArchiveSearch.propTypes = {
    onSearchSubmit: PropTypes.func.isRequired,
};


export default ArchiveSearch;
