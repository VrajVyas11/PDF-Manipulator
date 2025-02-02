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
  Image as ImageIcon,
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
    <div className="px-4 py-3 rounded-xl rounded-b-none flex flex-wrap justify-between gap-3 w-full border border-gray-700 bg-[linear-gradient(#0a1130c1,#0d1845a4)] shadow-md">
      {/* Formatting Buttons */}
      <div className="flex flex-wrap w-full justify-around gap-3">
        {[
          { action: "bold", icon: <Bold /> },
          { action: "italic", icon: <Italic /> },
          { action: "underline", icon: <Underline /> },
          { action: "strike", icon: <Strikethrough /> },
          { action: "heading", icon: <Heading2 />, args: 2 },
          { action: "bulletList", icon: <List /> },
          { action: "orderedList", icon: <ListOrdered /> },
          { action: "blockquote", icon: <Quote /> },
          { action: "code", icon: <Code /> },
        ].map(({ action, icon, args }, index) => (
          <button
            key={index}
            onClick={() => applyStyle(action, args)}
            className="p-2  bg-opacity-10 rounded-xl bg-blue-600 hover:bg-blue-700 transition text-white shadow-md"
          >
            {icon}
          </button>
        ))}

        {/* Undo / Redo */}
        <button onClick={undo} className="p-2 rounded-xl bg-opacity-10 bg-gray-600 hover:bg-gray-700 transition text-white shadow-md">
          <Undo />
        </button>
        <button onClick={redo} className="p-2 rounded-xl bg-opacity-10 bg-gray-600 hover:bg-gray-700 transition text-white shadow-md">
          <Redo />
        </button>
      </div>

      {/* Dropdowns & Inputs */}
      <div className="flex flex-wrap w-full justify-around gap-3">
        {/* Font Size */}
        <select
          onChange={(e) => setFontSize(e.target.value)}
          className="px-3 py-2 bg-opacity-10 bg-blue-600 text-white rounded-xl shadow-md"
        >
          <option value="">Font Size</option>
          {[10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 50, 60, 72].map((size) => (
            <option key={size} value={size}>
              {size}px
            </option>
          ))}
        </select>

        {/* Font Family */}
        <select
          onChange={(e) => setFontFamily(e.target.value)}
          className="px-3 py-2 bg-opacity-10 bg-blue-600 text-white rounded-xl shadow-md"
        >
          <option value="">Font Family</option>
          {["Arial", "Courier New", "Georgia", "Times New Roman", "Verdana", "Impact", "Comic Sans MS"].map((font) => (
            <option key={font} value={font}>
              {font}
            </option>
          ))}
        </select>

        {/* Text Color */}
        <input
          type="color"
          onChange={(e) => setTextColor(e.target.value)}
          className="w-10 h-10 border-2 bg-opacity-10 border-gray-500 rounded-xl cursor-pointer"
          title="Text Color"
        />

        {/* Background Color */}
        <input
          type="color"
          onChange={(e) => setBackgroundColor(e.target.value)}
          className="w-10 h-10 border-2 bg-opacity-10 border-gray-500 rounded-xl cursor-pointer"
          title="Background Color"
        />

        {/* Highlight Button */}
        <button
          onClick={setHighlight}
          className="px-4 py-2 bg-blue-600 bg-opacity-10 text-white font-semibold rounded-xl shadow-md hover:bg-yellow-600 transition"
        >
          Highlight
        </button>

        {/* Image Upload */}
        <button
          className="px-4 py-2 bg-green-600 bg-opacity-10 text-white font-semibold rounded-xl shadow-md hover:bg-green-700 transition"
        >
          <label htmlFor="imageUpload" className="cursor-pointer bg-opacity-10 flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            Insert Image
          </label>
          <input
            type="file"
            id="imageUpload"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </button>
      </div>
    </div>
  );
};

export default Toolbar;
