import React from 'react';
import Svg, { Circle, Defs, Ellipse, LinearGradient, Path, Stop } from 'react-native-svg';

export const BrandLogo = ({ size = 42 }: { size?: number }) => {
  const strokeWidth = size * 0.12;

  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <LinearGradient id="ring" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#89D2C6" />
          <Stop offset="50%" stopColor="#B3E5C9" />
          <Stop offset="100%" stopColor="#ADE1AF" />
        </LinearGradient>
      </Defs>
      <Circle cx="50" cy="50" r="37" stroke="url(#ring)" strokeWidth={strokeWidth} fill="#F8FAF7" />
      <Ellipse cx="52" cy="54" rx="16" ry="12" fill="#DDEBDD" />
      <Path
        d="M50 67c-5-12 1-27 15-34-1 11-8 25-15 34Z"
        fill="#89D2C6"
      />
      <Path
        d="M49 67c4-10 0-24-12-30 0 10 5 22 12 30Z"
        fill="#B3E5C9"
      />
      <Path d="M50 30v38" stroke="#5E958E" strokeWidth="5" strokeLinecap="round" />
    </Svg>
  );
};
