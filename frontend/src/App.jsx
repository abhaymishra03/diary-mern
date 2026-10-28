import { useEffect, useState } from 'react'
import './App.css'

const emptyAuthForm = { username: '', email: '', password: '' }
const emptyDiaryForm = { title: '', content: '' }

const safeStorage = {
  getItem(key) {
    try {
      if (typeof window === 'undefined') return null
      return window.localStorage.getItem(key)
    } catch {
      return null
    }
  },
  setItem(key, value) {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, value)
      }
    } catch {
      // Ignore storage restrictions in private browsing or blocked contexts.
    }
  },
  removeItem(key) {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key)
      }
    } catch {
      // Ignore storage restrictions in private browsing or blocked contexts.
    }
  },
}

function App() {
  const [isLogin, setIsLogin] = useState(true)
  const [authForm, setAuthForm] = useState(emptyAuthForm)
  const [diaryForm, setDiaryForm] = useState(emptyDiaryForm)
  const [user, setUser] = useState(() => {
    const savedUser = safeStorage.getItem('diaryUser')
    return savedUser ? JSON.parse(savedUser) : null
  })
  const [token, setToken] = useState(() => safeStorage.getItem('diaryToken') || '')
  const [diaries, setDiaries] = useState([])
  const [loading, setLoading] = useState(false)
  const [diaryLoading, setDiaryLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (!user || !token) {
      safeStorage.removeItem('diaryUser')
      safeStorage.removeItem('diaryToken')
      return
    }

    safeStorage.setItem('diaryUser', JSON.stringify(user))
    safeStorage.setItem('diaryToken', token)
  }, [user, token])

  useEffect(() => {
    if (!token) {
      setDiaries([])
      return
    }

    loadDiaries()
  }, [token])

  async function loadDiaries() {
    try {
      const response = await fetch('/api/diary/getDiaries', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to load diaries')
      }

      setDiaries(data.diaries || [])
    } catch (loadError) {
      setError(loadError.message)
    }
  }

  function handleAuthChange(event) {
    const { name, value } = event.target
    setAuthForm((previous) => ({ ...previous, [name]: value }))
  }

  function handleDiaryChange(event) {
    const { name, value } = event.target
    setDiaryForm((previous) => ({ ...previous, [name]: value }))
  }

  async function handleAuthSubmit(event) {
    event.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register'
      const payload = isLogin
        ? { email: authForm.email, password: authForm.password }
        : authForm

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed')
      }

      const loggedInUser = data.user
      setUser({
        username: loggedInUser.username,
        email: loggedInUser.email,
      })
      setToken(loggedInUser.accessToken)
      setSuccess(
        isLogin ? 'Welcome back! You are signed in.' : 'Account created successfully!'
      )
      setAuthForm(emptyAuthForm)
    } catch (authError) {
      setError(authError.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleDiarySubmit(event) {
    event.preventDefault()
    setDiaryLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/diary/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(diaryForm),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Unable to save diary')
      }

      setSuccess('Diary saved successfully!')
      setDiaryForm(emptyDiaryForm)
      await loadDiaries()
    } catch (diaryError) {
      setError(diaryError.message)
    } finally {
      setDiaryLoading(false)
    }
  }

  async function handleLogout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch {
      // Ignore logout errors; the UI should still sign the user out.
    } finally {
      setUser(null)
      setToken('')
      setDiaries([])
      setError('')
      setSuccess('You have been logged out.')
    }
  }

  function formatDate(dateString) {
    const date = new Date(dateString)
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-block">
          <div className="brand-mark">D</div>
          <div>
            <p className="eyebrow">Private journal</p>
            <h1>DailyDiary</h1>
          </div>
        </div>

        {user ? (
          <div className="profile-box">
            <div>
              <span className="profile-label">Signed in as</span>
              <strong>{user.username}</strong>
            </div>
            <button type="button" className="secondary-button" onClick={handleLogout}>
              Logout
            </button>
          </div>
        ) : null}
      </header>

      {!user ? (
        <main className="auth-layout">
          <section className="hero-panel">
            <span className="badge">Mindful notes</span>
            <h2>Capture your thoughts, memories, and small wins.</h2>
            <p>
              Build a private, calming space to write daily reflections and look back on
              your journey over time.
            </p>

            <div className="stats-grid">
              <div className="stat-card">
                <strong>7x</strong>
                <span>More consistent journaling</span>
              </div>
              <div className="stat-card">
                <strong>24/7</strong>
                <span>Secure access from anywhere</span>
              </div>
              <div className="stat-card">
                <strong>Daily</strong>
                <span>Clear thought patterns</span>
              </div>
            </div>
          </section>

          <section className="auth-panel">
            <div className="switcher">
              <button
                type="button"
                className={isLogin ? 'active' : ''}
                onClick={() => setIsLogin(true)}
              >
                Login
              </button>
              <button
                type="button"
                className={!isLogin ? 'active' : ''}
                onClick={() => setIsLogin(false)}
              >
                Register
              </button>
            </div>

            <form className="form-card" onSubmit={handleAuthSubmit}>
              {!isLogin ? (
                <label>
                  <span>Username</span>
                  <input
                    type="text"
                    name="username"
                    placeholder="Enter username"
                    value={authForm.username}
                    onChange={handleAuthChange}
                    required
                  />
                </label>
              ) : null}

              <label>
                <span>Email address</span>
                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={authForm.email}
                  onChange={handleAuthChange}
                  required
                />
              </label>

              <label>
                <span>Password</span>
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={authForm.password}
                  onChange={handleAuthChange}
                  required
                />
              </label>

              {error ? <p className="message error">{error}</p> : null}
              {success ? <p className="message success">{success}</p> : null}

              <button type="submit" className="primary-button" disabled={loading}>
                {loading ? 'Please wait...' : isLogin ? 'Login' : 'Create account'}
              </button>
            </form>
          </section>
        </main>
      ) : (
        <main className="dashboard-layout">
          <section className="journal-panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">New entry</p>
                <h2>Write your diary</h2>
              </div>
            </div>

            <form className="journal-form" onSubmit={handleDiarySubmit}>
              <label>
                <span>Title</span>
                <input
                  type="text"
                  name="title"
                  placeholder="A beautiful day in the city"
                  value={diaryForm.title}
                  onChange={handleDiaryChange}
                  required
                />
              </label>

              <label>
                <span>Entry</span>
                <textarea
                  name="content"
                  rows="8"
                  placeholder="Write how your day felt, what happened, and what you learned..."
                  value={diaryForm.content}
                  onChange={handleDiaryChange}
                  required
                />
              </label>

              {error ? <p className="message error">{error}</p> : null}
              {success ? <p className="message success">{success}</p> : null}

              <button type="submit" className="primary-button" disabled={diaryLoading}>
                {diaryLoading ? 'Saving...' : 'Save diary'}
              </button>
            </form>
          </section>

          <aside className="entries-panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Recent memories</p>
                <h2>Your entries</h2>
              </div>
            </div>

            <div className="entries-list">
              {diaries.length === 0 ? (
                <div className="empty-state">
                  <p>No diary entries yet.</p>
                  <span>Your first reflection will appear here.</span>
                </div>
              ) : (
                diaries.map((entry) => (
                  <article key={entry._id} className="entry-card">
                    <div className="entry-meta">
                      <span>{formatDate(entry.createdAt)}</span>
                    </div>
                    <h3>{entry.title}</h3>
                    <p>{entry.content}</p>
                  </article>
                ))
              )}
            </div>
          </aside>
        </main>
      )}
    </div>
  )
}

export default App
