import React from 'react';

import Alert from '../common/alert.jsx';


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
        const { tags, title, description, filename, url } = detailsModel;

        const Errors = [];
        detailState.errors.forEach((errorMessage) => {
            Errors.push(Alert(errorMessage));
        });

        // FIXME: better behavior while loading
        return (
            <div id="archive-detail">
                {/* errors */}
                <div id="archive-detail-errors" className="row">
                    { Errors }
                </div>
                <div className="row">
                    {/* content */}
                    <div className={ `col-12 ${isExpanded || 'col-lg-6 order-lg-last'}` }>
                        <h2>{ isFetching ? 'loading...' : title }</h2>
                        { description ? <p>{ description }</p> : '' }
                        { tags ? <p><strong>Tags: </strong>{ tags }</p> : '' }
                    </div>
                    {/* img */}
                    <div className={ `col-12 ${isExpanded || 'col-lg-6'}` }>
                        <a href={ url } target="_blank">
                            <img
                                src={ url }
                                className="img-fluid border rounded w-100"
                                alt={ filename }
                            />
                        </a>
                        <p>
                            <a href={ url } download={ filename } target="_blank">
                                Download
                            </a>
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
