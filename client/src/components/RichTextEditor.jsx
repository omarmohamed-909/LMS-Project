import React, { useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import MenuBar from "./Menu-bar";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";

const RichTextEditor = ({ input, setInput }) => {
  const handleChange = (content) => {
    setInput({ ...input, description: content });
  };

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          HTMLAttributes: { class: "list-disc ml-4" },
        },
        orderedList: {
          HTMLAttributes: { class: "list-decimal ml-4" },
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Highlight,
    ],
    content: input?.description || "",
    editorProps: {
      attributes: {
        class:
          "min-h-[160px] border rounded-md bg-slate-50 dark:bg-[#1F1F1F] py-3 px-3 mt-2 focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => {
      const htmlContent = editor.getHTML();
      handleChange(htmlContent);
    },
  });

  useEffect(() => {
    if (editor && input?.description !== editor.getHTML()) {
      editor.commands.setContent(input.description || "", false);
    }
  }, [editor, input?.description]);

  return (
    <div>
      {editor && <MenuBar editor={editor} />}
      <EditorContent editor={editor} className="tiptap-editor" />
    </div>
  );
};

export default RichTextEditor;
