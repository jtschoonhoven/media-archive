import React from 'react';


class ArchiveSearch extends React.Component {
    render() {
        return (
            <form className="form-row">
                <div className="form-group col-10">
                    <label className="sr-only" htmlFor="archive-home-search">Search</label>
                    <input id="archive-home-search" type="text" className="form-control form-control-lg" placeholder="Search" />
                </div>
                <div className="col-2">
                    <button type="submit" className="btn btn-primary btn-lg">Search</button>
                </div>
            </form>
        );
    }
}


export default ArchiveSearch;
