import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
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
    <section className="relative overflow-hidden bg-slate-950 text-white">
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
        .dot-grid {
          background-image: radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px);
          background-size: 28px 28px;
          mask-image: radial-gradient(ellipse 80% 60% at 30% 40%, black 0%, transparent 75%);
        }
      `}</style>

      <div className="dot-grid pointer-events-none absolute inset-0" />
      <div className="glow-a absolute -left-32 -top-32 h-[400px] w-[400px] rounded-full bg-emerald-500/[0.06] blur-[140px]" />
      <div className="glow-b absolute -right-32 -bottom-32 h-[400px] w-[400px] rounded-full bg-cyan-500/[0.06] blur-[140px]" />

      <div className="relative z-10 mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header - smaller, emerald accent */}
        <div className="anim-rise mb-5 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl">
          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between lg:p-6">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-emerald-300">
                Report Chat
              </p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-white lg:text-3xl">
                Conversation
              </h1>
              <p className="mt-1.5 max-w-xl text-xs leading-5 text-slate-400">
                Chat with the student who submitted this report.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/admin/reports')}
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10 hover:border-white/20"
            >
              <MdArrowBack className="text-base" />
              Back
            </button>
          </div>
          <div className="h-0.5 w-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 opacity-80" />
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex h-48 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] backdrop-blur-xl">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-emerald-400" />
            <p className="ml-3 text-sm text-slate-400">Loading chat…</p>
          </div>
        ) : error ? (
          <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-5 text-rose-100 backdrop-blur-xl">
            <h3 className="text-base font-semibold">Error</h3>
            <p className="mt-1 text-sm">{error}</p>
          </div>
        ) : (
          <div className="anim-rise rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.8)] backdrop-blur-xl">
            {/* Participants - compact */}
            <div className="mb-4 flex flex-col gap-1.5">
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-500 flex items-center gap-1.5">
                <MdPerson className="text-slate-400" />
                Participants
              </p>
              <div className="flex flex-wrap gap-2">
                {chat?.participants?.map((participant) => (
                  <div
                    key={participant._id}
                    className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-slate-950/80 px-3 py-1.5 text-xs text-slate-200 backdrop-blur-sm"
                  >
                    {participant.role === 'admin' ? (
                      <MdAdminPanelSettings className="text-emerald-400" />
                    ) : (
                      <MdPerson className="text-slate-400" />
                    )}
                    {participant.name} · <span className="text-slate-500">{participant.role}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Messages - compact */}
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              {messages?.length ? (
                messages.map((messageItem, idx) => {
                  const isAdmin = messageItem.sender._id === chat.participants?.find((p) => p.role === 'admin')?._id
                  return (
                    <div
                      key={`${messageItem._id || messageItem.createdAt}-${idx}`}
                      className={`rounded-xl p-3 ${
                        isAdmin
                          ? 'bg-emerald-500/10 border border-emerald-400/20'
                          : 'bg-white/5 border border-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3 text-[10px] text-slate-400">
                        <span className="flex items-center gap-1.5">
                          {isAdmin ? (
                            <MdAdminPanelSettings className="text-emerald-400" />
                          ) : (
                            <MdPerson className="text-slate-400" />
                          )}
                          {messageItem.sender.name}
                        </span>
                        <span className="flex items-center gap-1">
                          <MdAccessTime className="text-slate-500" />
                          {new Date(messageItem.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="mt-1.5 text-sm leading-5 text-slate-100">{messageItem.text}</p>
                    </div>
                  )
                })
              ) : (
                <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.04] p-6 text-center text-sm text-slate-400">
                  <MdChat className="mx-auto text-3xl text-slate-500 mb-2" />
                  No messages yet. Start the conversation below.
                </div>
              )}
            </div>

            {/* Input - compact */}
            <div className="mt-4 flex flex-col gap-3">
              <div className="relative">
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
                  className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2.5 text-sm text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/50 resize-none placeholder:text-slate-500"
                />
              </div>
              <button
                type="button"
                onClick={handleSend}
                disabled={!message.trim() || sending}
                className="flex items-center justify-center gap-2 self-end rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 hover:shadow-[0_0_20px_rgba(52,211,153,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <MdSend className="text-lg" />
                {sending ? 'Sending…' : 'Send message'}
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}