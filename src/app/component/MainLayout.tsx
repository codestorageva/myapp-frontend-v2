// layout.tsx
"use client";
import { useEffect, useState } from "react";
import HeaderComponent from "./Header-main";
import Loader from "./Loader/Loader";

export default function OrgLayout({
  children,
  showSidebar = true,
  transparentBg = false,
}: {
  children: React.ReactNode;
  showSidebar?: boolean;
  transparentBg?: boolean;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 4000)
    return () => clearTimeout(timer);
  }, [])


  return (
    <div
      className={`flex flex-col h-screen ${transparentBg ? "bg-transparent" : ""
        }`}
      // style={{
      //   backgroundImage: !transparentBg ? "url('/assets/images/bg-new.png')" : "none",
      //   backgroundRepeat: "no-repeat",
      //   backgroundPosition: "center",
      //   backgroundSize: "cover",
      //   opacity: 0.4
      // }}
    >
      {/* <img src={'/assets/images/bg-new.png'} className="absolute w-full h-screen"></img> */}
      {!isLoading && <HeaderComponent />}
      {isLoading ? <div className="flex flex-1 items-center justify-center">
        <Loader isInside />
      </div> :
        <div className="flex flex-1 overflow-hidden">
          <main className={`flex-1 ${showSidebar ? "ml-5" : ""} overflow-y-auto`}>
            {children}
          </main>
        </div>}
    </div>
  );
}
