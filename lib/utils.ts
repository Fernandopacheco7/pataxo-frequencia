export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  // Adding timezone offset to prevent date from changing
  const userTimezoneOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() + userTimezoneOffset).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export const getTodayDateString = (): string => {
  return new Date().toISOString().split('T')[0];
}

export const getInitials = (name: string = ''): string => {
  const names = name.split(' ');
  const firstName = names[0]?.[0] || '';
  const lastName = names.length > 1 ? names[names.length - 1]?.[0] : '';
  return `${firstName}${lastName}`.toUpperCase();
};