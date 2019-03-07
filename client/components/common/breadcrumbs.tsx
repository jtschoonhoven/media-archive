import * as React from 'react';
import urlJoin from 'url-join';
import { Link } from 'react-router-dom';

const ROOT_NAME = 'root';


export default (
    pathArray: string[],
    dirname: string,
    idx: number,
): React.ReactElement<HTMLElement> => {
    const isLast = idx === pathArray.length - 1;
    const path = pathArray.slice(0, idx + 1).join('/');
    return (
        <li className={ `breadcrumb-item ${isLast ? 'active' : ''}` } key={ idx }>
            { isLast ? dirname || ROOT_NAME : <Link to={ urlJoin('/files', path) }>{ dirname || ROOT_NAME }</Link> }
        </li>
    );
};
