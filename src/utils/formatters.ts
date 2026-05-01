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

export const co2eLabel = 'CO₂e';

export const formatKgCo2 = (value: number) => `${value.toFixed(2)} kg ${co2eLabel}`;

export const formatKgCo2Compact = (value: number) => {
  if (value < 0.01) {
    return `${Math.round(value * 1000)} g ${co2eLabel}`;
  }

  return formatKgCo2(value);
};

export const toFootprintScore = (ecoScore: number) =>
  Math.max(0, Math.min(100, 100 - ecoScore));

export const formatDeltaPercent = (value: number) => {
  const rounded = Math.round(value);
  return `${rounded > 0 ? '+' : ''}${rounded}%`;
};

export const formatMetricNumber = (value: number) => {
  if (Math.abs(value) >= 1000) {
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value);
  }

  if (Number.isInteger(value)) {
    return `${value}`;
  }

  return value.toFixed(1);
};

export const formatShortDate = (dateString: string) =>
  new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(dateString));

export const weekdayLabel = (dateString: string) =>
  new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(new Date(dateString));

export const monthDayLabel = (dateString: string) =>
  new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(dateString));
