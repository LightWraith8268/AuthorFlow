import { Link } from 'react-router-dom'
import { BookOpen, Zap, Palette, BarChart3 } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      {/* Header */}
      <header className="px-6 py-4 border-b border-slate-700">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-blue-400" />
            <span className="text-2xl font-bold">AuthorFlow</span>
          </div>
          <Link to="/auth" className="btn-primary">
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="px-6 py-20 max-w-6xl mx-auto">
        <h1 className="text-5xl font-bold mb-6">
          Write. Publish. Monetize.
        </h1>
        <p className="text-xl text-slate-300 mb-8 max-w-2xl">
          The all-in-one platform for writers. Manage manuscripts, collaborate with readers, schedule publishing, and track your success across all platforms.
        </p>
        <Link to="/auth" className="btn-primary inline-block text-lg">
          Start Writing Today
        </Link>
      </section>

      {/* Features */}
      <section className="px-6 py-16 bg-slate-800/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">Everything Writers Need</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { icon: BookOpen, title: 'Smart Editor', desc: 'Distraction-free writing with AI assistance' },
              { icon: Palette, title: 'Cover Design', desc: 'AI-powered book covers for all projects' },
              { icon: BarChart3, title: 'Analytics', desc: 'Track reads, engagement, and earnings' },
              { icon: Zap, title: 'Publish Everywhere', desc: 'One-click distribution to all platforms' },
            ].map((feature, i) => (
              <div key={i} className="card text-center">
                <feature.icon className="w-8 h-8 mx-auto mb-4 text-blue-400" />
                <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">Simple Pricing</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { tier: 'Free', price: '$0', features: ['3 projects', 'Basic editor', '1 platform'] },
              { tier: 'Pro', price: '$9.99/mo', features: ['Unlimited projects', 'All features', '5 platforms'] },
              { tier: 'Plus', price: '$24.99/mo', features: ['Everything in Pro', 'AI assistant', 'Community access'] },
            ].map((plan, i) => (
              <div key={i} className={`card ${i === 1 ? 'ring-2 ring-blue-500' : ''}`}>
                <h3 className="text-2xl font-bold mb-2">{plan.tier}</h3>
                <p className="text-3xl font-bold text-blue-400 mb-6">{plan.price}</p>
                <ul className="space-y-2 mb-8">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button className={i === 1 ? 'btn-primary w-full' : 'btn-secondary w-full'}>
                  Get Started
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-slate-700 text-center text-slate-400">
        <p>&copy; 2024 AuthorFlow. Built for writers, by writers.</p>
      </footer>
    </div>
  )
}
