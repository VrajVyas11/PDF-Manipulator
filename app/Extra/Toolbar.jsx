import React from 'react'

const Toolbar = ({
    applyStyle,
    setFontSize,
    setFontFamily,
    undo,
    setHighlight,
    handleImageUpload,
    setTextColor,
    setBackgroundColor,
}) => {
    return (
        <div className="editor-container bg-slate-300 h-fit shadow-lg shadow-slate-600 rounded-xl overflow-hidden mt-4">
            <div className="toolbar flex justify-around items-center space-x-2 bg-slate-200 shadow-xl rounded-xl rounded-bl-none rounded-br-none px-9 py-2">
                <button onClick={() => applyStyle('bold')} className="px-3 py-1 bg-gray-400 rounded hover:bg-gray-300 font-bold">B</button>
                <button onClick={() => applyStyle('italic')} className="px-3.5 py-1 bg-gray-400 rounded hover:bg-gray-300 font-bold">I</button>
                <button onClick={() => applyStyle('underline')} className="px-3 py-1 bg-gray-400 rounded hover:bg-gray-300 font-bold">U</button>
                <button onClick={undo} className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300">Undo</button>
                <select onChange={(e) => setFontSize(e.target.value)} defaultValue="" className="px-2 py-1 bg-gray-200 rounded">
                    <option className='' value="">Font Size</option>
                    {[...Array(150)].map((_, i) => (
                        <option key={i} value={i + 1}>{i + 1}</option>
                    ))}
                </select>
                <select onChange={(e) => setFontFamily(e.target.value)} defaultValue="" className="px-2 py-1 bg-gray-200 rounded">
                    <option value="">Font Family</option>
                    {["Arial", "Courier New", "Georgia", "Times New Roman", "Verdana", "Impact", "Comic Sans MS"].map((font) => (
                        <option key={font} value={font}>{font}</option>
                    ))}
                </select>
                <input type="color" onChange={(e) => setTextColor(e.target.value)} className="px-2 py-1 border rounded" title="Text Color" />
                <input type="color" onChange={(e) => setBackgroundColor(e.target.value)} className="px-2 py-1 border rounded" title="Background Color" />
                <button onClick={setHighlight} className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300">Highlight</button>
                <button className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300">
                    <input
                        type="file"
                        id="imageUpload"
                        accept="image/*"
                        onChange={handleImageUpload}
                        style={{ display: 'none' }}
                    />
                    <span onClick={() => document.getElementById('imageUpload').click()}>
                        Insert Image
                    </span>

                </button>
            </div>


        </div>

    )
}

export default Toolbar