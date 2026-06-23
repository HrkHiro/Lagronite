import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { io } from 'socket.io-client'
import { fetchReportChat, sendReportMessage } from '../../services/reportsService.js'

export function ReportChat() {
  const { reportType, reportId } = useParams()
  const navigate = useNavigate()
  const [chat, setChat] = useState(null)
  const [messages, setMessages] = useState([])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)
  const [socket, setSocket] = useState(null)

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

    // Get auth token from localStorage, cookies, or sessionStorage
    let token = localStorage.getItem('token')
    if (!token) {
      token = sessionStorage.getItem('token')
    }
    if (!token) {
      const cookies = document.cookie.split('; ')
      const authCookie = cookies.find((row) => row.startsWith('authToken=') || row.startsWith('token='))
      if (authCookie) {
        token = authCookie.split('=')[1]
      }
    }
    if (!token) {
      console.error('No authentication token found')
      return
    }

    const newSocket = io('http://localhost:5000', {
      auth: {
        token: token || '',
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      transports: ['websocket', 'polling'],
    })

    newSocket.on('connect', () => {
      console.log('Connected to socket server')
      newSocket.emit('join_chat', { reportType, reportId })
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

    setSocket(newSocket)

    return () => {
      if (newSocket) {
        newSocket.emit('leave_chat', { reportType, reportId })
        newSocket.disconnect()
      }
    }
  }, [reportType, reportId])

  const handleSend = async () => {
    if (!message.trim() || !socket) return

    try {
      setSending(true)
      await sendReportMessage(reportType, reportId, message)

      // Emit the message via Socket.IO
      socket.emit('send_message', {
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
    <div className="space-y-8 text-white">
      <div className="flex items-center justify-between rounded-[2rem] border border-white/10 bg-slate-950/90 p-6">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Report Chat</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Conversation</h1>
          <p className="mt-2 text-slate-400">Chat with the student who submitted this report.</p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/admin/reports')}
          className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
        >
          Back to reports
        </button>
      </div>

      {loading ? (
        <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-8 text-center text-slate-400">Loading chat…</div>
      ) : error ? (
        <div className="rounded-[1.75rem] border border-rose-500/20 bg-rose-500/10 p-6 text-rose-100">{error}</div>
      ) : (
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.8)]">
          <div className="mb-6 flex flex-col gap-2">
            <p className="text-sm text-slate-500">Participants</p>
            <div className="flex flex-wrap gap-3">
              {chat?.participants?.map((participant) => (
                <div key={participant._id} className="rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-2 text-sm text-slate-200">
                  {participant.name} · {participant.role}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {messages?.length ? (
              messages.map((messageItem, idx) => (
                <div
                  key={`${messageItem._id || messageItem.createdAt}-${idx}`}
                  className={`rounded-3xl p-4 ${
                    messageItem.sender._id === chat.participants?.find((p) => p.role === 'admin')?._id
                      ? 'bg-emerald-500/10 text-slate-100'
                      : 'bg-white/5 text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 text-xs text-slate-400">
                    <span>{messageItem.sender.name}</span>
                    <span>{new Date(messageItem.createdAt).toLocaleTimeString()}</span>
                  </div>
                  <p className="mt-2 text-sm leading-6">{messageItem.text}</p>
                </div>
              ))
            ) : (
              <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.04] p-8 text-center text-slate-400">
                No messages yet. Start the conversation below.
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                  handleSend()
                }
              }}
              rows={4}
              placeholder="Write your message... (Ctrl+Enter to send)"
              className="w-full rounded-[1.5rem] border border-white/10 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-emerald-400"
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={!message.trim() || sending}
              className="self-end rounded-2xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? 'Sending…' : 'Send message'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
