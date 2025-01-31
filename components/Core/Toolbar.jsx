"use client";

import React from "react";
import {
  Bold,
  Strikethrough,
  Italic,
  List,
  ListOrdered,
  Heading2,
  Underline,
  Quote,
  Undo,
  Redo,
  Code,
} from "lucide-react";

const Toolbar = ({
  editor,
  applyStyle,
  undo,
  redo,
  setFontSize,
  setFontFamily,
  setTextColor,
  setBackgroundColor,
  setHighlight,
  handleImageUpload,
}) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="px-4 h-fit py-3 rounded-tl-md rounded-tr-md flex justify-between items-start gap-5 w-full flex-wrap border border-gray-700">
      <div className="flex justify-start items-center gap-5 w-full  flex-wrap">
        <button onClick={() => applyStyle("bold")} className="text-blue-500 p-2 rounded-lg hover:bg-blue-100">
          <Bold className="w-5 h-5" />
        </button>
        <button onClick={() => applyStyle("italic")} className="text-blue-500 p-2 rounded-lg hover:bg-blue-100">
          <Italic className="w-5 h-5" />
        </button>
        <button onClick={() => applyStyle("underline")} className="text-blue-500 p-2 rounded-lg hover:bg-blue-100">
          <Underline className="w-5 h-5" />
        </button>
        <button onClick={() => applyStyle("strike")} className="text-blue-500 p-2 rounded-lg hover:bg-blue-100">
          <Strikethrough className="w-5 h-5" />
        </button>
        <button onClick={() => applyStyle("heading", 2)} className="text-blue-500 p-2 rounded-lg hover:bg-blue-100">
          <Heading2 className="w-5 h-5" />
        </button>
        <button onClick={() => applyStyle("bulletList")} className="text-blue-500 p-2 rounded-lg hover:bg-blue-100">
          <List className="w-5 h-5" />
        </button>
        <button onClick={() => applyStyle("orderedList")} className="text-blue-500 p-2 rounded-lg hover:bg-blue-100">
          <ListOrdered className="w-5 h-5" />
        </button>
        <button onClick={() => applyStyle("blockquote")} className="text-blue-500 p-2 rounded-lg hover:bg-blue-100">
          <Quote className="w-5 h-5" />
        </button>
        <button onClick={() => applyStyle("code")} className="text-blue-500 p-2 rounded-lg hover:bg-blue-100">
          <Code className="w-5 h-5" />
        </button>
        <button onClick={undo} className="text-blue-500 p-2 rounded-lg hover:bg-blue-100">
          <Undo className="w-5 h-5" />
        </button>
        <button onClick={redo} className="text-blue-500 p-2 rounded-lg hover:bg-blue-100">
          <Redo className="w-5 h-5" />
        </button>
      
        <select onChange={(e) => setFontSize(e.target.value)} className="px-2 py-1 bg-[linear-gradient(#0a1130c1,#0d1845a4)] text-blue-500 rounded">
          <option value="">Font Size</option>
          {[...Array(150)].map((_, i) => (
            <option key={i} value={i + 1}>{i + 1}</option>
          ))}
        </select>
        <select onChange={(e) => setFontFamily(e.target.value)} className="px-2 py-1 bg-[linear-gradient(#0a1130c1,#0d1845a4)] text-blue-500 rounded">
          <option value="">Font Family</option>
          {["Arial", "Courier New", "Georgia", "Times New Roman", "Verdana", "Impact", "Comic Sans MS"].map((font) => (
            <option key={font} value={font}>{font}</option>
          ))}
        </select>
        <input type="color" onChange={(e) => setTextColor(e.target.value)} className="px-2 py-1 border-2 border-blue-500 rounded" title="Text Color" />
        <input type="color" onChange={(e) => setBackgroundColor(e.target.value)} className="px-2 py-1 border-2 border-blue-500 rounded" title="Background Color" />
        <button onClick={setHighlight} className="px-2 py-1 bg-[linear-gradient(#0a1130c1,#0d1845a4)] text-blue-500 rounded hover:bg-blue-200">Highlight</button>
        <button className="px-2 py-1 bg-[linear-gradient(#0a1130c1,#0d1845a4)] text-blue-500 rounded hover:bg-blue-200">
          <input
            type="file"
            id="imageUpload"
            accept="image/*"
            onChange={handleImageUpload}
            style={{ display: 'none' }}
          />
          <span onClick={() => document.getElementById('imageUpload').click()}>Insert Image</span>
        </button>
      </div>
    </div>
  );
};

export default Toolbar;
