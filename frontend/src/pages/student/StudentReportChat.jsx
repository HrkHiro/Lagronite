import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { io } from 'socket.io-client'
import { readStoredToken } from '../../services/api.js'

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

  // Fetch initial chat data
  useEffect(() => {
    const fetchChat = async () => {
      try {
        setLoading(true)
        const res = await fetch(
          `http://localhost:5000/api/chats/${reportType}/${reportId}`,
          { credentials: 'include' }
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
      const res = await fetch(
        `http://localhost:5000/api/chats/${reportType}/${reportId}`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
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
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 text-white">
        <div className="rounded-2xl border border-white/10 bg-white/5 px-8 py-6 backdrop-blur-xl">
          <p className="text-center text-slate-400">Loading conversation…</p>
        </div>
      </section>
    )
  }

  return (
    <section className="relative flex min-h-screen flex-col overflow-hidden bg-slate-950 text-white">
      {/* Background effects */}
      <style>{`
        @keyframes glowPulse {
          0%, 100% { opacity: 0.45; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.1); }
        }
        .glow-a { animation: glowPulse 8s ease-in-out infinite; }
        .glow-b { animation: glowPulse 9s ease-in-out infinite 1.5s; }
        .dot-grid {
          background-image: radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px);
          background-size: 28px 28px;
          mask-image: radial-gradient(ellipse 80% 60% at 30% 40%, black 0%, transparent 75%);
        }
      `}</style>

      <div className="dot-grid pointer-events-none absolute inset-0" />
      <div className="glow-a absolute -left-40 -top-40 h-[420px] w-[420px] rounded-full bg-emerald-500/[0.06] blur-[160px]" />
      <div className="glow-b absolute -right-40 -bottom-40 h-[420px] w-[420px] rounded-full bg-cyan-500/[0.06] blur-[160px]" />

      {/* Header */}
      <header className="relative z-10 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-4 md:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300">
              Support Chat
            </p>
            <h1 className="mt-1 text-2xl font-bold text-white md:text-3xl">
              Report Discussion
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Chat with an admin about your report
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/student/reports')}
            className="whitespace-nowrap rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold transition hover:bg-white/10 hover:border-white/20"
          >
            Back to reports
          </button>
        </div>
      </header>

      {/* Chat area */}
      <div className="relative z-10 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-4xl">
          {error ? (
            <div className="m-6 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-6 text-rose-100">
              {error}
            </div>
          ) : (
            <div className="space-y-6 p-4 md:p-8">
              {/* Participants */}
              {chat?.participants && (
                <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4 md:p-6">
                  <p className="text-xs uppercase tracking-[0.24em] text-emerald-300">
                    Participants
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    {chat.participants.map((participant) => (
                      <div
                        key={participant._id}
                        className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm ${
                          isAdmin(participant)
                            ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-200'
                            : 'border-cyan-400/30 bg-cyan-500/10 text-cyan-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-2 w-2 rounded-full ${
                            isAdmin(participant) ? 'bg-emerald-400' : 'bg-cyan-400'
                          }`}
                        />
                        <span className="font-medium">{participant.name}</span>
                        <span className="ml-1 text-xs opacity-75">
                          {isAdmin(participant) ? '👨‍💼 Admin' : '👤 You'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Messages */}
              <div className="space-y-4">
                {messages?.length ? (
                  messages.map((msg, idx) => {
                    const isAdminMsg = isAdmin(msg.sender)
                    return (
                      <div
                        key={`${msg._id || msg.createdAt}-${idx}`}
                        className={`flex ${
                          isAdminMsg ? 'justify-start' : 'justify-end'
                        }`}
                      >
                        <div
                          className={`max-w-xs rounded-2xl px-5 py-3 md:max-w-md ${
                            isAdminMsg
                              ? 'border border-emerald-400/20 bg-emerald-500/10 text-slate-100'
                              : 'border border-cyan-400/20 bg-cyan-500/10 text-slate-100'
                          }`}
                        >
                          {isAdminMsg && (
                            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-300">
                              Admin
                            </p>
                          )}
                          <p className="text-sm leading-relaxed">{msg.text}</p>
                          <p className="mt-2 text-xs text-slate-400">
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
                  <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] px-6 py-12 text-center text-slate-400">
                    <p className="text-sm">No messages yet.</p>
                    <p className="mt-1 text-xs">
                      Send a message to start the conversation.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input area */}
      <footer className="relative z-10 border-t border-white/10 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto max-w-4xl px-4 py-6 md:px-8">
          <div className="space-y-3">
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
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-slate-100 placeholder-slate-500 outline-none transition focus:border-emerald-400/50 focus:bg-white/[0.08] focus:ring-1 focus:ring-emerald-400/20"
            />
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-slate-500">Press Ctrl+Enter to send</p>
              <button
                type="button"
                onClick={handleSend}
                disabled={!message.trim() || sending}
                className="rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:from-emerald-300 hover:to-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? 'Sending…' : 'Send message'}
              </button>
            </div>
          </div>
        </div>
      </footer>
    </section>
  )
}