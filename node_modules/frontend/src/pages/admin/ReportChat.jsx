import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams, useOutletContext } from 'react-router-dom'
import { io } from 'socket.io-client'
import { fetchReportChat, sendReportMessage } from '../../services/reportsService.js'
import { readStoredToken } from '../../services/api.js'
import {
  MdChat,
  MdArrowBack,
  MdSend,
  MdPerson,
  MdAdminPanelSettings,
  MdAccessTime,
  MdError,
  MdWarning,
} from 'react-icons/md'

export function ReportChat() {
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
  const { theme } = useOutletContext() || {}
  
  const isDark = theme === undefined ? true : theme === 'dark'

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
        const data = await fetchReportChat(reportType, reportId)
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

    const newSocket = io('http://localhost:5000', {
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
      await sendReportMessage(reportType, reportId, message)

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

  return (
    <section className={`relative overflow-hidden min-h-screen ${isDark ? 'bg-slate-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <style>{`
        @keyframes glowPulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.08); }
        }
        @keyframes riseIn {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .glow-a { animation: glowPulse 8s ease-in-out infinite; }
        .glow-b { animation: glowPulse 9s ease-in-out infinite 1.5s; }
        .anim-rise { animation: riseIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) both; }
        .dot-grid-dark {
          background-image: radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px);
          background-size: 28px 28px;
          mask-image: radial-gradient(ellipse 80% 60% at 30% 40%, black 0%, transparent 75%);
        }
        .dot-grid-light {
          background-image: radial-gradient(circle, rgba(0,0,0,0.07) 1px, transparent 1px);
          background-size: 28px 28px;
          mask-image: radial-gradient(ellipse 80% 60% at 30% 40%, black 0%, transparent 75%);
        }
      `}</style>

      {/* Background decorations */}
      <div className={`pointer-events-none absolute inset-0 ${isDark ? 'dot-grid-dark' : 'dot-grid-light'}`} />
      <div className={`glow-a absolute -left-32 -top-32 h-[400px] w-[400px] rounded-full ${isDark ? 'bg-emerald-500/[0.06]' : 'bg-emerald-500/[0.12]'} blur-[140px]`} />
      <div className={`glow-b absolute -right-32 -bottom-32 h-[400px] w-[400px] rounded-full ${isDark ? 'bg-cyan-500/[0.06]' : 'bg-cyan-500/[0.12]'} blur-[140px]`} />

      <div className="relative z-10 mx-auto max-w-5xl px-6 py-10 sm:px-8 lg:px-10">
        {/* Header */}
        <div className={`anim-rise mb-8 overflow-hidden rounded-2xl border ${isDark ? 'border-white/10 bg-white/[0.04]' : 'border-gray-200 bg-white'} backdrop-blur-xl shadow-lg`}>
          <div className="flex flex-col gap-6 p-8 sm:flex-row sm:items-center sm:justify-between lg:p-10">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <MdChat className={`text-2xl ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-600">
                  Report Chat
                </p>
              </div>
              <h1 className={`mt-2 text-3xl font-bold tracking-tight sm:text-4xl ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Conversation
              </h1>
              <p className={`mt-2 max-w-xl text-base sm:text-lg ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
                Chat with the student who submitted this report.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/admin/reports')}
              className={`flex items-center gap-2.5 rounded-xl border px-5 py-3 text-base font-semibold transition-all duration-200 hover:-translate-y-0.5 ${
                isDark
                  ? 'border-white/10 bg-white/5 text-slate-200 hover:bg-white/10 hover:border-white/20'
                  : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300'
              }`}
            >
              <MdArrowBack className="text-xl" />
              Back to Reports
            </button>
          </div>
          <div className="h-1 w-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 opacity-80" />
        </div>

        {/* Content */}
        {loading ? (
          <div className={`flex h-48 items-center justify-center rounded-xl border ${isDark ? 'border-white/10 bg-white/[0.04]' : 'border-gray-200 bg-white'} backdrop-blur-xl`}>
            <div className={`h-10 w-10 animate-spin rounded-full border-3 ${isDark ? 'border-white/10 border-t-emerald-400' : 'border-gray-200 border-t-emerald-500'}`} />
            <p className={`ml-4 text-base ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
              Loading chat…
            </p>
          </div>
        ) : error ? (
          <div className={`rounded-xl border ${isDark ? 'border-rose-500/20 bg-rose-500/10 text-rose-100' : 'border-rose-400/30 bg-rose-50 text-rose-800'} p-8 backdrop-blur-xl`}>
            <div className="flex items-center gap-3 mb-3">
              <MdError className="text-3xl" />
              <h3 className="text-xl font-bold">Connection Error</h3>
            </div>
            <p className="text-base">{error}</p>
          </div>
        ) : (
          <div className={`anim-rise rounded-2xl border ${isDark ? 'border-white/10 bg-white/[0.04]' : 'border-gray-200 bg-white'} p-8 shadow-xl backdrop-blur-xl`}>
            {/* Participants */}
            <div className="mb-6">
              <p className={`text-sm font-semibold uppercase tracking-[0.2em] flex items-center gap-2 mb-3 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                <MdPerson className="text-xl" />
                Participants
              </p>
              <div className="flex flex-wrap gap-3">
                {chat?.participants?.map((participant) => (
                  <div
                    key={participant._id}
                    className={`flex items-center gap-2.5 rounded-xl border px-4 py-2.5 text-base font-medium backdrop-blur-sm ${
                      isDark
                        ? 'border-white/10 bg-slate-950/80 text-slate-200'
                        : 'border-gray-200 bg-gray-50 text-gray-700'
                    }`}
                  >
                    {participant.role === 'admin' ? (
                      <MdAdminPanelSettings className={`text-xl ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                    ) : (
                      <MdPerson className={`text-xl ${isDark ? 'text-slate-400' : 'text-gray-400'}`} />
                    )}
                    <span>{participant.name}</span>
                    <span className={`text-sm px-2 py-0.5 rounded-full ${
                      participant.role === 'admin'
                        ? isDark ? 'bg-emerald-500/10 text-emerald-300' : 'bg-emerald-100 text-emerald-700'
                        : isDark ? 'bg-slate-800 text-slate-400' : 'bg-gray-200 text-gray-500'
                    }`}>
                      {participant.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Messages */}
            <div className={`space-y-3 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin ${
              isDark ? 'scrollbar-thumb-white/10 scrollbar-track-transparent' : 'scrollbar-thumb-gray-300 scrollbar-track-gray-100'
            }`}>
              {messages?.length ? (
                messages.map((messageItem, idx) => {
                  const isAdmin = messageItem.sender._id === chat.participants?.find((p) => p.role === 'admin')?._id
                  return (
                    <div
                      key={`${messageItem._id || messageItem.createdAt}-${idx}`}
                      className={`rounded-xl p-5 ${
                        isAdmin
                          ? isDark
                            ? 'bg-emerald-500/10 border border-emerald-400/20'
                            : 'bg-emerald-50 border border-emerald-400/30'
                          : isDark
                            ? 'bg-white/5 border border-white/10'
                            : 'bg-gray-50 border border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4 mb-2">
                        <span className={`flex items-center gap-2 text-base font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                          {isAdmin ? (
                            <MdAdminPanelSettings className={`text-xl ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                          ) : (
                            <MdPerson className={`text-xl ${isDark ? 'text-slate-400' : 'text-gray-400'}`} />
                          )}
                          {messageItem.sender.name}
                        </span>
                        <span className={`flex items-center gap-1.5 text-sm ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
                          <MdAccessTime className="text-base" />
                          {new Date(messageItem.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className={`text-base leading-7 ${isDark ? 'text-slate-100' : 'text-gray-800'}`}>
                        {messageItem.text}
                      </p>
                    </div>
                  )
                })
              ) : (
                <div className={`rounded-xl border border-dashed p-10 text-center ${
                  isDark ? 'border-white/10 bg-white/[0.04]' : 'border-gray-300 bg-gray-50'
                }`}>
                  <MdChat className={`text-6xl mx-auto mb-4 ${isDark ? 'text-slate-500' : 'text-gray-400'}`} />
                  <p className={`text-lg font-medium ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                    No messages yet
                  </p>
                  <p className={`mt-2 text-base ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
                    Start the conversation below.
                  </p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="mt-6 space-y-4">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.ctrlKey) {
                    handleSend()
                  }
                }}
                rows={3}
                placeholder="Write your message… (Ctrl+Enter to send)"
                className={`w-full rounded-xl border px-5 py-4 text-base outline-none transition-all duration-200 resize-none placeholder:text-base ${
                  isDark
                    ? 'border-white/10 bg-slate-950/60 text-slate-100 placeholder:text-slate-500 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/50'
                    : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/50'
                }`}
              />
              <div className="flex items-center justify-between">
                <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
                  Press Ctrl+Enter to send
                </p>
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={!message.trim() || sending}
                  className="flex items-center justify-center gap-3 rounded-xl bg-emerald-500 px-7 py-3.5 text-lg font-semibold text-white transition-all duration-200 hover:bg-emerald-400 hover:shadow-[0_0_30px_rgba(52,211,153,0.4)] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sending ? (
                    <>
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Sending…
                    </>
                  ) : (
                    <>
                      <MdSend className="text-2xl" />
                      Send message
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}