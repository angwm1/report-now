"use client";

export default function LoadingSpinner({ size = "normal", overlay = false }) {
  // 根据size参数确定加载圈的大小
  const spinnerSize = {
    small: "h-6 w-6 border-2",
    normal: "h-12 w-12 border-2",
    large: "h-16 w-16 border-3",
  }[size] || "h-12 w-12 border-2";
  
  // 如果是覆盖模式，使用固定位置，但半透明背景
  if (overlay) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50 z-50 pointer-events-none">
        <div className={`animate-spin rounded-full ${spinnerSize} border-t-white border-r-transparent border-b-white border-l-transparent`}></div>
      </div>
    );
  }
  
  // 默认是内联的加载指示器
  return (
    <div className="flex justify-center items-center py-8">
      <div className={`animate-spin rounded-full ${spinnerSize} border-t-gray-500 border-r-transparent border-b-gray-500 border-l-transparent`}></div>
    </div>
  );
}
