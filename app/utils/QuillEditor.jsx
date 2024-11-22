"use client";
import React, { useEffect, useRef } from 'react';
import ReactQuill, { Quill } from 'react-quill';
import BlotFormatter from 'quill-blot-formatter';
import ImageResize from 'quill-image-resize-module-react';
import 'react-quill/dist/quill.snow.css';
Quill.register('modules/blotFormatter', BlotFormatter);
Quill.register('modules/imageResize', ImageResize);
const Size = Quill.import("formats/size");
Size.whitelist = ["extra-small", "small", "medium", "large"];
Quill.register(Size, true);
const Font = Quill.import("formats/font");
Font.whitelist = [
  "arial",
  "comic-sans",
  "courier-new",
  "georgia",
  "helvetica",
  "lucida"
];
Quill.register(Font, true);
const Editor = ({ value, onChange, placeholder }) => {
  const quillRef = useRef(null);
  useEffect(() => {
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      quill.format('color', '#000000');
    }
  }, []);
  return (
    <div className="container font-sans px-1">
      <div className="flex justify-center">
        <div className="w-full max-w-md sm:max-w-full lg:max-w-3xl shadow-sm">
          <ReactQuill
            ref={quillRef}
            value={value}
            onChange={onChange}
            modules={Editor.modules}
            formats={Editor.formats}
            placeholder={placeholder}
            style={{
              minHeight: '150px',
              borderRadius: '8px',
            }}
            className="text-black bg-white rounded-lg shadow-lg"
          />
        </div>
      </div>
    </div>
  );
};
Editor.modules = {
  toolbar: [
    [{ 'font': [] }, { 'size': [] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'color': ['#000000', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffffff'] },
    { 'background': ['#ffffff', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'] }],
    [{ 'script': 'super' }, { 'script': 'sub' }],
    [{ 'header': [1, 2, false] }, 'blockquote', 'code-block'],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
    [{ 'align': [] }],
    ['link', 'image', 'video', 'formula'],
    ['clean']
  ],
  imageResize: {
    parchment: Quill.import('parchment'),
    modules: ['Resize', 'DisplaySize'],
  },
  blotFormatter: {},
};
Editor.formats = [
  'header', 'font', 'size', 'bold', 'italic', 'underline', 'strike',
  'blockquote', 'list', 'bullet', 'indent', 'link', 'image', 'video',
  'color', 'background', 'script', 'align',
];
export default Editor;