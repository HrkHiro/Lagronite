import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams, useOutletContext } from 'react-router-dom'
import { io } from 'socket.io-client'
import { readStoredToken, apiUrl, getAuthHeaders, SOCKET_URL } from '../../services/api.js'
import {
  MdArrowBack,
  MdSend,
  MdPerson,
  MdAdminPanelSettings,
  MdChat,
  MdError,
  MdWarning,
} from 'react-icons/md'

export function StudentReportChat() {
  const { reportType, reportId } = useParams()
  const navigate = useNavigate()
  const [chat, setChat] = useState(null)
  const [messages, setMessages] = useState([])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)
  const socketRef = useRef(null)
  const messagesEndRef = useRef(null)
  const { theme } = useOutletContext() // Get theme from layout

  const isDark = theme === 'dark'

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Fetch initial chat data
  useEffect(() => {
    const fetchChat = async () => {
      try {
        setLoading(true)
        const res = await fetch(
          apiUrl(`/api/chats/${reportType}/${reportId}`),
          { credentials: 'include', headers: getAuthHeaders() }
        )
        const data = await res.json()
        if (!res.ok) throw new Error(data.message || 'Unable to load chat')
        setChat(data.chat)
        setMessages(data.chat.messages || [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchChat()
  }, [reportType, reportId])

  // Setup Socket.IO connection
  useEffect(() => {
    if (!reportType || !reportId) return

    const token = readStoredToken()
    if (!token) {
      console.error('No authentication token found')
      return
    }

    const newSocket = io(SOCKET_URL, {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      transports: ['websocket', 'polling'],
    })

    socketRef.current = newSocket

    newSocket.on('connect', () => {
      console.log('Connected to socket server')
      newSocket.emit('join_chat', { reportType, reportId })
    })

    newSocket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message)
      setError(err.message)
    })

    newSocket.on('new_message', (msg) => {
      setMessages((prev) => [...prev, msg])
    })

    newSocket.on('error', (err) => {
      setError(err.message || 'Connection error')
    })

    newSocket.on('disconnect', () => {
      console.log('Disconnected from socket server')
    })

    return () => {
      if (socketRef.current) {
        socketRef.current.emit('leave_chat', { reportType, reportId })
        socketRef.current.disconnect()
        socketRef.current = null
      }
    }
  }, [reportType, reportId])

  const handleSend = async () => {
    if (!message.trim() || !socketRef.current) return

    try {
      setSending(true)
      const res = await fetch(
        apiUrl(`/api/chats/${reportType}/${reportId}`),
        {
          method: 'POST',
          credentials: 'include',
          headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify({ text: message }),
        }
      )
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to send')

      socketRef.current.emit('send_message', {
        reportType,
        reportId,
        text: message,
      })

      setMessage('')
    } catch (err) {
      setError(err.message)
    } finally {
      setSending(false)
    }
  }

  const isAdmin = (participant) => participant?.role === 'admin'

  if (loading) {
    return (
      <section className={`relative flex min-h-screen items-center justify-center overflow-hidden ${isDark ? 'bg-slate-950' : 'bg-gray-50'}`}>
        <div className={`rounded-2xl border ${isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-white'} px-8 py-6 backdrop-blur-xl shadow-lg`}>
          <div className="flex items-center gap-3">
            <div className={`h-8 w-8 animate-spin rounded-full border-3 ${isDark ? 'border-white/10 border-t-emerald-400' : 'border-gray-200 border-t-emerald-500'}`} />
            <p className={`text-base ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
              Loading conversation…
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className={`relative flex min-h-screen flex-col overflow-hidden ${isDark ? 'bg-slate-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Background effects */}
      <style>{`
        @keyframes glowPulse {
          0%, 100% { opacity: 0.45; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.1); }
        }
        .glow-a { animation: glowPulse 8s ease-in-out infinite; }
        .glow-b { animation: glowPulse 9s ease-in-out infinite 1.5s; }
        .dot-grid-dark {
          background-image: radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px);
          background-size: 28px 28px;
          mask-image: radial-gradient(ellipse 80% 60% at 30% 40%, black 0%, transparent 75%);
        }
        .dot-grid-light {
          background-image: radial-gradient(circle, rgba(0,0,0,0.08) 1px, transparent 1px);
          background-size: 28px 28px;
          mask-image: radial-gradient(ellipse 80% 60% at 30% 40%, black 0%, transparent 75%);
        }
      `}</style>

      <div className={`pointer-events-none absolute inset-0 ${isDark ? 'dot-grid-dark' : 'dot-grid-light'}`} />
      <div className={`glow-a absolute -left-40 -top-40 h-[420px] w-[420px] rounded-full ${isDark ? 'bg-emerald-500/[0.06]' : 'bg-emerald-500/[0.15]'} blur-[160px]`} />
      <div className={`glow-b absolute -right-40 -bottom-40 h-[420px] w-[420px] rounded-full ${isDark ? 'bg-cyan-500/[0.06]' : 'bg-cyan-500/[0.15]'} blur-[160px]`} />

      {/* Header - INCREASED padding and fonts */}
      <header className={`relative z-10 border-b ${isDark ? 'border-white/10 bg-slate-950/80' : 'border-gray-200 bg-white/80'} backdrop-blur-xl`}>
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-6 py-5 md:px-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <MdChat className={`text-2xl ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-600">
                Support Chat
              </p>
            </div>
            <h1 className={`mt-2 text-3xl font-bold md:text-4xl ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Report Discussion
            </h1>
            <p className={`mt-1.5 text-base ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
              Chat with an admin about your report
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/student/reports')}
            className={`whitespace-nowrap rounded-xl border px-5 py-3 text-base font-semibold transition-all duration-200 flex items-center gap-2 ${
              isDark
                ? 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'
                : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 hover:border-gray-300'
            }`}
          >
            <MdArrowBack className="text-xl" />
            Back to reports
          </button>
        </div>
      </header>

      {/* Chat area */}
      <div className="relative z-10 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-4xl">
          {error ? (
            <div className={`m-8 rounded-2xl border p-6 flex items-start gap-3 ${
              isDark ? 'border-rose-500/30 bg-rose-500/10 text-rose-100' : 'border-rose-400/30 bg-rose-50 text-rose-800'
            }`}>
              <MdWarning className={`text-2xl flex-shrink-0 mt-0.5 ${isDark ? 'text-rose-300' : 'text-rose-600'}`} />
              <div>
                <p className="text-base font-semibold mb-1">Connection Error</p>
                <p className="text-base">{error}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6 p-6 md:p-8">
              {/* Participants - INCREASED sizes */}
              {chat?.participants && (
                <div className={`rounded-2xl border p-6 md:p-7 ${
                  isDark ? 'border-emerald-400/20 bg-emerald-500/10' : 'border-emerald-400/30 bg-emerald-50'
                }`}>
                  <p className={`flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.24em] ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>
                    <MdPerson className="text-xl" />
                    Participants
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    {chat.participants.map((participant) => (
                      <div
                        key={participant._id}
                        className={`flex items-center gap-3 rounded-full border px-5 py-2.5 text-base ${
                          isAdmin(participant)
                            ? isDark
                              ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-200'
                              : 'border-emerald-400/40 bg-emerald-50 text-emerald-800'
                            : isDark
                              ? 'border-cyan-400/30 bg-cyan-500/10 text-cyan-200'
                              : 'border-cyan-400/40 bg-cyan-50 text-cyan-800'
                        }`}
                      >
                        <span
                          className={`inline-block h-3 w-3 rounded-full ${
                            isAdmin(participant) ? 'bg-emerald-400' : 'bg-cyan-400'
                          }`}
                        />
                        <span className="font-medium">{participant.name}</span>
                        <span className="ml-1 text-sm opacity-75 flex items-center gap-1">
                          {isAdmin(participant) ? (
                            <>
                              <MdAdminPanelSettings className="text-lg" />
                              Admin
                            </>
                          ) : (
                            <>
                              <MdPerson className="text-lg" />
                              You
                            </>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Messages - INCREASED sizes */}
              <div className="space-y-4">
                {messages?.length ? (
                  messages.map((msg, idx) => {
                    const isAdminMsg = isAdmin(msg.sender)
                    return (
                      <div
                        key={`${msg._id || msg.createdAt}-${idx}`}
                        className={`flex ${isAdminMsg ? 'justify-start' : 'justify-end'}`}
                      >
                        <div
                          className={`max-w-xs md:max-w-lg rounded-2xl px-6 py-4 ${
                            isAdminMsg
                              ? isDark
                                ? 'border border-emerald-400/20 bg-emerald-500/10 text-slate-100'
                                : 'border border-emerald-400/30 bg-emerald-50 text-gray-800'
                              : isDark
                                ? 'border border-cyan-400/20 bg-cyan-500/10 text-slate-100'
                                : 'border border-cyan-400/30 bg-cyan-50 text-gray-800'
                          }`}
                        >
                          {isAdminMsg && (
                            <p className={`mb-2 text-sm font-semibold uppercase tracking-[0.12em] flex items-center gap-1.5 ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>
                              <MdAdminPanelSettings className="text-lg" />
                              Admin
                            </p>
                          )}
                          <p className="text-base leading-relaxed">{msg.text}</p>
                          <p className={`mt-2 text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className={`rounded-2xl border border-dashed px-8 py-16 text-center ${
                    isDark ? 'border-white/10 bg-white/[0.03]' : 'border-gray-300 bg-gray-50'
                  }`}>
                    <MdChat className={`text-6xl mx-auto mb-4 ${isDark ? 'text-slate-500' : 'text-gray-400'}`} />
                    <p className={`text-lg font-medium ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                      No messages yet.
                    </p>
                    <p className={`mt-2 text-base ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
                      Send a message to start the conversation.
                    </p>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input area - INCREASED sizes */}
      <footer className={`relative z-10 border-t ${isDark ? 'border-white/10 bg-slate-950/80' : 'border-gray-200 bg-white/80'} backdrop-blur-xl`}>
        <div className="mx-auto max-w-4xl px-6 py-6 md:px-8">
          <div className="space-y-4">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                  handleSend()
                }
              }}
              rows={3}
              placeholder="Type your message… (Ctrl+Enter to send)"
              className={`w-full rounded-2xl border px-5 py-4 text-base outline-none transition-all duration-200 resize-none placeholder:text-base ${
                isDark
                  ? 'border-white/10 bg-white/5 text-slate-100 placeholder-slate-500 focus:border-emerald-400/50 focus:bg-white/[0.08] focus:ring-2 focus:ring-emerald-400/20'
                  : 'border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:border-emerald-400/50 focus:bg-white focus:ring-2 focus:ring-emerald-400/20'
              }`}
            />
            <div className="flex items-center justify-between gap-4">
              <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
                Press Ctrl+Enter to send
              </p>
              <button
                type="button"
                onClick={handleSend}
                disabled={!message.trim() || sending}
                className="rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 px-7 py-3.5 text-base font-semibold text-white transition-all duration-200 hover:from-emerald-300 hover:to-cyan-300 hover:shadow-[0_0_20px_rgba(52,211,153,0.4)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2.5"
              >
                {sending ? (
                  <>
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Sending…
                  </>
                ) : (
                  <>
                    <MdSend className="text-xl" />
                    Send message
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </footer>
    </section>
  )
}