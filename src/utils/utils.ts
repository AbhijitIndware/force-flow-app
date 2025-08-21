import {Dimensions} from 'react-native';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

export {windowHeight, windowWidth};

export const soStatusColors: Record<string, string> = {
  Draft: '#FACC15', // yellow
  Pending: '#FACC15', // same as Draft
  Approve: '#22C55E', // green
  Reject: '#EF4444', // red
  Cancelled: '#EF4444', // same as Reject
  'To Deliver and Bill': '#22C55E',
  'To Receive and Bill': '#22C55E',
};
