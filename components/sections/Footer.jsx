import React from "react";

export default function Footer() {
  return (
    <div className="mt-8 flex justify-center items-center gap-6 absolute bottom-3 left-0 w-full pt-8" >
      <div className="rounded-full text-xl footer-btn flex justify-center items-center">
        <img src="/discord.png" alt="" className="w-12" />
      </div>

      <div className="rounded-full text-xl footer-btn flex justify-center items-center">
        <img src="/twitter.png" alt="" className="w-12" />
      </div>

      <div className="rounded-full text-xl footer-btn flex justify-center items-center">
        <img src="/doc.png" alt="" className="w-12" />
      </div>
    </div>
  );
}
