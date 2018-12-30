import React from 'react'; // eslint-disable-line no-unused-vars
import urlJoin from 'url-join';
import { Link } from 'react-router-dom'; // eslint-disable-line no-unused-vars

const ROOT_NAME = 'root';


export default (pathArray, dirname, idx) => { // eslint-disable-line arrow-body-style
    const isLast = idx === pathArray.length - 1;
    const path = pathArray.slice(0, idx + 1).join('/');
    return (
        <li className={`breadcrumb-item ${isLast ? 'active' : ''}`} key={idx}>
            { isLast ? dirname || ROOT_NAME : <Link to={urlJoin('/files', path)}>
                { dirname || ROOT_NAME }
            </Link> }
        </li>
    );
};
