import React from 'react';

import { Link } from '../common'; // eslint-disable-line no-unused-vars


class SearchResult extends React.Component {
    render() {
        return (
            <div id="archive-search-result" className="row">
                {/* img */}
                <div className="col-2">
                    <Link href={`detail/${this.props.id}`}>
                        <img src={this.props.thumbnail_url} alt={this.props.title} className="img-thumbnail archive-thumbai" />
                    </Link>
                </div>
                {/* info */}
                <div className="col-10">
                    <h3><Link href={`detail/${this.props.id}`}>{this.props.title}</Link></h3>
                    <p>{this.props.description}</p>
                </div>
                <hr />
            </div>
        );
    }
}


export default SearchResult;
