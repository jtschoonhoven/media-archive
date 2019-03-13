import React from 'react';
import { Link } from 'react-router-dom';
import urlJoin from 'url-join';

import SETTINGS from '../../settings';
import { SearchResult } from '../../reducers/search';

const MEDIA_TYPES = SETTINGS.MEDIA_TYPES;
const API_URLS = SETTINGS.API_URLS;


function getImgUrl(resultModel: SearchResult): string {
    if (resultModel.thumbnailUrl) {
        return resultModel.thumbnailUrl;
    }
    if (resultModel.type === MEDIA_TYPES.IMAGE) {
        return resultModel.url;
    }
    return urlJoin(API_URLS.THUMBNAILS, resultModel.extension);
}

export default function SearchResult(
    resultModel: SearchResult,
): React.ReactElement<HTMLDivElement> {
    return (
        <div id="archive-search-result" key={resultModel.id}>
            {/* img */}
            <div className="row">
                <div className="col-5 col-sm-4 col-md-3 col-lg-2">
                    <Link to={ `detail/${resultModel.id}` }>
                        <img
                            src={ getImgUrl(resultModel) }
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
