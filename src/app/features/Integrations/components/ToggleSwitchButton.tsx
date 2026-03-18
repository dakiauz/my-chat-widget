import React from 'react';

import './ToggleSwitchButton.css';

function ToggleSwitchButton({ items = [] }: { items: { id: number; name: string }[] }) {
    const [active, setActive] = React.useState(1);
    return (
        <div className="toggleButton">
            {items.map((item) => (
                <button key={item.id} className={`toggleButton__item ${active === item.id ? 'active' : ''}`} onClick={() => setActive(item.id)}>
                    {item.name}
                </button>
            ))}
        </div>
    );
}

export default ToggleSwitchButton;
