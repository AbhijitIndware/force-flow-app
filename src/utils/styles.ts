import {Colors} from './colors';

export const boxShadow = {
  shadowColor: Colors.inputBorder,
  shadowOffset: {width: 0, height: 1},
  shadowOpacity: 0.8,
  shadowRadius: 5,
  elevation: 8,
};


// Flex utilities
export const flexRow: any = {
  display: 'flex',
  flexDirection: 'row',
};
export const flexCol: any = {
  display: 'flex',
  flexDirection: 'column',
};
export const flexCenter: any = {
  justifyContent: 'center',
  alignItems: 'center',
};
export const flexBetween: any = {
  justifyContent: 'space-between',
  alignItems: 'center',
};
export const flexAround: any = {
  justifyContent: 'space-around',
  alignItems: 'center',
};
export const flexStart: any = {
  justifyContent: 'flex-start',
  alignItems: 'flex-start',
};
export const flexEnd: any = {
  justifyContent: 'flex-end',
  alignItems: 'flex-end',
};

// Spacing utilities
export const p10 = {padding: 10};
export const p20 = {padding: 20};
export const m10 = {margin: 10};
export const m20 = {margin: 20};
export const mb10 = {marginBottom: 10};
export const mt10 = {marginTop: 10};
export const ml10 = {marginLeft: 10};
export const mr10 = {marginRight: 10};

// Border radius
export const rounded = {borderRadius: 8};
export const roundedFull = {borderRadius: 999};

// Text utilities
export const textCenter = {textAlign: 'center'};
export const textRight = {textAlign: 'right'};
export const textBold = {fontWeight: 'bold'};

// Background colors
export const bgWhite = {backgroundColor: Colors.white};
export const bgGray = {backgroundColor: Colors.lightGray};
export const bgPrimary = {backgroundColor: Colors.primary};
export const bgSecondary = {backgroundColor: Colors.secondary};

// Width / Height
export const fullWidth = {width: '100%'};
export const fullHeight = {height: '100%'};
export const fullSize = {width: '100%', height: '100%'};
