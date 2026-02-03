import React from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
  theme?: {
    primaryColor: string;
    textColor: string;
    borderRadius: string;
  };
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className = "",
  theme,
}) => {
  if (totalPages <= 1) return null;

  // Generate page numbers
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push("...");
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push("...");
        pages.push(totalPages);
      }
    }
    return pages;
  };

  const pages = getPageNumbers();

  const primaryColor = theme?.primaryColor || "#3B82F6";
  const textColor = theme?.textColor || "#1F2937";
  const borderRadius = theme?.borderRadius || "0.5rem";

  return (
    <div className={`flex justify-center items-center gap-2 mt-8 ${className}`}>
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className={`px-3 py-2 border rounded-md text-sm font-medium transition-colors
          ${currentPage === 1 
            ? "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed" 
            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
          }`}
        style={{ borderRadius }}
      >
        Previous
      </button>

      {pages.map((page, idx) => (
        <React.Fragment key={idx}>
          {page === "..." ? (
            <span className="px-2 text-gray-400">...</span>
          ) : (
            <button
              onClick={() => onPageChange(page as number)}
              className={`px-3 py-2 border rounded-md text-sm font-medium transition-colors
                ${currentPage === page
                  ? "text-white border-transparent shadow-sm"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              style={{
                backgroundColor: currentPage === page ? primaryColor : "white",
                color: currentPage === page ? "#ffffff" : textColor,
                borderRadius,
              }}
            >
              {page}
            </button>
          )}
        </React.Fragment>
      ))}

      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className={`px-3 py-2 border rounded-md text-sm font-medium transition-colors
          ${currentPage === totalPages 
            ? "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed" 
            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
          }`}
        style={{ borderRadius }}
      >
        Next
      </button>
    </div>
  );
};
