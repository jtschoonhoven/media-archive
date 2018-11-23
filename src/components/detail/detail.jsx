import React from 'react';


const EXAMPLE_DATA = {
    id: 'aaabbbccc',
    title: 'A Search Result',
    description: 'Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet.',
    img_url: 'https://i.imgur.com/gn2JN3f.jpg',
    tags: ['lorem', 'ipsum', 'dolor'],
};


class ArchiveDetail extends React.Component {
    constructor(props) {
        super(props);
        this.state = EXAMPLE_DATA;
    }

    render() {
        return (
            <div id="archive-detail">
                <div className="row">
                    {/* img */}
                    <div className="col-6">
                        <img src={this.state.img_url} className="img-fluid" alt={this.state.title} />
                    </div>
                    {/* content */}
                    <div className="col-6">
                        <h2>{this.state.title}</h2>
                        <p>{this.state.description}</p>
                    </div>
                </div>
                <p><strong>Tags: </strong>{this.state.tags.join(', ')}</p>
            </div>
        );
    }
}


export default ArchiveDetail;
