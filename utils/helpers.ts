/**
 * Generates a unique ID for new entities
 */
export const generateUniqueId = (): string => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

/**
 * Formats a date string to a more user-friendly format
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Calculates the percentage of votes for an option
 */
export const calculatePercentage = (optionVotes: number, totalVotes: number): number => {
  if (totalVotes === 0) return 0;
  return Math.round((optionVotes / totalVotes) * 100);
};