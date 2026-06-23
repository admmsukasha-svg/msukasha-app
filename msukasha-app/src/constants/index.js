// MSukasha App — Constants

export const API_URL = 'https://msukasha-backend-git-main-msukasha.vercel.app';

export const COLORS = {
  orange:      '#ff6600',
  orangeDark:  '#e55a00',
  orangeLight: '#fff4ee',
  dark:        '#1a2332',
  dark2:       '#2d3a4a',
  blue:        '#0066cc',
  white:       '#ffffff',
  bodyBg:      '#f2f4f7',
  border:      '#e2e6ea',
  text:        '#2d3a4a',
  muted:       '#6c7a8d',
  green:       '#22c55e',
  red:         '#ef4444',
  yellow:      '#f59e0b',
};

export const FONTS = {
  regular:  'System',
  medium:   'System',
  bold:     'System',
  size: {
    xs:   11,
    sm:   13,
    md:   15,
    lg:   17,
    xl:   20,
    xxl:  24,
    xxxl: 28,
  }
};

export const RADIUS = {
  sm:  6,
  md:  10,
  lg:  14,
  xl:  20,
  full: 999,
};

export const SHADOW = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
};

export const CATEGORIES = [
  { id: 'electronics', label: 'Electronics',     icon: 'phone-portrait-outline' },
  { id: 'fashion',     label: 'Fashion',          icon: 'shirt-outline' },
  { id: 'home',        label: 'Home & Living',    icon: 'home-outline' },
  { id: 'vehicles',    label: 'Vehicles',         icon: 'car-outline' },
  { id: 'industrial',  label: 'Industrial',       icon: 'business-outline' },
  { id: 'agriculture', label: 'Agriculture',      icon: 'leaf-outline' },
  { id: 'sports',      label: 'Sports',           icon: 'football-outline' },
  { id: 'tools',       label: 'Tools',            icon: 'construct-outline' },
];

export const CITIES = [
  'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi',
  'Faisalabad', 'Multan', 'Peshawar', 'Quetta',
  'Sialkot', 'Gujranwala', 'Hyderabad', 'Other',
];
