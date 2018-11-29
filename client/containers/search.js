import { connect } from 'react-redux';

import { ArchiveSearch } from '../components';


function mapStateToProps(state) {
    return state.search || {};
}


const ArchiveSearchContainer = connect(mapStateToProps)(ArchiveSearch);

export default ArchiveSearchContainer;
