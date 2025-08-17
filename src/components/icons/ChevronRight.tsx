"use client";
import React, {memo} from "react";

export const ChevronRight = memo(function ChevronRight() {
    return (
        <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="size-[1em] flex-none transition-transform"
        >
            <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 0 1 0-1.414L10.586 10 7.293 6.707A1 1 0 1 1 8.707 5.293l4 4a1 1 0 0 1 0 1.414l-4 4a1 1 0 0 1-1.414 0Z"
                clipRule="evenodd"
            />
        </svg>
    );
});
