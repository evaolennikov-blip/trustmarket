interface TrustScoreProps {
  score: number // 0-100
  transactions: number
  size?: 'sm' | 'md'
}

export default function TrustScore({ score, transactions, size = 'md' }: TrustScoreProps) {
  // Determine color based on score
  const colorClass = score >= 80 ? 'bg-green-500' : score >= 50 ? 'bg-yellow-500' : 'bg-red-400'

  if (size === 'sm') {
    // Compact inline layout
    return (
      <div className="inline-flex items-center gap-1.5">
        <div className="h-1.5 w-16 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full ${colorClass} rounded-full`}
            style={{ width: `${score}%` }}
          />
        </div>
        <span className="text-xs text-gray-600">{score}%</span>
      </div>
    )
  }

  // Full layout (md)
  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm font-medium text-gray-700">Рейтинг доверия</span>
      <div className="flex items-center gap-2">
        <div className="h-2 w-32 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full ${colorClass} rounded-full transition-all`}
            style={{ width: `${score}%` }}
          />
        </div>
        <span className="text-lg font-bold text-gray-900">{score}%</span>
        <span className="text-sm text-gray-500">{transactions} сделок</span>
      </div>
    </div>
  )
}
