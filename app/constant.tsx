import { StyleSheet } from 'react-native';
import 'react-native-reanimated';

export const ITEM_WIDTH = 100;
export const ITEM_HEIGHT = 80;
export const HEADER_HEIGHT = 60;
export const DECELERATION_FACTOR = 0.96;
export const INERTIA_THRESHOLD = 0.1;

export type Item = {
  id: string;
  title: string;
  href?: string;
}

export type Row = Item[];

export type Table = {
  headers: string[];
  rows: Row[];
}

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  flatList: {
    borderWidth: 1,
  },
  club: {
    color: 'blue',
  },
  item: {
    padding: 0,
    width: ITEM_WIDTH,
    height: ITEM_HEIGHT,
    borderWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headers: {
    flexDirection: 'row',
  },
  headerText: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  header: {
    backgroundColor: 'gray',
    height: HEADER_HEIGHT,
  },
  scrollView: {
    height: '100%',
  },
});