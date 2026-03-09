interface VerifiedBadgeProps {
  tier: 'trusted' | 'enhanced' | 'basic' | 'none';
  text?: string;
}

export default function VerifiedBadge({ tier, text }: VerifiedBadgeProps) {
  let badgeClass = '';
  let badgeText = '';
  let icon = null;

  switch (tier) {
    case 'trusted':
      badgeClass = 'bg-accent-100 text-accent-700';
      badgeText = text || '✓ Проверенный';
      icon = (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      );
      break;
    case 'enhanced':
      badgeClass = 'bg-trust-100 text-trust-700';
      badgeText = text || '● Верифицирован';
      icon = null; // Can add a different icon if needed
      break;
    case 'basic':
      badgeClass = 'bg-gray-100 text-gray-600';
      badgeText = text || '○ Базовая проверка';
      icon = null;
      break;
    default:
      return null; // Don't show badge for 'none' tier
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badgeClass}`}>
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {badgeText}
    </span>
  );
}
