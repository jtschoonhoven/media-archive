import React from 'react';
import urlJoin from 'url-join';
import Truncate from 'react-truncate';
import { Link } from 'react-router-dom';

import SETTINGS from '../../settings';
import { SearchResult as SearchResultModel } from '../../reducers/search';

const MEDIA_TYPES = SETTINGS.MEDIA_TYPES;
const API_URLS = SETTINGS.API_URLS;


function getImgUrl(resultModel: SearchResultModel): string {
    if (resultModel.thumbnailUrl) {
        return resultModel.thumbnailUrl;
    }
    if (resultModel.type === MEDIA_TYPES.IMAGE) {
        return resultModel.url;
    }
    return urlJoin(API_URLS.THUMBNAILS, resultModel.extension);
}

export default function SearchResult(
    resultModel: SearchResultModel,
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
                        <Link to={ `detail/${resultModel.id}` } className="d-block">
                            <Truncate lines={1}>{ resultModel.name }</Truncate>
                        </Link>
                    </h3>
                    <p><Truncate lines={5}>{ resultModel.description || resultModel.transcript }</Truncate></p>
                </div>
            </div>
            <hr />
        </div>
    );
}
