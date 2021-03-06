import './style.scss';

import * as React from 'react';
import * as History from 'history';
import ShowMore from 'react-show-more';
import { Dispatch } from 'redux';
import { FormikValues } from 'formik';
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
        const {
            tags,
            title,
            description,
            transcript,
            filename,
            url,
            path,
            isConfidential,
            canLicense,
        } = detailsModel;

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

                        {/* loading */}
                        <h2>{ isFetching ? 'loading...' : title }</h2>

                        {/* description */}
                        { description ? <p><ShowMore>{ description }</ShowMore></p> : <p className="text-muted"><em>No description.</em></p> }

                        {/* tags */}
                        { tags ? <p><strong>Tags: </strong>{ tags }</p> : '' }

                        {/* confidential */}
                        { typeof isConfidential === 'boolean' ? <p><strong>Confidential: </strong> { isConfidential ? 'yes' : 'no' }</p> : '' }

                        {/* licensable */}
                        { typeof canLicense === 'boolean' ? <p><strong>Licensable: </strong> { canLicense ? 'yes' : 'no' }</p> : '' }

                        {/* transcript */}
                        { transcript ? <p><strong>Transcript</strong><br /><ShowMore>{ transcript }</ShowMore></p> : <p className="text-muted"><em>No transcript.</em></p> }
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
                            <span className="text-muted">•</span>
                            <button onClick={ this.showEditableModal } className="btn btn-link">
                                Edit
                            </button>
                            <span className="text-muted d-none d-lg-inline">•</span>
                            <button onClick={ this.handleClick } className="d-none d-lg-inline btn btn-link">
                                { isExpanded ? 'View smaller' : 'View larger' }
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
            detailsModel,
            // validator
            (formValues: FormikValues) => {
                if (!formValues.title.trim()) {
                    return { title: 'Title cannot be empty.' };
                }
                return {};
            },
            // onConfirm
            (updatedDetailsModel) => {
                const fileId = this.getFileId();
                this.props.actions.updateFileDetail(fileId, updatedDetailsModel);
            },
        );
    }
}


export default ArchiveDetail;
