import { ref, onMounted, onUnmounted } from 'vue'

export interface WebSocketOptions {
  url: string
  reconnect?: boolean
  reconnectInterval?: number
  maxReconnectAttempts?: number
}

export function useWebSocket(options: WebSocketOptions) {
  const ws = ref<WebSocket | null>(null)
  const isConnected = ref<boolean>(false)
  const message = ref<any>(null)
  const reconnectAttempts = ref<number>(0)

  const {
    url,
    reconnect = true,
    reconnectInterval = 3000,
    maxReconnectAttempts = 5
  } = options

  const connect = (): void => {
    try {
      ws.value = new WebSocket(url)

      ws.value.onopen = () => {
        isConnected.value = true
        reconnectAttempts.value = 0
        console.log('WebSocket connected')
      }

      ws.value.onmessage = (event: MessageEvent) => {
        try {
          message.value = JSON.parse(event.data)
        } catch (error) {
          message.value = event.data
        }
      }

      ws.value.onerror = (error: Event) => {
        console.error('WebSocket error:', error)
        isConnected.value = false
      }

      ws.value.onclose = () => {
        isConnected.value = false
        console.log('WebSocket disconnected')

        if (reconnect && reconnectAttempts.value < maxReconnectAttempts) {
          reconnectAttempts.value++
          setTimeout(() => {
            console.log(`Reconnecting... (attempt ${reconnectAttempts.value})`)
            connect()
          }, reconnectInterval)
        }
      }
    } catch (error) {
      console.error('Failed to connect WebSocket:', error)
    }
  }

  const send = (data: any): void => {
    if (ws.value && isConnected.value) {
      ws.value.send(JSON.stringify(data))
    } else {
      console.warn('WebSocket is not connected')
    }
  }

  const disconnect = (): void => {
    if (ws.value) {
      ws.value.close()
    }
  }

  onMounted(() => {
    connect()
  })

  onUnmounted(() => {
    disconnect()
  })

  return {
    isConnected,
    message,
    send,
    connect,
    disconnect
  }
}
