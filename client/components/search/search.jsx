import './style.scss';

import React from 'react';

import SearchResult from './result.jsx'; // eslint-disable-line no-unused-vars


const EXAMPLE_DATA = [
    {
        id: '1',
        title: 'Scientists Baffled by Tiny Monkey',
        description: 'Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet.',
        thumbnailUrl: 'https://i.imgur.com/ynpG7gW.png',
    },
    {
        id: '2',
        title: 'Shocking New Research on Tiny Monkey',
        description: 'Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet.',
        thumbnailUrl: 'https://i.imgur.com/sDiIEYU.jpg',
    },
];


class ArchiveSearch extends React.Component {
    render() {
        const results = EXAMPLE_DATA.map(result => <SearchResult {...result} key={result.id} />);
        return (
            <div id="archive-search">
                {/* searchbar */}
                <form id="archive-search-form" className="form-inline form-row">
                    <div className="form-group col-7 col-sm-9 col-lg-10">
                        <label className="sr-only" htmlFor="archive-search-input">Search</label>
                        <input id="archive-search-input" type="text" className="form-control form-control-lg" placeholder="Search" />
                    </div>
                    <div className="form-group col-5 col-sm-3 col-lg-2">
                        <button type="submit" className="btn btn-primary btn-lg" onClick={this.handleClick}>Search</button>
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
                    {results}
                </div>
            </div>
        );
    }

    handleClick(e) {
        e.preventDefault();
        console.log('SEARCH');
    }
}


export default ArchiveSearch;
