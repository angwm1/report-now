// File: /src/components/NavBar.js
"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import UserDropdown from "./UserDropdown";
import { redirect, usePathname } from "next/navigation";
import Image from "next/image"; // Add this import at the top

export default function NavBar() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname(); // 获取当前路径

  const toggleMenu = () => {
    setMobileMenuOpen((prev) => !prev);
  };

  // 检查链接是否为当前活跃页面
  const isActive = (path) => {
    // 特殊处理 /issues 路径，防止在子页面也高亮
    if (path === "/issues" && pathname !== "/issues") {
      // 如果是 /issues 链接但当前路径不是精确的 /issues，返回false
      return false;
    }
    
    // 精确匹配根路径
    if (path === "/" && pathname === "/") {
      return true;
    }
    
    // 对于其他路径，使用 startsWith 检查是否为当前页面或子页面
    return path !== "/" && pathname.startsWith(path);
  };

  // 生成链接样式
  const getLinkStyle = (path) => {
    return isActive(path) 
      ? "text-accent-500 font-bold"
      : "hover:text-accent-500 text-gray-600"; 
  };

  return (
    <nav className="bg-white shadow">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo / Brand */}
        <Link href="/issues" className="flex items-center space-x-2 text-xl font-bold text-gray-800">
        <div className="flex items-center justify-center"> {/* Add padding around the image */}
            <Image
              src="/ReportNow.png" 
              alt="ReportNow Logo"
              width={54} /* Slightly reduced to account for padding */
              height={54}
              className="object-contain"
            />
          </div>
          <span className="flex items-center h-[54px]">ReportNow</span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex space-x-6">
          <Link href="/issues" className={getLinkStyle("/issues")}>
            View Issues
          </Link>
          <Link href="/issues/map" className={getLinkStyle("/issues/map")}>
            Map
          </Link>
          <Link href="/issues/report" className={getLinkStyle("/issues/report")}>
            Report Issue
          </Link>
          <Link href="/issues/my" className={getLinkStyle("/issues/my")}>
            My Issues
          </Link>
        </div>

        {/* Right side: Auth & User */}
        <div className="flex items-center space-x-4">
          {session ? (
            <UserDropdown session={session} />
          ) : (
            <button
              onClick={() => redirect("/")}
              className="bg-primary-500 text-white px-4 py-2 rounded hover:bg-accent-600 transition"
            >
              Sign In
            </button>
          )}

          {/* Mobile menu button */}
          <button
            onClick={toggleMenu}
            aria-label="Toggle navigation"
            className="md:hidden focus:outline-none"
          >
            <svg
              className="w-6 h-6 text-gray-800"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Navigation Links */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white shadow">
          <div className="px-4 py-2 flex flex-col space-y-2">
            <Link
              href="/issues"
              onClick={() => setMobileMenuOpen(false)}
              className={getLinkStyle("/issues")}
            >
              View Issues
            </Link>
            <Link
              href="/issues/map"
              onClick={() => setMobileMenuOpen(false)}
              className={getLinkStyle("/issues/map")}
            >
              Map
            </Link>
            <Link
              href="/issues/report"
              onClick={() => setMobileMenuOpen(false)}
              className={getLinkStyle("/issues/report")}
            >
              Report Issue
            </Link>
            <Link
              href="/issues/my"
              onClick={() => setMobileMenuOpen(false)}
              className={getLinkStyle("/issues/my")}
            >
              My Issues
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
