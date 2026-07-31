import { useState } from 'react'

export default function TermsQuiz({ onComplete, onCancel }) {
  const questions = [
    {
      id: 1,
      q: 'May users submit false claims for items they did not find?',
      options: ['Yes, it is allowed', 'No, it is prohibited', 'Only admins can submit claims', 'Only during weekends'],
      answer: 1,
    },
    {
      id: 2,
      q: 'What should you do before claiming an item?',
      options: ['Immediately claim without proof', 'Verify owner identity and evidence', 'Ask a friend to claim', 'Delete the original report'],
      answer: 1,
    },
    {
      id: 3,
      q: 'Is sharing another student\'s contact details allowed without consent?',
      options: ['Yes', 'No', 'Only with admin permission', 'Only via public chat'],
      answer: 1,
    },
    {
      id: 4,
      q: 'If you find an item, you should:',
      options: ['Keep it and not report', 'Report it with details and photo', 'Sell it', 'Post it on social media immediately'],
      answer: 1,
    },
    {
      id: 5,
      q: 'What happens if you repeatedly submit false claims?',
      options: ['Nothing', 'Account may be suspended or banned', 'You get a badge', 'Admins will ignore you but no action'],
      answer: 1,
    },
    {
      id: 6,
      q: 'Are administrators allowed to monitor chats for safety?',
      options: ['Yes, for safety and security', 'No, never', 'Only with court order', 'Only for admins who are friends'],
      answer: 0,
    },
  ]

  const [answers, setAnswers] = useState({})
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)

  const current = questions[currentQuestion]
  const progress = ((currentQuestion + 1) / questions.length) * 100
  const answeredCount = Object.keys(answers).length
  const selectedAnswer = answers[current.id]

  const handleSelect = (qid, index) => {
    setAnswers((cur) => ({ ...cur, [qid]: index }))
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((cur) => cur + 1)
    }
  }

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((cur) => cur - 1)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    let s = 0
    for (const q of questions) {
      if (answers[q.id] === q.answer) s++
    }
    setScore(s)
    setShowResult(true)
    if (s >= 4) {
      onComplete({ score: s, passed: true })
    }
  }

  const handleRetake = () => {
    setAnswers({})
    setCurrentQuestion(0)
    setShowResult(false)
    setScore(0)
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <style>{`
        @keyframes quizFadeIn {
          from { opacity: 0; transform: translateY(10px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      <div
        className="w-full max-w-2xl rounded-[28px] border border-slate-200/80 bg-white/95 p-6 shadow-2xl shadow-slate-900/20 backdrop-blur-sm"
        style={{ animation: 'quizFadeIn 220ms ease-out both' }}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600">Quick check</p>
            <h3 className="mt-1 text-xl font-semibold text-slate-900">User Agreement Quiz</h3>
            <p className="mt-2 text-sm text-slate-600">Answer these 6 short questions to confirm you understand the Lost and Found System rules. You need at least 4/6 to continue.</p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-slate-200 px-3 py-1.5 text-sm text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
          >
            Close
          </button>
        </div>

        <div className="mb-4 h-2 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-emerald-500 transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>

        <div className="mb-3 flex items-center justify-between text-sm text-slate-500">
          <span>Question {currentQuestion + 1} of {questions.length}</span>
          <span>{answeredCount}/{questions.length} answered</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <fieldset className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
            <legend className="px-1 text-sm font-semibold text-slate-700">{current.q}</legend>
            <div className="mt-3 grid gap-2">
              {current.options.map((opt, i) => (
                <label
                  key={i}
                  className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition ${
                    selectedAnswer === i
                      ? 'border-emerald-400 bg-emerald-50 text-slate-900'
                      : 'border-transparent bg-white text-slate-600 hover:border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <input
                    type="radio"
                    name={`q${current.id}`}
                    checked={selectedAnswer === i}
                    onChange={() => handleSelect(current.id, i)}
                    className="h-4 w-4 border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="flex items-center justify-between gap-3 pt-1">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentQuestion === 0}
                className="rounded-full border border-slate-200 px-3.5 py-2 text-sm text-slate-600 transition disabled:cursor-not-allowed disabled:opacity-50"
              >
                Back
              </button>
              {currentQuestion < questions.length - 1 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="rounded-full bg-slate-900 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  className="rounded-full bg-emerald-500 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-emerald-400"
                >
                  Submit answers
                </button>
              )}
            </div>

            {showResult && (
              <div className={`text-sm font-medium ${score >= 4 ? 'text-emerald-600' : 'text-rose-600'}`}>
                Score: {score}/6
              </div>
            )}
          </div>

          {showResult && score < 4 && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              <p className="font-medium">You scored below 4. Please retake the quiz.</p>
              <button
                type="button"
                onClick={handleRetake}
                className="mt-3 rounded-full bg-rose-600 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-rose-500"
              >
                Retake quiz
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
