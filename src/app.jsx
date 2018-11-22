import _ from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';

import './styles/main.scss';
import exampleAction from './actions';
import exampleComponent from './components';
import exampleContainer from './containers';
import exampleReducer from './reducers';


// testing
exampleAction();
exampleComponent();
exampleContainer();
exampleReducer();


const element = document.createElement('div');
element.id = 'root';
document.body.appendChild(element);


ReactDOM.render(
    <p>&copy; Jonathan Schoonhoven 2018</p>,
    document.getElementById('root'),
);
