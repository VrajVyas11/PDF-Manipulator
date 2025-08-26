"use client";
import React, { useEffect, useRef, useMemo } from "react";
import ReactQuill, { Quill } from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import BlotFormatter from "quill-blot-formatter";
import ImageResize from "quill-image-resize-module-react";

// Guard repeated registration
if (typeof window !== "undefined") {
  // some Quill builds might have already registered; use try/catch to avoid errors
  try {
    // register modules safely only once
    if (!Quill.imports || !Quill.imports["formats/size"]) {
      // ensure Size exists before customizing
      const Size = Quill.import ? Quill.import("formats/size") : null;
      if (Size) {
        Size.whitelist = ["extra-small", "small", "medium", "large"];
        Quill.register(Size, true);
      }
    }

    if (!Quill.imports || !Quill.imports["formats/font"]) {
      const Font = Quill.import ? Quill.import("formats/font") : null;
      if (Font) {
        Font.whitelist = [
          "arial",
          "comic-sans",
          "courier-new",
          "georgia",
          "helvetica",
          "lucida",
        ];
        Quill.register(Font, true);
      }
    }

    // register modules (blotFormatter and imageResize)
    // wrap each registration so duplicate registration is ignored
    try {
      Quill.register("modules/blotFormatter", BlotFormatter);
    } catch {
      // ignore duplicate registration
    }
    try {
      Quill.register("modules/imageResize", ImageResize);
    } catch {
      // ignore duplicate registration
    }
  } catch {
    // best effort — ignore if imports aren't present yet
    // don't throw so app doesn't crash
    // console.warn("Quill registration warning:", err);
  }
}

const Editor = ({ value, onChange, placeholder, classes, radius = "" }) => {
  const quillRef = useRef(null);

  // memoize modules and formats so objects don't change each render
  const modules = useMemo(
    () => ({
      toolbar: [
        [{ font: [] }, { size: [] }],
        ["bold", "italic", "underline", "strike"],
        [
          {
            color: [
              "#000000",
              "#ff0000",
              "#00ff00",
              "#0000ff",
              "#ffff00",
              "#ff00ff",
              "#00ffff",
              "#ffffff",
            ],
          },
          {
            background: [
              "#ffffff",
              "#ff0000",
              "#00ff00",
              "#0000ff",
              "#ffff00",
              "#ff00ff",
              "#00ffff",
            ],
          },
        ],
        [{ script: "super" }, { script: "sub" }],
        [{ header: [1, 2, false] }, "blockquote", "code-block"],
        [{ list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }],
        [{ align: [] }],
        ["link", "image", "video", "formula"],
        ["clean"],
      ],
      imageResize: {
        parchment: Quill.import ? Quill.import("parchment") : undefined,
        modules: ["Resize", "DisplaySize"],
      },
      blotFormatter: {},
    }),
    []
  );

  const formats = useMemo(
    () => [
      "header",
      "font",
      "size",
      "bold",
      "italic",
      "underline",
      "strike",
      "blockquote",
      "list", // list covers both 'ordered' and 'bullet'
      "indent",
      "link",
      "image",
      "video",
      "color",
      "background",
      "script",
      "align",
    ],
    []
  );

  // set a default color once when editor mounts; avoid causing rerenders
  useEffect(() => {
    const setDefaultColor = () => {
      try {
        if (quillRef.current && quillRef.current.getEditor) {
          const quill = quillRef.current.getEditor();
          // only format if editor is ready and has a selection
          // this is non-destructive and won't cause React state changes
          quill.format("color", "#000000");
        }
      } catch {
        // harmless if editor not ready
      }
    };
    setDefaultColor();
  }, []);

  return (
    <ReactQuill
      ref={quillRef}
      value={value}
      onChange={onChange}
      modules={modules}
      formats={formats}
      placeholder={placeholder}
      style={{
        minHeight: "450px",
        borderRadius: radius,
        color: "black",
        width: "100%",
      }}
      className={`text-black bg-white rounded-3xl shadow-lg ${classes || ""}`}
    />
  );
};

export default Editor;