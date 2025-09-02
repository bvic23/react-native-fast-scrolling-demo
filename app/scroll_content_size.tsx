import { useCallback, useRef } from "react";
import { LayoutChangeEvent } from "react-native";
import { Point } from "./Point";

export type ScrollHandlers = {
    onContentSizeChange: (w: number, h: number) => void;
    onLayout: (event: LayoutChangeEvent) => void;
}

export function useScrollMetrics(onMaxOffsetChange: (maxOffset: Point) => void) {
    const contentSize = useRef(Point.zero);
    const layoutSize = useRef(Point.zero);
    
    const updateMaxOffset = useCallback(() => {
        if (contentSize.current === Point.zero || layoutSize.current === Point.zero) {
            return;
        }
        onMaxOffsetChange(contentSize.current.subtract(layoutSize.current));
    }, [onMaxOffsetChange]);

    const onContentSizeChange = useCallback((w: number, h: number) => {
        contentSize.current = new Point(w, h);
        updateMaxOffset();
    }, [updateMaxOffset]);

    const onLayout = useCallback(({ nativeEvent: { layout: { width, height } } }: LayoutChangeEvent) => {
        layoutSize.current =  new Point(width, height);;
        updateMaxOffset();
    }, [updateMaxOffset]);

    return {
        scrollHandlers: {
            onContentSizeChange,
            onLayout,
        },
    };
}