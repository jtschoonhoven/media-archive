import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom'; // eslint-disable-line no-unused-vars


class SearchResult extends React.Component {
    render() {
        const id = this.props.id;
        const title = this.props.media_name;
        const description = this.props.media_description;
        const thumbnailUrl = this.props.media_url_thumbnail;

        return (
            <div id="archive-search-result">
                {/* img */}
                <div className="row">
                    <div className="col-5 col-sm-4 col-md-3 col-lg-2">
                        <Link to={ `detail/${id}` }>
                            <img
                                src={ thumbnailUrl }
                                alt={ title }
                                className="img-thumbnail"
                            />
                        </Link>
                    </div>
                    {/* info */}
                    <div className="col-7 col-sm-8 col-md-9 col-lg-10">
                        <h3>
                            <Link to={ `detail/${id}` }>
                                { title }
                            </Link>
                        </h3>
                        <p>{ description }</p>
                    </div>
                </div>
                <hr />
            </div>
        );
    }
}

SearchResult.propTypes = {
    id: PropTypes.number.isRequired,
    media_name: PropTypes.string.isRequired,
    media_description: PropTypes.string.isRequired,
    media_url_thumbnail: PropTypes.string.isRequired,
};


export default SearchResult;
