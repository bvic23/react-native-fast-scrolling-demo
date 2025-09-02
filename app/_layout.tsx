import { useCallback, useRef } from 'react';
import { FlatList, GestureResponderEvent, PanResponder, PanResponderGestureState, ScrollView, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import 'react-native-reanimated';

import { DECELERATION_FACTOR, INERTIA_THRESHOLD, ITEM_WIDTH, styles } from './constant';
import data from './data.json';
import { List } from './List';
import { Point } from './Point';
import { useScrollMetrics } from './scroll_content_size';

const sliceDataForHeaders = (headers: string[]) => {
  const rawData = (data as unknown as [{ [key: string]: any }]);
  const rows = rawData.map((item) => headers.map((header) => ({ id: `${header}-${item.Position}`, title: `${item[header]}` })));
  return {
    headers,
    rows,
  };
}

const leftTable = sliceDataForHeaders(['Position', 'Club']);
const rightTable = sliceDataForHeaders(['Matches played', 'Wins', 'Draws', 'Losses', 'Goals scored', 'Goals against', 'Goal difference', 'Points', 'Last 5']);

export default function RootLayout() {
  const screenSize = useWindowDimensions();

  const leftListRef = useRef<FlatList>(null);
  const rightListRef = useRef<FlatList>(null);
  const horizontalScrollRef = useRef<ScrollView>(null);

  const scrollOffset = useRef(Point.zero);

  // For inertia scrolling
  const velocity = useRef(Point.zero);

  // To be able to clamp scroll offsets
  const maxScrollOffset = useRef(Point.zero);
  const updateScrollOffset = useCallback((x: number | null, y: number | null) =>
    maxScrollOffset.current = new Point(x ?? maxScrollOffset.current.x, y ?? maxScrollOffset.current.y), []);
  const { scrollHandlers: horizontalScrollHandlers } = useScrollMetrics(
    (offset) => updateScrollOffset(offset.x, null)
  );
  const { scrollHandlers: verticalScrollHandlers } = useScrollMetrics(
    (offset) => updateScrollOffset(null, offset.y)
  );

  const calculateOffset = useCallback((gestureState: PanResponderGestureState): Point => {
    const delta = new Point(gestureState.dx, gestureState.dy);
    return scrollOffset.current.subtract(delta).clamp(Point.zero, maxScrollOffset.current);
  }, [])

  const scrollToOffset = useCallback((offset: Point) => {
    leftListRef.current?.scrollToOffset({ offset: offset.y, animated: false });
    rightListRef.current?.scrollToOffset({ offset: offset.y, animated: false });
    horizontalScrollRef.current?.scrollTo({ x: offset.x, animated: false });
  }, [])

  const doInertia = useCallback((initialVelocity: Point) => {
    velocity.current = initialVelocity.clone();

    const animateInertia = () => {
      if (velocity.current.absX < INERTIA_THRESHOLD && velocity.current.absY < INERTIA_THRESHOLD) {
        return;
      }

      const decelerationOffset = velocity.current.multiply(16);
      scrollOffset.current = scrollOffset.current.subtract(decelerationOffset).clamp(Point.zero, maxScrollOffset.current);
      scrollToOffset(scrollOffset.current);

      velocity.current = velocity.current.multiply(DECELERATION_FACTOR);
      requestAnimationFrame(animateInertia);
    };

    requestAnimationFrame(animateInertia);
  }, [scrollToOffset])

  const finishPanResponder = useCallback((_: GestureResponderEvent, gestureState: PanResponderGestureState) => {
    // Update current offset on finishing pan, start from here in next iteration
    scrollOffset.current = calculateOffset(gestureState);

    doInertia(new Point(gestureState.vx, gestureState.vy));
  }, [calculateOffset, doInertia]);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderStart: () => velocity.current = Point.zero,
    onPanResponderMove: (_, gestureState: PanResponderGestureState) => scrollToOffset(calculateOffset(gestureState)),
    onPanResponderRelease: finishPanResponder,
    onPanResponderTerminate: finishPanResponder,
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container} {...panResponder.panHandlers}>
        <List
          scrollHandlers={verticalScrollHandlers}
          listRef={leftListRef}
          width={ITEM_WIDTH * 2}
          height={screenSize.height}
          data={leftTable}
        />
        <ScrollView
          ref={horizontalScrollRef}
          style={[styles.scrollView, { width: screenSize.width - ITEM_WIDTH * 2 }]}
          horizontal
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
          {...horizontalScrollHandlers}
        >
          <List data={rightTable} listRef={rightListRef} height={screenSize.height} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
