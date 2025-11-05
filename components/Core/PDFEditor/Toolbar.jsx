"use client";

import React, { useRef, useState } from "react";
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
  FileImage,
  Highlighter,
  Check,
  ChevronDown,
  ALargeSmall,
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
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [showTooltip, setShowTooltip] = useState("");
  const [fontFamilyDropdownOpen, setFontFamilyDropdownOpen] = useState(false);
  const [fontSizeDropdownOpen, setFontSizeDropdownOpen] = useState(false);
  const [currentFontFamily, setCurrentFontFamily] = useState("");
  const [currentFontSize, setCurrentFontSize] = useState("14");
  const textColorInputRef = useRef()
  const bgColorInputRef = useRef()
  const fonts = [
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
  ];
  const sizes = [8, 9, 10, 11, 12, 14, 16, 20, 24, 28, 32, 36, 40, 48, 60, 72];
  if (!editor) {
    return null;
  }

  const FontFamilyDropdown = () => (
    <div
      style={{ scrollbarWidth: "thin" }}
      className="absolute top-full left-0 mt-2 bg-gray-950/95 border border-slate-700/30 rounded-xl shadow-2xl z-50 min-w-full overflow-hidden max-h-72 overflow-y-auto">
      <button
        onClick={() => {
          setFontFamily("");
          setCurrentFontFamily("");
          setFontFamilyDropdownOpen(false);
        }}
        className={`w-full px-4 py-3 text-left text-sm text-slate-300 hover:bg-slate-700/50 transition-all duration-300 flex items-center space-x-3 ${!currentFontFamily ? "bg-blue-900/30 text-white" : ""}`}
      >
        <Check strokeWidth={3} size={16} className={`transition-opacity ${!currentFontFamily ? "opacity-100" : "opacity-0"}`} />
        <span>Font Family</span>
      </button>
      {fonts.map((font) => (
        <button
          key={font}
          onClick={() => {
            setFontFamily(font);
            setCurrentFontFamily(font);
            setFontFamilyDropdownOpen(false);
          }}
          className={`w-full px-4 py-3 text-left text-sm text-slate-300 hover:bg-slate-700/50 transition-all duration-300 flex items-center space-x-3 ${currentFontFamily === font ? "bg-blue-900/30 text-white" : ""}`}
        >
          <Check strokeWidth={3} size={16} className={`transition-opacity ${currentFontFamily === font ? "opacity-100" : "opacity-0"}`} />
          <span style={{ fontFamily: font }} className="text-sm">{font}</span>
        </button>
      ))}
    </div>
  );

  const FontSizeDropdown = () => (
    <div style={{ scrollbarWidth: "thin" }} className="absolute top-full right-0 mt-2 bg-gray-950/95 border border-slate-700/30 rounded-xl shadow-2xl z-50 min-w-full overflow-hidden max-h-72 overflow-y-auto">
      {sizes.map((size) => (
        <button
          key={size}
          onClick={() => {
            setFontSize(size.toString());
            setCurrentFontSize(size.toString());
            setFontSizeDropdownOpen(false);
          }}
          className={`w-full px-4 py-3 text-left text-sm text-slate-300 hover:bg-slate-700/50 transition-all duration-300 flex items-center justify-between ${currentFontSize === size.toString() ? "bg-blue-900/30 text-white" : ""}`}
        >
          <span>{size}px</span>
          <Check strokeWidth={3} size={16} className={`ml-3 transition-opacity ${currentFontSize === size.toString() ? "opacity-100" : "opacity-0"}`} />
        </button>
      ))}
    </div>
  );

  const ToolbarButton = ({ action, icon, label, args }) => (
    <button
      onClick={() => applyStyle(action, args)}
      className={`p-1.5 sm:p-3 rounded-xl  hover:bg-slate-700/50 transition-all duration-300 text-slate-300 shadow-[inset_0_0_5px_rgba(200,200,200,0.3)] flex items-center justify-center`}
      onMouseEnter={() => setShowTooltip(label)}
      onMouseLeave={() => setShowTooltip("")}
      aria-label={label}
      type="button"
    >
      <div className="relative">
        {React.cloneElement(icon, { size: 16, className: "pointer-events-none", strokeWidth: 3 })}
        {showTooltip === label && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-slate-950 text-slate-300 text-xs rounded whitespace-nowrap z-50 select-none pointer-events-none">
            {label}
          </div>
        )}
      </div>
    </button>
  );

  return (
    <div className="flex w-full flex-col rounded-3xl h-fit p-4 space-y-4 bg-black/60 text-white font-mono">
      <div className="flex flex-wrap gap-y-2 items-center w-full border-b border-slate-700/30 pb-2 sm:pb-3 justify-between">
        {/* Font Family */}
        <div className="flex items-center mr-2 min-w-[140px] sm:min-w-[180px] relative">
          <div className="relative">
            <button
              onClick={() => setFontFamilyDropdownOpen(!fontFamilyDropdownOpen)}
              className={`p-2 px-4 gap-4 rounded-xl min-w-fit flex-row flex items-center transition-all duration-300 flex-shrink-0 ${fontFamilyDropdownOpen ? ' !shadow-[inset_0_0_5px_rgba(147,197,253,0.6)] text-blue-300  ' : 'hover:bg-slate-700/30 !shadow-[inset_0_0_5px_rgba(200,200,200,0.3)] text-slate-300'}`}
              title="Text Markup"
            >
              <span className=" text-sm whitespace-nowrap"><Type strokeWidth={3} size={16} /></span>

              <span>{currentFontFamily || "Font Family"}</span>
              <ChevronDown strokeWidth={3} size={12} className={`ml-1 ${fontFamilyDropdownOpen ? "rotate-180" : ""}`} />
            </button>
            {fontFamilyDropdownOpen && <FontFamilyDropdown />}
          </div>
        </div>

        {/* Font Size */}
        <div className="flex items-center mr-2 min-w-[100px] sm:min-w-[120px] relative">
          <div className="relative">
            <button
              onClick={() => setFontSizeDropdownOpen(!fontSizeDropdownOpen)}
              className={`p-2 px-4 gap-4 rounded-xl min-w-fit flex-row flex items-center transition-all duration-300 flex-shrink-0 ${fontSizeDropdownOpen ? ' !shadow-[inset_0_0_5px_rgba(252,211,77,0.6)] text-amber-300  ' : 'hover:bg-slate-700/30 !shadow-[inset_0_0_5px_rgba(200,200,200,0.3)] text-slate-300'}`}
              title="Text Markup"
            >
              <span className=" text-sm whitespace-nowrap"><ALargeSmall strokeWidth={3} size={16} /></span>

              <span>{currentFontSize}px</span>
              <ChevronDown strokeWidth={3} size={12} className={`ml-1 ${fontSizeDropdownOpen ? "rotate-180" : ""}`} />
            </button>
            {fontSizeDropdownOpen && <FontSizeDropdown />}
          </div>
        </div>

        <div className="hidden sm:block h-8 w-px bg-slate-700/30 mx-1"></div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <ToolbarButton action="bold" icon={<Bold />} label="Bold" />
          <ToolbarButton action="italic" icon={<Italic />} label="Italic" />
          <ToolbarButton action="underline" icon={<Underline />} label="Underline" />
          <ToolbarButton action="strike" icon={<Strikethrough />} label="Strikethrough" />
        </div>

        <div className="hidden sm:block h-8 w-px bg-slate-700/30 mx-1"></div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <ToolbarButton action="heading" icon={<Heading1 />} label="Heading 1" args={1} />
          <ToolbarButton action="heading" icon={<Heading2 />} label="Heading 2" args={2} />
          <ToolbarButton action="heading" icon={<Heading3 />} label="Heading 3" args={3} />
        </div>
        <div className="hidden sm:block h-8 w-px bg-slate-700/30 mx-1"></div>

        {/* Insert Menu */}
        <div className="flex flex-wrap items-center gap-2">
          <div
            className="relative"
            onMouseEnter={() => setShowTooltip("Insert Image")}
            onMouseLeave={() => setShowTooltip("")}
          >
            <label
              htmlFor="imageUpload"
              className="cursor-pointer p-3 flex items-center gap-3  hover:bg-slate-700/50  rounded-xl transition-all duration-300 shadow-[inset_0_0_5px_rgba(200,200,200,0.3)]"
            >
              <FileImage strokeWidth={3} size={16} className="text-slate-300" />
            </label>
            <input
              type="file"
              id="imageUpload"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            {showTooltip === "Insert Image" && (
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-slate-950 text-slate-300 text-xs rounded whitespace-nowrap z-50 select-none pointer-events-none">
                Insert Image
              </div>
            )}
          </div>

          <ToolbarButton action="checkbox" icon={<CheckSquare />} label="Checkbox" color="green" />
        </div>
        <div className="hidden sm:block h-8 w-px bg-slate-700/30 mx-1"></div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <button
            onClick={undo}
            className="p-1.5 sm:p-3 rounded-xl  hover:bg-slate-700/50 transition-all duration-300 text-slate-300 shadow-[inset_0_0_5px_rgba(200,200,200,0.3)]"
            onMouseEnter={() => setShowTooltip("Undo")}
            onMouseLeave={() => setShowTooltip("")}
            aria-label="Undo"
            type="button"
          >
            <div className="relative">
              <Undo strokeWidth={3} size={16} />
              {showTooltip === "Undo" && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-slate-950 text-slate-300 text-xs rounded whitespace-nowrap z-50 select-none pointer-events-none">
                  Undo
                </div>
              )}
            </div>
          </button>
          <button
            onClick={redo}
            className="p-1.5 sm:p-3 rounded-xl  hover:bg-slate-700/50 transition-all duration-300 text-slate-300 shadow-[inset_0_0_5px_rgba(200,200,200,0.3)]"
            onMouseEnter={() => setShowTooltip("Redo")}
            onMouseLeave={() => setShowTooltip("")}
            aria-label="Redo"
            type="button"
          >
            <div className="relative">
              <Redo strokeWidth={3} size={16} />
              {showTooltip === "Redo" && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-slate-950 text-slate-300 text-xs rounded whitespace-nowrap z-50 select-none pointer-events-none">
                  Redo
                </div>
              )}
            </div>
          </button>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="flex flex-wrap w-full gap-2 sm:gap-3 items-center justify-between">
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <ToolbarButton action="bulletList" icon={<List />} label="Bullet List" />
          <ToolbarButton action="orderedList" icon={<ListOrdered />} label="Numbered List" />
          <ToolbarButton action="indent" icon={<Indent />} label="Indent" />
          <ToolbarButton action="outdent" icon={<Outdent />} label="Outdent" />
        </div>
        <div className="hidden sm:block h-8 w-px bg-slate-700/30 mx-1"></div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <ToolbarButton action="alignLeft" icon={<AlignLeft />} label="Align Left" />
          <ToolbarButton action="alignCenter" icon={<AlignCenter />} label="Align Center" />
          <ToolbarButton action="alignRight" icon={<AlignRight />} label="Align Right" />
          <ToolbarButton action="alignJustify" icon={<AlignJustify />} label="Justify" />
        </div>
        <div className="hidden sm:block h-8 w-px bg-slate-700/30 mx-1"></div>

        {/* Colors */}
        <div className="flex flex-wrap items-center gap-2 mr-2">
          {/* Text Color */}
          <div
            className="flex items-center gap-3 relative group"
            onMouseEnter={() => setShowTooltip("Text Color")}
            onMouseLeave={() => setShowTooltip("")}
          >
            <div className="flex p-3 relative hover:bg-slate-700/30 !shadow-[inset_0_0_5px_rgba(200,200,200,0.3)] text-slate-300 items-center justify-center gap-3  rounded-xl">
              <Palette
                strokeWidth={3} size={16} />
              <div
                onClick={() => textColorInputRef.current?.click()}
                style={{ backgroundColor: textColorInputRef?.current?.value ?? "#000000" }}
                className=" h-5 w-5 !shadow-[inset_0_0_5px_rgba(200,200,200,0.2)] cursor-pointer relative rounded-full">{" "}</div>

              <input
                ref={textColorInputRef}
                type="color"
                onChange={(e) => setTextColor(e.target.value)}
                className="absolute inset-0 w-6 h-6 opacity-0 cursor-pointer"
                title="Text Color"
                aria-label="Text Color"
              />
            </div>
            {showTooltip === "Text Color" && (
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-slate-950 text-slate-300 text-xs rounded whitespace-nowrap z-50 select-none pointer-events-none">
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
            <div className="flex p-3 relative hover:bg-slate-700/30 !shadow-[inset_0_0_5px_rgba(200,200,200,0.3)] text-slate-300 items-center justify-center gap-3  rounded-xl">
              <PaintBucket
                strokeWidth={3} size={16} />
              <div
                onClick={() => bgColorInputRef.current?.click()}
                style={{ backgroundColor: bgColorInputRef?.current?.value ?? "#000000" }}
                className=" h-5 w-5 !shadow-[inset_0_0_5px_rgba(200,200,200,0.2)]  cursor-pointer relative rounded-full">{" "}</div>

              <input
                ref={bgColorInputRef}
                type="color"
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="absolute inset-0 w-6 h-6 opacity-0 cursor-pointer"
                title="Background Color"
                aria-label="Background Color"
              />
            </div>
            {showTooltip === "Background Color" && (
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-slate-950 text-slate-300 text-xs rounded whitespace-nowrap z-50 select-none pointer-events-none">
                Background Color
              </div>
            )}
          </div>

          {/* Highlight */}
          <button
            onClick={setHighlight}
            className="flex items-center gap-3 hover:bg-amber-500/20  p-3 rounded-xl transition-all duration-300 shadow-[inset_0_0_5px_rgba(252,211,77,0.3)]"
            onMouseEnter={() => setShowTooltip("Highlight Text")}
            onMouseLeave={() => setShowTooltip("")}
            aria-label="Highlight Text"
            type="button"
          >
            <div className="relative">
              <Highlighter strokeWidth={3} size={16} className="text-amber-300" />
              {showTooltip === "Highlight Text" && (
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-slate-950 text-slate-300 text-xs rounded whitespace-nowrap z-50 select-none pointer-events-none">
                  Highlight Text
                </div>
              )}
            </div>
          </button>
        </div>

        <div className="hidden sm:block h-8 w-px bg-slate-700/30 mx-1"></div>

        {/* Special Formatting */}
        <div className="flex flex-wrap items-center gap-2 mr-2">
          <ToolbarButton action="code" icon={<Code />} label="Code" color="purple" />
          <ToolbarButton action="link" icon={<Link />} label="Insert Link" color="purple" />
          <ToolbarButton action="table" icon={<Table />} label="Insert Table" color="purple" />
        </div>
      </div>
    </div>
  );
};

export default Toolbar;