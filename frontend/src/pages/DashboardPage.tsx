import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, Plus, LogOut } from 'lucide-react'
import { Project } from '../types'

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // TODO: Fetch projects from API
    setLoading(false)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    window.location.href = '/'
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold">AuthorFlow</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 dark:text-slate-400"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Your Projects</h1>
          <Link to="/editor/new" className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Project
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-slate-500">Loading projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12 card">
            <BookOpen className="w-16 h-16 mx-auto text-slate-300 mb-4" />
            <p className="text-slate-600 mb-4">No projects yet</p>
            <Link to="/editor/new" className="btn-primary">
              Create Your First Project
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Link
                key={project.id}
                to={`/editor/${project.id}`}
                className="card hover:shadow-lg transition-shadow"
              >
                <h3 className="font-bold text-lg mb-2">{project.title}</h3>
                <p className="text-sm text-slate-500 mb-4">{project.description}</p>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>{project.word_count} words</span>
                  <span className="capitalize">{project.status}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
