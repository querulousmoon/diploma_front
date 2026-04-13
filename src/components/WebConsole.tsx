import { useState, useRef, useEffect } from 'react'
import { consoleApi } from '@/api/console'
import { Terminal as TerminalIcon, Play, Square, RotateCcw } from 'lucide-react'
import Card from '@/components/ui/Card'
import './WebConsole.css'



interface WebConsoleProps {
  serverId: number
  serverName: string
}

const WebConsole = ({ serverId, serverName }: WebConsoleProps) => {
  const [connected, setConnected] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [disconnecting, setDisconnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const terminalRef = useRef<HTMLDivElement>(null)
  const terminalInstance = useRef<any>(null)
  const wsRef = useRef<WebSocket | null>(null)
  
  // Dynamically import xterm.js
  useEffect(() => {
    const loadTerminalLibraries = async () => {
      try {
        const { Terminal } = await import('@xterm/xterm')
        const { FitAddon } = await import('@xterm/addon-fit')
        
        // Initialize terminal
        const term = new Terminal({
          cursorBlink: true,
          cols: 80,
          rows: 24,
          fontSize: 14,
        })
        
        // Initialize addons
        const fitAddon = new FitAddon()
        term.loadAddon(fitAddon)
        
        // Open terminal in the DOM
        if (terminalRef.current) {
          term.open(terminalRef.current)
          fitAddon.fit()
          
          // Handle resize
          const resizeObserver = new ResizeObserver(() => {
            fitAddon.fit()
          })
          resizeObserver.observe(terminalRef.current)
          
          terminalInstance.current = term
        }
      } catch (err) {
        console.error('Failed to load terminal libraries:', err)
        setError('Failed to load terminal libraries. Please ensure xterm.js is installed.')
      }
    }

    loadTerminalLibraries()
    
    // Cleanup function
    return () => {
      // Close WebSocket if it exists 
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close()
      }
      
      if (terminalInstance.current) {
        terminalInstance.current.dispose()
      }
    }
  }, [])

  const connectToConsole = async () => {
    if (!terminalInstance.current) {
      setError('Terminal not initialized')
      return
    }

    setConnecting(true)
    setError(null)

    try {
      // Start a console session
      const session = await consoleApi.startSession(serverId)
      setSessionId(session.session_token)
      
      // Establish WebSocket connection
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const wsUrl = `${protocol}//${window.location.host}/api/v1/ws/console/${session.session_token}`
      
      const ws = new WebSocket(wsUrl)
      wsRef.current = ws
      
       ws.onopen = () => {
        setConnected(true)
        setConnecting(false)
        setError(null)
        if (terminalInstance.current) {
          terminalInstance.current.write('\r\nConnected to server console\r\n')
        }
      }
      
      ws.onmessage = (event) => {
        // Write response to terminal
        if (terminalInstance.current) {
          terminalInstance.current.write(event.data)
        }
      }
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        setError('Connection error occurred')
        setConnecting(false)
      }
      
      ws.onclose = (event) => {
        setConnected(false)
        setConnecting(false)
        if (!event.wasClean) {
          setError('Connection closed unexpectedly')
        }
        if (terminalInstance.current) {
          terminalInstance.current.write('\r\nDisconnected from server\r\n')
        }
      }
      
      // Send terminal input to WebSocket
      if (terminalInstance.current) {
        terminalInstance.current.onData((data: string) => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(data)
          }
        })
      }
    } catch (err: any) {
      console.error('Failed to connect to console:', err)
      setError(err.message || 'Failed to connect to server console')
      setConnecting(false)
    }
  }

  const disconnectFromConsole = async () => {
    if (!wsRef.current) return
    
    setDisconnecting(true)
    
    try {
      // Close WebSocket connection
      wsRef.current.close()
    } catch (err: any) {
      console.error('Error closing WebSocket:', err)
    } finally {
      // Terminate session on server
      if (sessionId) {
        try {
          await consoleApi.terminateSession(sessionId)
        } catch (err: any) {
          console.error('Error terminating console session:', err)
        }
      }
      
      setConnected(false)
      setDisconnecting(false)
      setSessionId(null)
    }
  }

  const reconnect = async () => {
    if (connected) {
      await disconnectFromConsole();
      setTimeout(() => {
        connectToConsole()
      }, 1000)
    } else {
      connectToConsole()
    }
  }

  return (
    <Card className="web-console-container">
      <div className="web-console-header">
        <div className="console-server-info">
          <TerminalIcon size={24} />
          <div className="console-server-details">
            <h2 className="console-server-name">{serverName}</h2>
            <div className="console-server-id">Server ID: {serverId}</div>
          </div>
        </div>
        <div className="console-controls">
          <button
            className={`console-btn ${connected ? 'console-btn-danger' : 'console-btn-success'}`}
            onClick={connected ? disconnectFromConsole : connectToConsole}
            disabled={connecting || disconnecting}
          >
            {connecting ? (
              <>
                <RotateCcw className="btn-icon spin" size={16} />
                Connecting...
              </>
            ) : disconnecting ? (
              <>
                <RotateCcw className="btn-icon spin" size={16} />
                Disconnecting...
              </>
            ) : connected ? (
              <>
                <Square size={16} />
                Disconnect
              </>
            ) : (
              <>
                <Play size={16} />
                Connect
              </>
            )}
          </button>
          <button
            className="console-btn console-btn-secondary"
            onClick={reconnect}
            disabled={connecting}
            title="Reconnect"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      <div className="console-status">
        <span className={`status-indicator ${connected ? 'status-connected' : 'status-disconnected'}`}>
          {connected ? 'Connected' : 'Disconnected'}
        </span>
        {error && <span className="status-error">{error}</span>}
      </div>

      <div className="console-terminal-container">
        <div 
          ref={terminalRef} 
          className="console-terminal"
        />
      </div>
    </Card>
  )
}

export default WebConsole