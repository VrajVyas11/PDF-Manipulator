// ColorSwatch Component
const ColorSwatch = ({
    color,
    active,
    onSelect,
}) => {
    const isTransparent = (c) =>
        c === 'transparent' ||
        /^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*0\s*\)$/i.test(c) ||
        (/^#([0-9a-f]{8})$/i.test(c) && c.slice(-2).toLowerCase() === '00') ||
        (/^#([0-9a-f]{4})$/i.test(c) && c.slice(-1).toLowerCase() === '0');

    const baseStyle = isTransparent(color)
        ? {
            backgroundColor: '#fff',
            backgroundImage:
                'linear-gradient(45deg, transparent 40%, red 40%, red 60%, transparent 60%)',
            backgroundSize: '100% 100%',
        }
        : { backgroundColor: color };

    return (
        <button
            title={color}
            className={`h-7 w-7 rounded-full border border-gray-600 ${active ? 'outline outline-2 outline-offset-2 outline-blue-500' : ''}`}
            style={baseStyle}
            onClick={() => onSelect(color)}
        />
    );
};

export default ColorSwatch