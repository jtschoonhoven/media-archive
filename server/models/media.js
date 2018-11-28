const EXAMPLE_DATA = {
    1: {
        id: 'aaabbbccc',
        title: 'Scientists shocked by tiny monkey',
        fileName: 'a_search_result.png',
        description: 'Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet.',
        imgUrl: 'https://i.imgur.com/gn2JN3f.jpg',
        fileUrl: 'https://i.imgur.com/gn2JN3f.jpg',
        tags: ['lorem', 'ipsum', 'dolor'],
    },
};

class Media {
    get(id) {
        return EXAMPLE_DATA[id] || {};
    }
}

module.exports = Media;
