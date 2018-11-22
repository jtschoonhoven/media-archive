import React from 'react';
import ReactDOM from 'react-dom';

import './styles/main.scss';
import ArchiveLogin from './components/login/index.jsx';


const element = document.createElement('div');
element.id = 'root';
document.body.appendChild(element);


ReactDOM.render(
    <ArchiveLogin />,
    document.getElementById('archive-content'),
);
