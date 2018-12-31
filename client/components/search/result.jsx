import React from 'react'; // eslint-disable-line no-unused-vars
import urlJoin from 'url-join';
import { Link } from 'react-router-dom'; // eslint-disable-line no-unused-vars

import SETTINGS from '../../settings';

const MEDIA_TYPES = SETTINGS.MEDIA_TYPES;
const THUMBNAILS_PUBLIC_PATH = SETTINGS.THUMBNAILS_PUBLIC_PATH;


function getImgUrl(resultModel) {
    if (resultModel.thumbnailUrl) {
        return resultModel.thumbnailUrl;
    }
    if (resultModel.type === MEDIA_TYPES.IMAGE) {
        return resultModel.url;
    }
    return urlJoin(THUMBNAILS_PUBLIC_PATH, `${resultModel.extension.toLowerCase()}.png`);
}

export default function SearchResult(resultModel) {
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
