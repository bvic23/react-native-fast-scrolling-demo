import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { ITEM_HEIGHT, styles, Table } from "./constant";
import { ScrollHandlers } from "./scroll_content_size";
import { memo } from "react";

type RowItemProps = {
    item: {
        title: string;
        id: string;
    }
}

const RowItem = memo(({ item: { title, id } }: RowItemProps) => {
    const isClub = id.startsWith('Club-');

    if (isClub) {
        return (
            <View style={styles.item}>
                <TouchableOpacity onPress={() => alert(title)}>
                    <Text style={styles.club}>{title}</Text>
                </TouchableOpacity>
            </View>
        );
    }
    return (
        <View style={styles.item}>
            <Text>{title}</Text>
        </View>
    );
});

RowItem.displayName = 'RowItem';

const renderItem = (props: RowItemProps) => <RowItem {...props} />;

type Props = {
    width?: number;
    height: number;
    data: Table;
    listRef: React.RefObject<FlatList | null>;
    scrollHandlers?: ScrollHandlers;
}

export const List = ({ width, height, data, listRef, scrollHandlers }: Props) => {
    const numColumns = data.headers.length;
    const numberOfRowsOnScreen = Math.floor(height / ITEM_HEIGHT);

    return (
        <View>
            <View style={styles.headers}>
                {data.headers.map((header, index) => (
                    <View key={index} style={[styles.item, styles.header]}>
                        <Text style={styles.headerText}>{`${header}`}</Text>
                    </View>
                ))}
            </View>
            <FlatList
                ref={listRef}
                data={data.rows.flat()}
                numColumns={numColumns}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                style={[styles.flatList, { width: width ?? '100%' }]}
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}      
                removeClippedSubviews={true}
                windowSize={numberOfRowsOnScreen / 2}
                initialNumToRender={numberOfRowsOnScreen}
                getItemLayout={(_, index) => ({
                    length: ITEM_HEIGHT,
                    offset: ITEM_HEIGHT * index,
                    index,
                })}
                scrollEnabled={false}
                {...scrollHandlers}
                //maxToRenderPerBatch={numberOfRowsOnScreen}
                //disableScrollViewPanResponder={true}
                //nestedScrollEnabled={true}
                //updateCellsBatchingPeriod={16}
            />
        </View>
    )
}