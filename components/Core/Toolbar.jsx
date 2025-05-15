"use client";

import React, { useState } from "react";
import {
  Bold,
  Strikethrough,
  Italic,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Underline,
  Undo,
  Redo,
  Code,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link,
  Table,
  Indent,
  Outdent,
  CheckSquare,
  Type,
  PaintBucket,
  Palette,
  CircleDashed,
  FileImage,
  Highlighter,
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

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [showTooltip, setShowTooltip] = useState("");

  const ToolbarButton = ({ action, icon, label, args, color = "blue" }) => (
    <button
      onClick={() => applyStyle(action, args)}
      className={`p-1.5 sm:p-2 rounded-[10px] bg-${color}-600 bg-opacity-20 hover:bg-opacity-40 transition text-white shadow-sm flex items-center justify-center`}
      onMouseEnter={() => setShowTooltip(label)}
      onMouseLeave={() => setShowTooltip("")}
      aria-label={label}
      type="button"
    >
      <div className="relative">
        {React.cloneElement(icon, { size: 18, className: "pointer-events-none" })}
        {showTooltip === label && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap z-50 select-none pointer-events-none">
            {label}
          </div>
        )}
      </div>
    </button>
  );

  return (
    <div className="px-3 py-2 rounded-xl rounded-b-none flex flex-col sm:flex-row flex-wrap justify-center gap-2 sm:gap-3 w-full border border-gray-700 bg-[linear-gradient(#0a1130c1,#0d1845a4)] shadow-md  scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-300">
      <div className="flex flex-wrap w-full border-b border-gray-700 pb-2 sm:pb-3 justify-between gap-2 sm:gap-3">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <ToolbarButton action="bold" icon={<Bold />} label="Bold" />
          <ToolbarButton action="italic" icon={<Italic />} label="Italic" />
          <ToolbarButton action="underline" icon={<Underline />} label="Underline" />
          <ToolbarButton action="strike" icon={<Strikethrough />} label="Strikethrough" />
        </div>

        <div className="hidden sm:block h-8 w-px bg-gray-700 mx-1"></div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <ToolbarButton action="heading" icon={<Heading1 />} label="Heading 1" args={1} />
          <ToolbarButton action="heading" icon={<Heading2 />} label="Heading 2" args={2} />
          <ToolbarButton action="heading" icon={<Heading3 />} label="Heading 3" args={3} />
        </div>

        <div className="hidden sm:block h-8 w-px bg-gray-700 mx-1"></div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <ToolbarButton action="bulletList" icon={<List />} label="Bullet List" />
          <ToolbarButton action="orderedList" icon={<ListOrdered />} label="Numbered List" />
          <ToolbarButton action="indent" icon={<Indent />} label="Indent" />
          <ToolbarButton action="outdent" icon={<Outdent />} label="Outdent" />
        </div>

        <div className="hidden sm:block h-8 w-px bg-gray-700 mx-1"></div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <ToolbarButton action="alignLeft" icon={<AlignLeft />} label="Align Left" />
          <ToolbarButton action="alignCenter" icon={<AlignCenter />} label="Align Center" />
          <ToolbarButton action="alignRight" icon={<AlignRight />} label="Align Right" />
          <ToolbarButton action="alignJustify" icon={<AlignJustify />} label="Justify" />
        </div>

        <div className="hidden sm:block h-8 w-px bg-gray-700 mx-1"></div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <button
            onClick={undo}
            className="p-1.5 sm:p-2 rounded-[10px] bg-gray-600 bg-opacity-20 hover:bg-opacity-40 transition text-white shadow-sm"
            onMouseEnter={() => setShowTooltip("Undo")}
            onMouseLeave={() => setShowTooltip("")}
            aria-label="Undo"
            type="button"
          >
            <div className="relative">
              <Undo size={18} />
              {showTooltip === "Undo" && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap z-50 select-none pointer-events-none">
                  Undo
                </div>
              )}
            </div>
          </button>
          <button
            onClick={redo}
            className="p-1.5 sm:p-2 rounded-[10px] bg-gray-600 bg-opacity-20 hover:bg-opacity-40 transition text-white shadow-sm"
            onMouseEnter={() => setShowTooltip("Redo")}
            onMouseLeave={() => setShowTooltip("")}
            aria-label="Redo"
            type="button"
          >
            <div className="relative">
              <Redo size={18} />
              {showTooltip === "Redo" && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap z-50 select-none pointer-events-none">
                  Redo
                </div>
              )}
            </div>
          </button>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="flex flex-wrap w-full gap-2 sm:gap-3 items-center justify-between">
        {/* Font Family */}
        <div className="flex items-center mr-2 min-w-[140px] sm:min-w-[180px]">
          <div className="flex items-center gap-3 bg-blue-900 bg-opacity-30 px-2 py-2 rounded-[10px] w-full">
            <Type size={18} className="text-gray-300" />
            <select
              onChange={(e) => setFontFamily(e.target.value)}
              className="bg-transparent text-white text-sm focus:outline-none border-none w-full"
              aria-label="Font Family"
            >
              <option value="" className="bg-gray-800">
                Font Family
              </option>
              {[
                "Arial",
                "Helvetica",
                "Courier New",
                "Georgia",
                "Times New Roman",
                "Verdana",
                "Impact",
                "Comic Sans MS",
                "Tahoma",
                "Trebuchet MS",
              ].map((font) => (
                <option key={font} value={font} className="bg-gray-800">
                  {font}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Font Size */}
        <div className="flex items-center mr-2 min-w-[100px] sm:min-w-[120px]">
          <div className="flex items-center gap-3 bg-blue-900 bg-opacity-30 px-2 py-2 rounded-[10px] w-full">
            <span className="text-gray-300 text-sm whitespace-nowrap">Size</span>
            <select
              onChange={(e) => setFontSize(e.target.value)}
              className="bg-transparent text-white text-sm focus:outline-none border-none w-full"
              aria-label="Font Size"
            >
              {[8, 9, 10, 11, 12, 14, 18, 20, 24, 28, 32, 36, 40, 48, 60, 72].map((size) => (
                <option key={size} value={size} className="bg-gray-800">
                  {size}px
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="hidden sm:block h-8 w-px bg-gray-700 mx-1"></div>

        {/* Colors */}
        <div className="flex flex-wrap items-center gap-2 mr-2">
          {/* Text Color */}
          <div
            className="flex items-center gap-3 relative group"
            onMouseEnter={() => setShowTooltip("Text Color")}
            onMouseLeave={() => setShowTooltip("")}
          >
            <div className="flex items-center gap-3 bg-blue-900 bg-opacity-30 px-2 py-2 rounded-[10px]">
              <Palette size={18} className="text-gray-300" />
              <input
                type="color"
                onChange={(e) => setTextColor(e.target.value)}
                className="w-6 h-6 border-0 bg-transparent cursor-pointer"
                title="Text Color"
                aria-label="Text Color"
              />
            </div>
            {showTooltip === "Text Color" && (
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap z-50 select-none pointer-events-none">
                Text Color
              </div>
            )}
          </div>

          {/* Background Color */}
          <div
            className="flex items-center gap-3 relative group"
            onMouseEnter={() => setShowTooltip("Background Color")}
            onMouseLeave={() => setShowTooltip("")}
          >
            <div className="flex items-center gap-3 bg-blue-900 bg-opacity-30 px-2 py-2 rounded-[10px]">
              <PaintBucket size={18} className="text-gray-300" />
              <input
                type="color"
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="w-6 h-6 border-0 bg-transparent cursor-pointer"
                title="Background Color"
                aria-label="Background Color"
              />
            </div>
            {showTooltip === "Background Color" && (
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap z-50 select-none pointer-events-none">
                Background Color
              </div>
            )}
          </div>

          {/* Highlight */}
          <button
            onClick={setHighlight}
            className="flex items-center gap-3 bg-yellow-500 bg-opacity-20 hover:bg-opacity-40 px-2.5 py-2.5 rounded-[10px] transition"
            onMouseEnter={() => setShowTooltip("Highlight Text")}
            onMouseLeave={() => setShowTooltip("")}
            aria-label="Highlight Text"
            type="button"
          >
            <div className="relative">
              <Highlighter size={18} className="text-yellow-400" />
              {showTooltip === "Highlight Text" && (
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap z-50 select-none pointer-events-none">
                  Highlight Text
                </div>
              )}
            </div>
          </button>
        </div>

        <div className="hidden sm:block h-8 w-px bg-gray-700 mx-1"></div>

        {/* Special Formatting */}
        <div className="flex flex-wrap items-center gap-2 mr-2">
          <ToolbarButton action="code" icon={<Code />} label="Code" color="purple" />
          <ToolbarButton action="link" icon={<Link />} label="Insert Link" color="purple" />
          <ToolbarButton action="table" icon={<Table />} label="Insert Table" color="purple" />
        </div>

        <div className="hidden sm:block h-8 w-px bg-gray-700 mx-1"></div>

        {/* Insert Menu */}
        <div className="flex flex-wrap items-center gap-2">
          <div
            className="relative"
            onMouseEnter={() => setShowTooltip("Insert Image")}
            onMouseLeave={() => setShowTooltip("")}
          >
            <label
              htmlFor="imageUpload"
              className="cursor-pointer flex items-center gap-3 bg-green-600 bg-opacity-20 hover:bg-opacity-40 px-2 py-2 rounded-[10px] transition"
            >
              <FileImage size={18} className="text-green-400" />
            </label>
            <input
              type="file"
              id="imageUpload"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            {showTooltip === "Insert Image" && (
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap z-50 select-none pointer-events-none">
                Insert Image
              </div>
            )}
          </div>

          <ToolbarButton action="checkbox" icon={<CheckSquare />} label="Checkbox" color="green" />
          <ToolbarButton action="specialCharacter" icon={<CircleDashed />} label="Special Character" color="green" />
        </div>
      </div>
    </div>
  );
};

export default Toolbar;
