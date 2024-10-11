import React from 'react';

const Toolbar = ({
    applyStyle,
    setFontSize,
    setFontFamily,
    undo,
    redo,
    setTextColor,
    setBackgroundColor,
    applyJustify,
    applyStrikethrough,
}) => {
    return (
        <div className=" h-fit shadow-lg rounded-xl overflow-hidden">
            {/* First Row: Text Style Buttons and Font Size */}
            <div className="justify-around flex items-center bg-gray-800 shadow-lg rounded-xl px-4 py-3 mb-2">
                {/* Text Style Buttons */}
                <div className="flex gap-4 space-x-2">
                    {['bold', 'italic', 'underline'].map((style) => (
                        <button 
                            key={style} 
                            onClick={() => applyStyle(style)} 
                            className={`${style=="italic"?"px-4":"px-3.5"} py-1 bg-blue-500 text-white rounded-lg transition duration-300 hover:bg-blue-400 shadow hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-300`}
                        >
                            {style.charAt(0).toUpperCase()}
                        </button>
                    ))}
                    <button 
                        onClick={applyStrikethrough} 
                        className="px-3 py-1 bg-blue-500 text-white rounded-lg transition duration-300 hover:bg-blue-400 shadow hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                    >
                        S
                    </button>
                    <button 
                        onClick={undo} 
                        className="px-5 py-1 bg-gray-600 text-white rounded-lg transition duration-300 hover:bg-gray-500 shadow hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
                    >
                        Undo
                    </button>
                    <button 
                        onClick={redo} 
                        className="px-5 py-1 bg-gray-600 text-white rounded-lg transition duration-300 hover:bg-gray-500 shadow hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
                    >
                        Redo
                    </button>
                </div>

                {/* Font Size and Family */}
                    <select 
                        onChange={(e) => setFontSize(e.target.value)} 
                        className="px-7 py-1 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                    >
                        <option value="">Font Size</option>
                        {[...Array(7)].map((_, i) => (
                            <option key={i} value={i + 1}>{i + 1}</option>
                        ))}
                    </select>

            </div>

            {/* Second Row: Color and Background Control, Text Alignment Controls */}
            <div className="justify-around flex items-center bg-gray-800 shadow-lg rounded-xl px-4 py-2">
                {/* Color and Background Control */}
                <select 
                        onChange={(e) => setFontFamily(e.target.value)} 
                        className="px-3 py-1 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                    >
                        <option value="">Font Family</option>
                        {["Arial", "Courier New", "Georgia", "Times New Roman", "Verdana", "Impact", "Comic Sans MS"].map((font) => (
                            <option key={font} value={font}>{font}</option>
                        ))}
                    </select>
                <div className="flex items-center ml-4">
                    <input 
                        type="color" 
                        onChange={(e) => setTextColor(e.target.value)} 
                        className="w-10 h-10 p-1 bg-transparent rounded-lg cursor-pointer transition duration-300 hover:shadow-lg focus:outline-none focus:ring-blue-300"
                        title="Text Color" 
                    />
                    <input 
                        type="color" 
                        onChange={(e) => setBackgroundColor(e.target.value)} 
                        className="w-10 h-10 p-1 bg-transparent rounded-lg cursor-pointer transition duration-300 hover:shadow-lg focus:outline-none focus:ring-blue-300"
                        title="Background Color" 
                    />
                </div>

                {/* Text Alignment Controls */}
                    {['left', 'center', 'right'].map((align) => (
                        <button 
                            key={align} 
                            onClick={() => applyJustify(align)} 
                            className="px-3 py-1 bg-gray-600 text-white rounded-lg transition duration-300 hover:bg-gray-500 shadow hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
                        >
                            {align.charAt(0).toUpperCase()} Align
                        </button>
                    ))}
            </div>
        </div>
    );
};

export default Toolbar;
