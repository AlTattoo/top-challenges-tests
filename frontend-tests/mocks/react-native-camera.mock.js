// Mock pour le module React Native Camera

const mockBarCodeScanned = jest.fn();

const BarCodeScanner = {
  Constants: {
    BarCodeType: {
      qr: 'qr'
    }
  }
};

const Camera = () => {
  return {
    render: () => null,
    onBarCodeScanned: mockBarCodeScanned
  };
};

Camera.Constants = {
  Type: {
    back: 'back',
    front: 'front'
  },
  FlashMode: {
    on: 'on',
    off: 'off',
    auto: 'auto'
  }
};

jest.mock('react-native-camera', () => ({
  RNCamera: Camera,
  BarCodeScanner
}));

export default {
  mockBarCodeScanned
};
