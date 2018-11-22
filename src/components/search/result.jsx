import React from 'react';


class SearchResult extends React.Component {
    render() {
        return (
            <div id="archive-search-result" className="row">
                <div className="col-2">
                    <img src={this.props.thumbnail_url} alt={this.props.title} className="img-thumbnail archive-thumbai" />
                </div>
                <div className="col-10">
                    <p className="lead">{this.props.title}</p>
                    <p>{this.props.description}</p>
                </div>
                <hr />
            </div>
        );
    }
}


export default SearchResult;
