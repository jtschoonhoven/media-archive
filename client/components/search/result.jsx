import React from 'react'; // eslint-disable-line no-unused-vars
import { Link } from 'react-router-dom'; // eslint-disable-line no-unused-vars


export default function SearchResult(resultModel) {
    return (
        <div id="archive-search-result" key={resultModel.id}>
            {/* img */}
            <div className="row">
                <div className="col-5 col-sm-4 col-md-3 col-lg-2">
                    <Link to={ `detail/${resultModel.id}` }>
                        <img
                            src={ resultModel.thumbnailUrl || resultModel.url }
                            alt={ resultModel.name }
                            className="img-thumbnail"
                        />
                    </Link>
                </div>
                {/* info */}
                <div className="col-7 col-sm-8 col-md-9 col-lg-10">
                    <h3>
                        <Link to={ `detail/${resultModel.id}` }>
                            { resultModel.name }
                        </Link>
                    </h3>
                    <p>{ resultModel.description }</p>
                </div>
            </div>
            <hr />
        </div>
    );
}
