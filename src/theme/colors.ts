export const colors = {
  softWhite: '#F8FAF7',
  pastelSage: '#DDEBDD',
  mintGreen: '#B3E5C9',
  softTeal: '#89D2C6',
  pastelGreen: '#ADE1AF',
  warmGray: '#A0A7A2',
  forestInk: '#4E6156',
  deepTeal: '#5E958E',
  mist: '#EEF5EF',
  line: '#D4E2D6',
  bronze: '#C9A37A',
  silver: '#C1CAD3',
  gold: '#D9C384',
};

export const gradients = {
  appBackground: [colors.softWhite, '#EFF7F1', colors.pastelSage] as const,
  scoreRing: [colors.softTeal, colors.mintGreen, colors.pastelGreen] as const,
  gentleCard: ['rgba(248,250,247,0.96)', 'rgba(221,235,221,0.9)'] as const,
  bronze: ['#E5C3A2', '#C9A37A'] as const,
  silver: ['#DCE6EF', '#C1CAD3'] as const,
  gold: ['#F2E5AF', '#D9C384'] as const,
};
