"use client";

import { signOut } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { FaUser, FaSignOutAlt, FaCog } from "react-icons/fa";

export default function UserDropdown({ session }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef(null); // 创建一个引用

  const handleManageAccount = () => {
    setOpen(false);
    router.push("/account");
  };

  // Close dropdown on click outside or on Escape key
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const displayName = session?.user?.name || session?.user?.email || "Account";

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="User account menu"
        className="bg-gray-100 px-3 py-2 rounded hover:bg-gray-200 flex items-center focus:outline-none focus:ring-2 focus:ring-emerald-500"
      >
        <FaUser className="mr-2 text-gray-600" aria-hidden="true" />
        <span>{displayName}</span>
      </button>
      {open && (
        <div
          role="menu"
          aria-label="User options"
          className="absolute right-0 mt-2 w-48 bg-white shadow-lg border rounded py-1 z-10"
        >
          <button
            type="button"
            role="menuitem"
            onClick={handleManageAccount}
            className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center focus:bg-gray-100 focus:outline-none"
          >
            <FaCog className="mr-2 text-gray-600" aria-hidden="true" />
            Manage Account
          </button>
          <div className="border-t border-gray-100 my-1" role="separator"></div>
          <button
            type="button"
            role="menuitem"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center text-red-500 focus:bg-red-50 focus:outline-none"
          >
            <FaSignOutAlt className="mr-2" aria-hidden="true" />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}