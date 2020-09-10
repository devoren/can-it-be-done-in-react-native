import React, { ReactElement } from "react";
import Animated, {
  useAnimatedStyle,
  useAnimatedGestureHandler,
  withSpring,
  useSharedValue,
  useDerivedValue,
} from "react-native-reanimated";
import { PanGestureHandler } from "react-native-gesture-handler";
import { useVector } from "react-native-redash";

import { Offset } from "./Layout";

interface SortableWordProps {
  offsets: Offset[];
  children: ReactElement<{ id: number }>;
  index: number;
}

const SortableWord = ({ offsets, index, children }: SortableWordProps) => {
  const gestureActive = useSharedValue(false);
  const offset = offsets[index];
  const height = offset.height.current;
  const width = offset.width.current;
  const translation = useVector(offset.x.value, offset.y.value);
  const panOffset = useVector();
  const onGestureEvent = useAnimatedGestureHandler({
    onStart: () => {
      gestureActive.value = true;
      panOffset.x.value = offset.x.value;
      panOffset.y.value = offset.y.value;
    },
    onActive: (event) => {
      translation.x.value = offset.x.value + event.translationX;
      translation.y.value = offset.x.value + event.translationY;
      const offsetY = Math.floor(translation.y.value / height) * height;
      offsets.forEach((o, i) => {
        if (
          o.y.value === offsetY &&
          o.x.value >= translation.x.value &&
          translation.x.value <= o.x.value + o.width.current &&
          i !== index
        ) {
          return;
          const tmpX = o.x.value;
          const tmpY = o.y.value;
          const tmpWidth = o.width.current;
          const tmpHeight = o.height.current;
          o.y.value = offset.y.value;
          o.x.value = offset.x.value;
          o.width.current = offset.width.current;
          o.height.current = offset.height.current;
          offset.x.value = tmpX;
          offset.y.value = tmpY;
          offset.width.current = tmpWidth;
          offset.height.current = tmpHeight;
        }
      });
    },
    onEnd: ({ velocityX, velocityY }) => {
      gestureActive.value = false;
      translation.x.value = withSpring(offset.x.value, {
        velocity: velocityX,
      });
      translation.y.value = withSpring(offset.y.value, {
        velocity: velocityY,
      });
    },
  });
  const translateX = useDerivedValue(() => translation.x.value);
  const translateY = useDerivedValue(() => {
    if (gestureActive.value) {
      return translation.y.value;
    } else {
      return withSpring(offset.y.value);
    }
  });
  const style = useAnimatedStyle(() => {
    const { width, height } = offsets[index];
    return {
      position: "absolute",
      top: 0,
      left: 0,
      width: width.current,
      height: height.current,
      zIndex: gestureActive.value ? 100 : 0,
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
      ],
    };
  });
  return (
    <PanGestureHandler onGestureEvent={onGestureEvent}>
      <Animated.View style={style}>{children}</Animated.View>
    </PanGestureHandler>
  );
};

export default SortableWord;