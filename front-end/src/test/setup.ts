/// <reference types="vitest/globals" />
import '@testing-library/jest-dom'
import { server } from './mocks/server'

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

window.ResizeObserver = ResizeObserverMock

Element.prototype.scrollIntoView = () => {}

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
