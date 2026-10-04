import { useWindowDimensions } from 'react-native';

export function useResponsive() {
  const { width } = useWindowDimensions();

  const isLargeScreen = width >= 768;

  return {
    isLargeScreen,
  };
}