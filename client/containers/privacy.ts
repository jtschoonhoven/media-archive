import { connect } from 'react-redux';

import { ArchivePrivacy } from '../components';


const ArchivePrivacyContainer = connect<{}, {}, any>(() => ({}))(ArchivePrivacy);

export default ArchivePrivacyContainer;
