import React from 'react';
import ReactDOM from 'react-dom';

import './styles/main.scss';
import { ArchiveLogin, ArchiveNavbar } from './components';


ReactDOM.render(
    <ArchiveNavbar />,
    document.getElementById('archive-navbar'),
);


ReactDOM.render(
    <ArchiveLogin />,
    document.getElementById('archive-content'),
);
