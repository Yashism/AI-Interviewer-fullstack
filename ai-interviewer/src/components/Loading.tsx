// components/Loader.js
export default function Loader() {
    return (
      <div className="flex justify-center items-center h-screen bg-white dark:bg-black">
        <div className="relative">
          <div className="w-20 h-20 border-purple-200 border-2 rounded-full"></div>
          <div className="w-20 h-20 border-purple-700 border-t-2 animate-spin rounded-full absolute left-0 top-0"></div>
        </div>
      </div>
    );
  }