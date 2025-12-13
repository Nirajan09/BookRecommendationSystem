export default function Loader({ size = 50 }) {
  return (
    <div className="flex items-center justify-center min-h-[90vh]">
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        className="animate-spin"
      >
        <circle
          cx="50"
          cy="50"
          r="45"
          stroke="url(#gradient)"
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          strokeDasharray="283"
          strokeDashoffset="75"
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" />      {/* blue-500 */}
            <stop offset="50%" stopColor="#6366f1" />     {/* indigo-500 */}
            <stop offset="100%" stopColor="#8b5cf6" />    {/* purple-500 */}
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
