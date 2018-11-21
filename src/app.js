import _ from 'lodash';

import exampleAction from './actions';
import exampleComponent from './components';
import exampleContainer from './containers';
import exampleReducer from './reducers';


// testing
exampleAction();
exampleComponent();
exampleContainer();
exampleReducer();


function component() {
    const element = document.createElement('div');
    element.innerHTML = _.join(['Hello', 'world'], ' ');
    return element;
}

document.body.appendChild(component());
