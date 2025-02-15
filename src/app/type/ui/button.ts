export interface ButtonOptions {
  label?: string;
  type?: 'button' | 'submit' | 'reset';
  class?: string;
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  icon?: string;
  iconPosition?: 'left' | 'right';
  loading?: boolean; // New property to control loading state
}
