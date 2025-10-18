import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Save, FileText, Settings } from 'lucide-react'

export default function EditorPage() {
  const { projectId } = useParams()
  const [content, setContent] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    // TODO: Save to backend
    setTimeout(() => setIsSaving(false), 500)
  }

  const wordCount = content.split(/\s+/).filter(w => w.length > 0).length

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      {/* Toolbar */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-6 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          <span className="text-sm text-slate-600 dark:text-slate-400">
            Project: {projectId || 'New'}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-500">
            {wordCount} words
          </span>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main Editor */}
        <div className="flex-1 flex flex-col">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="flex-1 p-8 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 border-0 focus:ring-0 resize-none font-mono"
            placeholder="Start writing your story..."
            spellCheck="true"
          />
        </div>

        {/* Sidebar */}
        <div className="w-64 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-700 p-4 overflow-y-auto">
          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Project Info
              </h3>
              <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <input
                  type="text"
                  placeholder="Project Title"
                  className="input-base text-sm"
                />
                <select className="input-base text-sm">
                  <option>Novel</option>
                  <option>Short Story</option>
                  <option>Essay</option>
                  <option>Non-fiction</option>
                  <option>Poetry</option>
                </select>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-sm mb-3">Characters</h3>
              <div className="space-y-2">
                <button className="w-full btn-secondary text-sm flex items-center justify-center gap-2">
                  + Add Character
                </button>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-sm mb-3">Timeline</h3>
              <div className="space-y-2">
                <button className="w-full btn-secondary text-sm flex items-center justify-center gap-2">
                  + Add Event
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
