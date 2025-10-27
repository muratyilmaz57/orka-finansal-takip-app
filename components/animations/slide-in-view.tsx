import { useEffect } from 'react';
import { ViewProps } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
} from 'react-native-reanimated';

interface SlideInViewProps extends ViewProps {
  delay?: number;
  duration?: number;
  from?: 'left' | 'right' | 'top' | 'bottom';
  distance?: number;
}

export function SlideInView({
  delay = 0,
  duration = 400,
  from = 'bottom',
  distance = 20,
  style,
  children,
  ...props
}: SlideInViewProps) {
  const translateX = useSharedValue(from === 'left' ? -distance : from === 'right' ? distance : 0);
  const translateY = useSharedValue(from === 'top' ? -distance : from === 'bottom' ? distance : 0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    translateX.value = withDelay(delay, withTiming(0, { duration }));
    translateY.value = withDelay(delay, withTiming(0, { duration }));
    opacity.value = withDelay(delay, withTiming(1, { duration }));
  }, [delay, duration, translateX, translateY, opacity]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }, { translateY: translateY.value }],
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View style={[style, animatedStyle]} {...props}>
      {children}
    </Animated.View>
  );
}
