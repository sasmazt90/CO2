export const formatPercent = (value: number) => `${Math.round(value * 100)}%`;

export const formatMinutes = (minutes: number) => {
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const remainder = minutes % 60;
    if (remainder === 0) {
      return `${hours}h`;
    }

    return `${hours}h ${remainder}m`;
  }

  return `${minutes}m`;
};

export const formatKgCo2 = (value: number) => `${value.toFixed(2)} kg CO2e`;

export const weekdayLabel = (dateString: string) =>
  new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(new Date(dateString));

export const monthDayLabel = (dateString: string) =>
  new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(dateString));
