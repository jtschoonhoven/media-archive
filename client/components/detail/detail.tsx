import './style.scss';

import * as React from 'react';
import * as History from 'history';
import { Dispatch } from 'redux';
import { Link } from 'react-router-dom';

import Alert from '../common/alert';
import Breadcrumbs from '../common/breadcrumbs';
import Image from './image.jsx';
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
                        <p>
                            <a href={ url } download={ filename } target="_blank">
                                Download
                            </a>
                            {/* options */}
                            <span className="text-muted d-none d-lg-inline"> • </span>
                            <a href="#" onClick={ this.handleClick } className="d-none d-lg-inline">
                                { isExpanded ? 'View smaller' : 'View larger' }
                            </a>
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
}


export default ArchiveDetail;
