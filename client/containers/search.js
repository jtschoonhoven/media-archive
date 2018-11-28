import { connect } from 'react-redux';

import { ArchiveSearch } from '../components';


function mapStateToProps(state) {
    return {
        search: {
            results: state.search.results || [],
        },
    };
}


const ArchiveSearchContainer = connect(mapStateToProps)(ArchiveSearch);

export default ArchiveSearchContainer;
