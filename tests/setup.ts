import { vi } from 'vitest'

// 模拟 ResizeObserver，避免测试环境报错
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// 模拟 window.matchMedia，提供最小实现
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // 已废弃 API，仅为兼容旧代码
    removeListener: vi.fn(), // 已废弃 API，仅为兼容旧代码
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// 模拟 ECharts，提供空实现以便组件挂载
vi.mock('echarts', () => ({
  init: vi.fn(() => ({
    setOption: vi.fn(),
    resize: vi.fn(),
    dispose: vi.fn(),
  })),
  graphic: {
    LinearGradient: vi.fn(),
  },
  use: vi.fn(),
  registerTheme: vi.fn(),
}))
