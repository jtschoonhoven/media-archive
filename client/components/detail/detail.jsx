import './style.scss';

import React from 'react';
import { Link } from 'react-router-dom'; // eslint-disable-line no-unused-vars

import Alert from '../common/alert.tsx';
import Breadcrumbs from '../common/breadcrumbs.jsx';
import Image from './image.jsx';


class ArchiveDetail extends React.Component {
    constructor(props) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
        this.state = { isExpanded: false };
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
