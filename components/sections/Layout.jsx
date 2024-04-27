import React from "react";
import MenuBar from "@/components/sections/Menu";
import Footer from "./Footer";

export default function Layout(props) {
  return (
    <div>
      <div className="flex items-center flex-col min-h-screen pt-[80px] pb-[120px] relative mx-2">
        <MenuBar />
        <div className="flex items-center flex-col w-full">{props.children}</div>
        <Footer />
      </div>
    </div>
  );
}
