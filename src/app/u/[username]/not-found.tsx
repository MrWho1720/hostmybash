import Link from "next/link";

export default function UserNotFound() {
  const MAIN_HOST = process.env.MAIN_HOST || "endever.in";

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6 text-white">
      <div className="text-center space-y-4">
        <p className="text-6xl">👤</p>
        <h1 className="text-3xl font-bold">User not found</h1>
        <p className="text-gray-400 max-w-sm">
          This user doesn&apos;t exist or their account is no longer active.
        </p>
        <Link
          href={`https://${MAIN_HOST}`}
          className="inline-block mt-4 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors"
        >
          Go to HostMyBash
        </Link>
      </div>
    </div>
  );
}
