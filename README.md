# React Native Fast Scrolling Demo

A proof-of-concept implementation of a **football competition results table** in React Native. The UI replicates the scrolling behavior of a spreadsheet-style wireframe: sticky header row, sticky left columns , and independent vertical and horizontal scrolling for the body content.


## Problem

The screen has to follow constraints:

| # | Requirement | Behaviour |
|---|-------------|-----------|
| 1 | **Sticky header row** | The entire top (header) row does not scroll vertically; it stays fixed at the top. |
| 2 | **Vertical scrolling** | All data rows below the header scroll vertically as one unit. |
| 3 | **Sticky left columns** | The **Position** and **Club** columns do not scroll horizontally; they stay fixed on the left. |
| 4 | **Horizontal scrolling** | The remaining columns (e.g. Matches played, Wins, Draws, Goals, Points, Last 5) scroll horizontally as one unit. |

The result is a classic “cross” of sticky regions: one header and two columns (Position, Club) stay fixed while the rest of the table scrolls in both directions.

### Demo

Android
[![Android demo](https://img.youtube.com/vi/3z7dTVUuw-U/hqdefault.jpg)](https://www.youtube.com/shorts/3z7dTVUuw-U)

iOS
[![IOS demo](https://img.youtube.com/vi/f1A9Pg6Xp6M/hqdefault.jpg)](https://www.youtube.com/shorts/f1A9Pg6Xp6M)

### High-level approach

- **Split the table into two column groups**
  - **Left (sticky):** Position + Club. Rendered as a single column block that only participates in vertical scrolling.
  - **Right (scrollable):** All other columns. Rendered inside a horizontally scrollable area; this block scrolls both vertically (with the left) and horizontally (on its own).

- **Single gesture, three scroll targets**
  - Native nested scrolling (e.g. vertical `FlatList` inside horizontal `ScrollView`) is awkward in React Native and can conflict with gesture handling. So:
  - **Scroll is disabled** on the inner scrollable components (`FlatList` and `ScrollView`).
  - A **single `PanResponder`** on a parent wrapper captures drags and drives:
    1. Left body: vertical offset (via `FlatList.scrollToOffset`).
    2. Right body: same vertical offset (second `FlatList.scrollToOffset`).
    3. Right block: horizontal offset (via `ScrollView.scrollTo`).
  - Scroll bounds are derived from content size and layout size (see “Scroll metrics” below).

  - **2D scroll state:** A small immutable `Point` class represents the current scroll position and provides `clamp`, `subtract`, and `multiply` for bounds checking and inertia—so both axes are driven from a single value and stay in sync.

- **Sticky header**
  - The header row is **not** inside any scrollable view. It is a separate row of `View`s above the body. So it never moves vertically. The left block has its own header row (Position, Club); the right block has a header row for the remaining columns. Both stay fixed at the top while the body scrolls.

### Scroll and inertia

- **Scroll offset:** Stored in a ref (`scrollOffset`), updated on pan move and clamped to `[0, maxScrollOffset]`. `maxScrollOffset` is updated from `useScrollMetrics` (vertical from left list, horizontal from right `ScrollView`).
- **Syncing:** On each pan move (and during inertia), `scrollToOffset(offset)` is called to:
  - `leftListRef.current.scrollToOffset({ offset: offset.y })`
  - `rightListRef.current.scrollToOffset({ offset: offset.y })`
  - `horizontalScrollRef.current.scrollTo({ x: offset.x })`
- **Inertia:** On pan release/terminate, velocity from the gesture is used to animate the same `scrollOffset` with a simple decay (`DECELERATION_FACTOR`, `INERTIA_THRESHOLD`), and `scrollToOffset` is applied each frame until velocity is negligible.

## Potential pitfalls and edge cases

1. **Nested scrollables**  
   Letting both vertical and horizontal scroll run natively with nested `ScrollView`/`FlatList` often leads to gesture conflicts and wrong scroll ownership. This demo avoids that by disabling native scroll and using one parent `PanResponder` to drive all three scroll targets.

2. **Vertical sync between left and right**  
   Left and right `FlatList`s must share the same vertical offset at all times. Any code path that updates vertical scroll (pan or inertia) must call `scrollToOffset` for both refs. Missing one would desync the two sides.

3. **Max scroll offset and layout**  
   `maxScrollOffset` depends on content size and layout size. If the right `List` is not yet laid out or has different height than the left, vertical bounds could be wrong. Here both lists use the same row count and the same `getItemLayout`, so heights match. The hook is only attached to the left list for vertical and to the horizontal `ScrollView` for horizontal.

4. **Header alignment**  
   Left and right header cells must align with their body columns. Using shared `ITEM_WIDTH` and the same row structure in both `List` components keeps alignment. Different font sizes or padding could misalign.

5. **Performance with many rows**  
   `FlatList` is used with `getItemLayout`, `windowSize`, `initialNumToRender`, and `removeClippedSubviews` to keep scrolling smooth with large datasets. Row height must be constant for `getItemLayout` to stay valid.

6. **Inertia and bounds**  
   Inertia can overshoot; the implementation clamps `scrollOffset` each frame so the table never scrolls past the edges. Without clamping, the table could stop at negative or beyond-max offsets.

## Running the demo

- **Prerequisites:** Node.js, npm or yarn.
- **Install:** `npm install`
- **Start:** `npm start` (Expo). Then run on iOS simulator, Android emulator, or web as needed.
- **Stack:** React Native (Expo), TypeScript, `react-native-reanimated` (imported; gesture logic is PanResponder-based).

