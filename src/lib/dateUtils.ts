export function calcularProximaExecucao(
  data: string,
  frequencia: 'mensal' | 'semanal' | 'anual'
): string {
  const d = new Date(data + 'T00:00:00');
  
  switch (frequencia) {
    case 'mensal':
      d.setMonth(d.getMonth() + 1);
      break;
    case 'semanal':
      d.setDate(d.getDate() + 7);
      break;
    case 'anual':
      d.setFullYear(d.getFullYear() + 1);
      break;
  }
  
  return d.toISOString().split('T')[0];
}

export function formatDate(dateString: string): string {
  if (!dateString) return '-';
  
  try {
    const date = new Date(dateString + 'T00:00:00');
    if (isNaN(date.getTime())) return '-';
    
    return date.toLocaleDateString('pt-BR');
  } catch (error) {
    console.error('Error formatting date:', error);
    return '-';
  }
}