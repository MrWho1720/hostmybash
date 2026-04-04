"use client";

import { useEffect } from "react";

export default function DashboardError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-white mb-1">
          Something went wrong
        </h2>
        <p className="text-sm text-gray-400 mb-1">
          An unexpected error occurred.
        </p>
        {error.digest && (
          <p className="text-xs text-gray-600 font-mono">
            Error ID: {error.digest}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={unstable_retry}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
