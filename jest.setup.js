import '@testing-library/jest-dom';

global.AudioContext = jest.fn().mockImplementation(() => ({
  createMediaStreamSource: jest.fn(),
  createScriptProcessor: jest.fn(() => ({
    connect: jest.fn(),
    disconnect: jest.fn(),
    onaudioprocess: jest.fn(),
  })),
  createBufferSource: jest.fn(() => ({
    buffer: null,
    connect: jest.fn(),
    start: jest.fn(),
    onended: jest.fn(),
  })),
  createBuffer: jest.fn(),
  destination: {},
  sampleRate: 24000,
  close: jest.fn(),
  state: 'running',
}));

global.navigator.mediaDevices = {
  getUserMedia: jest.fn().mockResolvedValue({
    getTracks: () => [{
      stop: jest.fn(),
    }],
  }),
};

global.WebSocket = jest.fn().mockImplementation(() => ({
  send: jest.fn(),
  close: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  readyState: WebSocket.OPEN,
}));

global.fetch = jest.fn();

window.matchMedia = jest.fn().mockImplementation(query => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: jest.fn(),
  removeListener: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
}));

Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  },
  writable: true,
});

Object.defineProperty(window, 'sessionStorage', {
  value: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  },
  writable: true,
});