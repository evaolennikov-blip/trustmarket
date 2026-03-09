interface EscrowStatusProps {
  state: 'pending' | 'held' | 'released' | 'refunded' | 'cancelled';
}

export default function EscrowStatus({ state }: EscrowStatusProps) {
  let statusClass = '';
  let statusText = '';
  
  switch (state) {
    case 'pending':
      statusClass = 'bg-blue-100 text-blue-700';
      statusText = 'Ожидает оплаты';
      break;
    case 'held':
      statusClass = 'bg-yellow-100 text-yellow-700';
      statusText = 'Деньги в эскроу';
      break;
    case 'released':
      statusClass = 'bg-accent-100 text-accent-700';
      statusText = 'Сделка завершена';
      break;
    case 'refunded':
      statusClass = 'bg-red-100 text-red-700';
      statusText = 'Возврат';
      break;
    case 'cancelled':
      statusClass = 'bg-gray-100 text-gray-600';
      statusText = 'Отменено';
      break;
    default:
      return null;
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusClass}`}>
      {statusText}
    </span>
  );
}
