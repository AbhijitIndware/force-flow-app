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

jest.mock('react-native-keychain', () => {
  return {
    ACCESSIBLE: {
      WHEN_UNLOCKED_THIS_DEVICE_ONLY: 'whenUnlockedThisDeviceOnly',
    },
    setGenericPassword: jest.fn().mockResolvedValue(true),
    getGenericPassword: jest.fn().mockResolvedValue(false),
    resetGenericPassword: jest.fn().mockResolvedValue(true),
  };
});
