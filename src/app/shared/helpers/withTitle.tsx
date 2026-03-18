import React from 'react';

function withTitle(title: string, Component: React.FC): React.FC {
    document.title = `${title} - Dakia.ai`;

    return Component;
}

export default withTitle;
