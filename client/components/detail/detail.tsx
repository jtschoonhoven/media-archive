import './style.scss';

import * as React from 'react';
import * as History from 'history';
import { Dispatch } from 'redux';
import { Link } from 'react-router-dom';

import Alert from '../common/alert';
import Breadcrumbs from '../common/breadcrumbs';
import DetailEditor from './editor';
import Image from './image';
import { DetailsState } from '../../reducers/detail';
import { DetailActions } from '../../containers/detail';

export interface Props {
    detailState: DetailsState;
    actions: DetailActions;
    location: History.Location;
    dispatch: Dispatch;
}

export interface State {
    isExpanded: boolean;
}


class ArchiveDetail extends React.Component<Props> {
    state: State = { isExpanded: false };

    constructor(props: Props) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
        this.showEditableModal = this.showEditableModal.bind(this);
    }

    componentDidMount() {
        this.fetchData();
    }

    render() {
        const detailState = this.props.detailState;
        const isExpanded = this.state.isExpanded;
        const isFetching = detailState.isFetching;
        const detailsModel = detailState.details;
        const { tags, title, description, filename, url, path } = detailsModel;

        const pathArray = path ? path.split('/') : [];
        const BreadCrumbs = pathArray.map((dirname, idx) => {
            return Breadcrumbs(pathArray, dirname, idx);
        });

        const Errors = [];
        detailState.errors.forEach((msg, idx) => {
            Errors.push(Alert(msg, { idx }));
        });

        // FIXME: better behavior while loading
        return (
            <div id="archive-detail">

                {/* breadcrumbs */}
                <nav id="archive-upload-breadcrumbs" aria-label="breadcrumb">
                    <ol className="breadcrumb">
                        <strong>
                            <Link to="/files">Files</Link>
                        </strong> &nbsp; / &nbsp;
                        { BreadCrumbs }
                    </ol>
                </nav>

                {/* errors */}
                <div id="archive-detail-errors" className="row">
                    { Errors }
                </div>
                <div className="row">

                    {/* content */}
                    <div className={ `col-12 ${isExpanded || 'col-lg-6 order-lg-last'}` }>
                        <h2>{ isFetching ? 'loading...' : title }</h2>
                        { description
                            ? <p>{ description }</p>
                            : <p className="text-muted"><em>No description.</em></p>
                        }
                        { tags ? <p><strong>Tags: </strong>{ tags }</p> : '' }
                    </div>

                    {/* img */}
                    <div className={ `col-12 ${isExpanded || 'col-lg-6'}` }>
                        <div className="archive-detail-image">
                            { Image(detailsModel) }
                        </div>

                        {/* options */}
                        <p>
                            <a href={ url } download={ filename } target="_blank" rel="noopener noreferrer" className="btn btn-link">
                                Download
                            </a>
                            <span className="text-muted d-none d-lg-inline">•</span>
                            <button onClick={ this.handleClick } className="d-none d-lg-inline btn btn-link">
                                { isExpanded ? 'View smaller' : 'View larger' }
                            </button>
                            <span className="text-muted d-none d-lg-inline">•</span>
                            <button onClick={ this.showEditableModal } className="d-none d-lg-inline btn btn-link">
                                Edit
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    getFileId() {
        const idStr = this.props.location.pathname.replace('/detail/', '');
        return parseInt(idStr, 10);
    }

    fetchData() {
        const fileId = this.getFileId();
        this.props.actions.getFileDetail(fileId);
    }

    handleClick() {
        this.setState({ isExpanded: !this.state.isExpanded });
    }

    showEditableModal() {
        const detailsModel = this.props.detailState.details;
        const modalTitle = `Editing "${detailsModel.title}"`;

        const getFormikJsx = () => {
            return <DetailEditor />;
        };

        this.props.actions.showEditableModal(
            modalTitle,
            getFormikJsx,
            detailsModel, // get initial values from detailsModel
            () => {
                // FIXME: add real validation
                if (Math.random() > 0.5) {
                    return { tags: 'bad thing!', title: 'nope!', description: 'wtf?!' };
                }
                return {};
            }, // validator
            () => {
                console.log('POST TO SERVER HERE');
            }, // onConfirm
        );
    }
}


export default ArchiveDetail;
