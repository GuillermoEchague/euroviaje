import React from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';

interface TypographyProps {
  children: React.ReactNode;
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption' | 'label';
  color?: string;
  style?: TextStyle;
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
}

const Typography: React.FC<TypographyProps> = ({
  children,
  variant = 'body',
  color = '#000',
  style,
  align = 'left',
}) => {
  return (
    <Text style={[styles[variant], { color, textAlign: align }, style]}>
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  h1: {
    fontSize: 28,
    fontWeight: '700',
  },
  h2: {
    fontSize: 22,
    fontWeight: '700',
  },
  h3: {
    fontSize: 18,
    fontWeight: '600',
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
  },
  caption: {
    fontSize: 12,
    fontWeight: '400',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default Typography;
