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

  // 添加点击外部区域关闭下拉菜单的效果
  useEffect(() => {
    function handleClickOutside(event) {
      // 如果点击的区域不在下拉菜单内，则关闭下拉菜单
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    
    // 添加全局点击事件监听器
    document.addEventListener("mousedown", handleClickOutside);
    
    // 组件卸载时移除监听器
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]); // 只有当引用改变时才重新运行

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="bg-gray-100 px-3 py-2 rounded hover:bg-gray-200 flex items-center"
      >
        <FaUser className="mr-2 text-gray-600" />
        <span>{session.user?.name || session.user?.email}</span>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg border rounded py-1 z-10">
          <button
            onClick={handleManageAccount}
            className="block w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center"
          >
            <FaCog className="mr-2 text-gray-600" />
            Manage Account
          </button>
          <div className="border-t border-gray-100 my-1"></div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="block w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center text-red-500"
          >
            <FaSignOutAlt className="mr-2" />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}