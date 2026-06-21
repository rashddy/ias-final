import { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import Button from '../components/Button'
import IsoInfoBox from '../components/IsoInfoBox'
import { useAuth } from '../context/AuthContext'
import { loadProgress, CHECKLIST_CONTROLS } from '../data/checklistControls'
import { getQuizQuestionsForProgress } from '../data/quizQuestions'
import './Quiz.css'

export default function Quiz() {
  const { user } = useAuth()
  const [progress, setProgress] = useState(loadProgress)
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState(null)
  const [answered, setAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)

  useEffect(() => {
    setProgress(loadProgress())
    const sync = () => setProgress(loadProgress())
    window.addEventListener('storage', sync)
    window.addEventListener('focus', sync)
    return () => {
      window.removeEventListener('storage', sync)
      window.removeEventListener('focus', sync)
    }
  }, [])

  const questions = useMemo(
    () => getQuizQuestionsForProgress(progress.completed),
    [progress.completed]
  )

  const passThreshold = questions.length > 0 ? Math.ceil(questions.length * 0.7) : 0
  const question = questions[current]

  const handleSelect = (index) => {
    if (answered) return
    setSelected(index)
  }

  const handleSubmit = () => {
    if (selected === null || !question) return
    setAnswered(true)
    if (selected === question.correct) {
      setScore((s) => s + 1)
    }
  }

  const handleNext = () => {
    if (current < questions.length - 1) {
      setCurrent((c) => c + 1)
      setSelected(null)
      setAnswered(false)
    } else {
      setFinished(true)
    }
  }

  const retake = () => {
    setCurrent(0)
    setSelected(null)
    setAnswered(false)
    setScore(0)
    setFinished(false)
  }

  const completedCount = progress.completed.length
  const totalControls = CHECKLIST_CONTROLS.length

  if (questions.length === 0) {
    return (
      <Layout>
        <div className="tool-page quiz-gate">
          <div className="quiz-gate__card">
            <div className="quiz-gate__icon">
              <i className="fa-solid fa-list-check" aria-hidden="true" />
            </div>
            <h1>Complete the Checklist First</h1>
            <p>
              Your quiz is personalized based on the ISO 27001 controls you complete
              in the Compliance Checklist. Finish at least one control to unlock questions.
            </p>
            <p className="quiz-gate__progress">
              Checklist progress: <strong>{completedCount} of {totalControls}</strong> controls done
            </p>
            <Link to="/checklist">
              <Button variant="primary">Go to Checklist</Button>
            </Link>
          </div>
        </div>
      </Layout>
    )
  }

  if (finished) {
    const passed = score >= passThreshold

    return (
      <Layout>
        <div className="tool-page quiz-results">
          <div className="quiz-results__card">
            <div className="quiz-results__icon">
              <i className={`fa-solid ${passed ? 'fa-trophy' : 'fa-book'}`} />
            </div>
            <h1>You scored {score}/{questions.length}</h1>
            <p className={`quiz-results__verdict ${passed ? 'quiz-results__verdict--pass' : 'quiz-results__verdict--fail'}`}>
              {passed ? 'Pass' : 'Fail'}
            </p>
            <p className="quiz-results__message">
              {passed
                ? `You demonstrated understanding of ${completedCount} completed control${completedCount !== 1 ? 's' : ''}.`
                : `Need ${passThreshold}/${questions.length} to pass. Review your completed checklist modules and try again.`}
            </p>
            <div className="quiz-results__actions">
              <Button variant="primary" onClick={retake}>Retake Quiz</Button>
              <Link to="/checklist">
                <Button variant="outline">Back to Checklist</Button>
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="tool-page">
        <div className="tool-page__header">
          <h1>Security Awareness Quiz</h1>
          <p>
            {user?.displayName
              ? `Welcome ${user.displayName} — questions from your ${questions.length} completed control${questions.length !== 1 ? 's' : ''}`
              : `Questions based on ${questions.length} completed checklist control${questions.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        <IsoInfoBox title="ISO 27001 A.6.3 — Personalized Assessment">
          This quiz tests what you learned from completed checklist modules.
          Complete more controls in the checklist to unlock additional questions.
        </IsoInfoBox>

        <div className="quiz-meta">
          <span className="quiz-meta__badge">{question.controlId}</span>
          <span className="quiz-meta__hint">
            {completedCount}/{totalControls} controls completed · {questions.length} question{questions.length !== 1 ? 's' : ''} available
          </span>
        </div>

        <div className="quiz-card">
          <div className="quiz-progress">
            <div className="quiz-progress__bar">
              <div
                className="quiz-progress__fill"
                style={{ width: `${((current + 1) / questions.length) * 100}%` }}
              />
            </div>
            <span className="quiz-progress__text">
              Question {current + 1} of {questions.length}
            </span>
          </div>

          <h2 className="quiz-question">{question.question}</h2>

          <div className="quiz-options">
            {question.options.map((option, i) => {
              let className = 'quiz-option'
              if (answered) {
                if (i === question.correct) className += ' quiz-option--correct'
                else if (i === selected) className += ' quiz-option--wrong'
              } else if (i === selected) {
                className += ' quiz-option--selected'
              }

              return (
                <button
                  key={option}
                  type="button"
                  className={className}
                  onClick={() => handleSelect(i)}
                  disabled={answered}
                >
                  <span className="quiz-option__letter">{String.fromCharCode(65 + i)}</span>
                  {option}
                </button>
              )
            })}
          </div>

          {answered && (
            <div className="quiz-explanation">
              <strong>{selected === question.correct ? 'Correct!' : 'Incorrect.'}</strong>
              <p>{question.explanation}</p>
            </div>
          )}

          <div className="quiz-actions">
            {!answered ? (
              <Button variant="primary" onClick={handleSubmit} disabled={selected === null}>
                Submit Answer
              </Button>
            ) : (
              <Button variant="primary" onClick={handleNext}>
                {current < questions.length - 1 ? 'Next Question' : 'See Results'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}
