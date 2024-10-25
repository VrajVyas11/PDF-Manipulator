"use client";
import React, { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

const Editor = ({ value, onChange, placeholder }) => {
  const quillRef = useRef(null);
  const [isBrowser, setIsBrowser] = useState(false);

  useEffect(() => {
    setIsBrowser(typeof window !== "undefined");
  }, []);

  useEffect(() => {
    if (isBrowser) {
      const Quill = require('quill');
      const BlotFormatter = require('quill-blot-formatter');
      const ImageResize = require('quill-image-resize-module-react');

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

      const quill = quillRef.current.getEditor();
      quill.format('color', '#000000'); // Set default color to black
    }
  }, [isBrowser]);

  return isBrowser ? (
    <div className="container mx-auto p-6 font-sans">
      <div className="flex justify-center">
        <div className="w-full max-w-3xl shadow-sm">
          <ReactQuill
            ref={quillRef}
            value={value}
            onChange={onChange}
            modules={Editor.modules}
            formats={Editor.formats}
            placeholder={placeholder}
            style={{ minHeight: '200px', padding: '10px' }}
          />
        </div>
      </div>
    </div>
  ) : null;
};

Editor.modules = {
  toolbar: [
    [{ 'font': [] }, { 'size': [] }],
    ['bold', 'italic', 'underline', 'strike'],
    [
      {
        'color': ['#000000', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffffff']
      },
      { 'background': ['#ffffff', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'] }
    ],
    [{ 'script': 'super' }, { 'script': 'sub' }],
    [{ 'header': [1, 2, false] }, 'blockquote', 'code-block'],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
    [{ 'align': [] }],
    ['link', 'image', 'video', 'formula'],
    ['clean']
  ],
  imageResize: {
    parchment: require('parchment'),
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
