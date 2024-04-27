import React from "react";
import { copyToClipboard } from "@/utils";
import { toast } from "react-hot-toast";
import { FaCopy } from "react-icons/fa";

export default function CopyText({ text }) {
  const copied = () => {
    toast.success("copied!");
  };

  return (
    <p
      onClick={() => {
        copyToClipboard(text);
        copied();
      }}
      className="flex cursor-pointer"
    >
      {text}
      <FaCopy />
    </p>
  );
}
