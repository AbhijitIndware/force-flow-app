/* eslint-env jest */
jest.mock('react-native-bootsplash', () => {
  return {
    __esModule: true,
    default: {
      hide: jest.fn().mockResolvedValue(),
      isVisible: jest.fn().mockReturnValue(false),
      useHideAnimation: jest.fn().mockReturnValue({
        container: {},
        logo: { source: 0 },
        brand: { source: 0 },
      }),
    },
  };
});
