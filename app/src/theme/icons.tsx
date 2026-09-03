import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

const PATHS = {
  send: 'M3 8l9-5 9 5v8l-9 5-9-5V8zM3 8l9 5 9-5M12 13v8',
  track: 'M12 21s7-6.1 7-11a7 7 0 10-14 0c0 4.9 7 11 7 11z',
  orders: 'M4 4h16v16H4zM8 9h8M8 13h8M8 17h5',
  profile: 'M12 8.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7zM4.5 21c1.6-3.6 4.2-5 7.5-5s5.9 1.4 7.5 5',
  jobs: 'M4 7h16v13H4zM9 7V4h6v3',
  active: 'M2 7h11v9H2zM13 10h5l3 3v3h-8z',
  search: 'M11 18a7 7 0 100-14 7 7 0 000 14z|M20 20l-4-4',
  chevronRight: 'M9 6l6 6-6 6',
  parcel: 'M3 8l9-5 9 5v8l-9 5-9-5V8z|M3 8l9 5 9-5M12 13v8',
  person: 'M12 8a3.5 3.5 0 100-7 3.5 3.5 0 000 7z|M4.5 20c1.6-3.6 4.2-5 7.5-5s5.9 1.4 7.5 5',
};

export function Icon({ name, size = 22, color = 'currentColor', strokeWidth = 1.5 }: {
  name: keyof typeof PATHS; size?: number; color?: string; strokeWidth?: number;
}) {
  const segments = PATHS[name].split('|');
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {segments.map((d, i) => (
        <Path key={i} d={d} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      ))}
    </Svg>
  );
}

export function VanIcon({ size = 16, color = '#fff' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M2 7h11v9H2zM13 10h5l3 3v3h-8z" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx={6} cy={18} r={1.6} fill={color} />
      <Circle cx={17} cy={18} r={1.6} fill={color} />
    </Svg>
  );
}
