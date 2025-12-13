'use client'

import { useState, useEffect } from 'react'
import { Plus, BarChart3, Users, DollarSign, Shield, TrendingUp, QrCode } from 'lucide-react'
import { api } from '@/lib/api'

interface Analytics {
  totalEvents: number
  totalTicketsSold: number
  totalRevenue: string
  averageTicketPrice: string
  recentEvents: any[]
}

export default function AdminPage() {
  const [showCreateEvent, setShowCreateEvent] = useState(false)
  const [eventForm, setEventForm] = useState({
    name: '',
    symbol: '',
    basePrice: '',
    totalSupply: ''
  })
  const [creating, setCreating] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await api.getAnalytics()
        if (response.success) {
          setAnalytics(response.data)
        }
      } catch (error) {
        console.error('Failed to fetch analytics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [])

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    
    try {
      const response = await api.createEvent({
        name: eventForm.name,
        symbol: eventForm.symbol,
        basePrice: eventForm.basePrice,
        totalSupply: parseInt(eventForm.totalSupply)
      })
      
      setResult(response)
      if (response.success) {
        setEventForm({ name: '', symbol: '', basePrice: '', totalSupply: '' })
        setShowCreateEvent(false)
        // Refresh analytics
        const analyticsResponse = await api.getAnalytics()
        if (analyticsResponse.success) {
          setAnalytics(analyticsResponse.data)
        }
      }
    } catch (error) {
      setResult({ success: false, error: 'Failed to create event' })
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
              <p className="text-dark-muted">Manage events and monitor platform performance</p>
            </div>
          <div className="flex items-center space-x-4">
            <a 
              href={process.env.NEXT_PUBLIC_SCANNER_URL || 'http://localhost:3002'} 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-secondary flex items-center space-x-2"
            >
              <QrCode className="w-4 h-4" />
              <span>Scanner App</span>
            </a>
            <button
              onClick={() => setShowCreateEvent(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create Event</span>
            </button>
          </div>
          </div>

          {/* Result Message */}
          {result && (
            <div className={`p-4 rounded-lg mb-6 ${result.success ? 'bg-green-900/20 border border-green-500' : 'bg-red-900/20 border border-red-500'}`}>
              {result.success ? (
                <div>
                  <p className="text-green-400">Event created successfully!</p>
                  <p className="text-sm mt-2">Event ID: {result.data?.eventId}</p>
                  <p className="text-sm">Contract: {result.data?.ticketContract}</p>
                  <p className="text-sm">TX: {result.data?.transactionHash}</p>
                </div>
              ) : (
                <p className="text-red-400">{result.error}</p>
              )}
            </div>
          )}

          {/* Analytics Cards */}
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="card">
                  <div className="h-12 bg-dark-border rounded shimmer mb-4"></div>
                  <div className="h-8 bg-dark-border rounded shimmer mb-2"></div>
                  <div className="h-4 bg-dark-border rounded shimmer w-2/3"></div>
                </div>
              ))}
            </div>
          ) : analytics ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-primary-purple/20 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-primary-purple" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-accent-success" />
                </div>
                <div className="text-2xl font-bold mb-1">{analytics.totalEvents}</div>
                <div className="text-dark-muted">Total Events</div>
              </div>

              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-accent-mint/20 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-accent-mint" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-accent-success" />
                </div>
                <div className="text-2xl font-bold mb-1">{analytics.totalTicketsSold.toLocaleString()}</div>
                <div className="text-dark-muted">Tickets Sold</div>
              </div>

              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-accent-success/20 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-accent-success" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-accent-success" />
                </div>
                <div className="text-2xl font-bold mb-1">{analytics.totalRevenue} MATIC</div>
                <div className="text-dark-muted">Total Revenue</div>
              </div>

              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-accent-warning/20 rounded-lg flex items-center justify-center">
                    <Shield className="w-6 h-6 text-accent-warning" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-accent-success" />
                </div>
                <div className="text-2xl font-bold mb-1">{analytics.averageTicketPrice}</div>
                <div className="text-dark-muted">Avg Ticket Price</div>
              </div>
            </div>
          ) : null}

          {/* Recent Events */}
          {analytics && analytics.recentEvents && (
            <div className="card mb-8">
              <h3 className="text-xl font-semibold mb-6">Recent Events</h3>
              <div className="space-y-4">
                {analytics.recentEvents.map((event, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-dark-bg rounded-lg">
                    <div>
                      <div className="font-medium">{event.name}</div>
                      <div className="text-sm text-dark-muted">{event.soldCount}/{event.totalSupply} tickets</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-primary-purple">{event.basePrice} MATIC</div>
                      <div className={`text-sm ${event.active ? 'text-accent-success' : 'text-red-400'}`}>
                        {event.active ? 'Active' : 'Inactive'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Create Event Modal */}
          {showCreateEvent && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-dark-card border border-dark-border rounded-xl p-6 w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6">Create New Event</h2>
                
                <form onSubmit={handleCreateEvent} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Event Name</label>
                    <input
                      type="text"
                      required
                      value={eventForm.name}
                      onChange={(e) => setEventForm({...eventForm, name: e.target.value})}
                      className="input w-full"
                      placeholder="e.g., Blockchain Conference 2024"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Symbol</label>
                    <input
                      type="text"
                      required
                      value={eventForm.symbol}
                      onChange={(e) => setEventForm({...eventForm, symbol: e.target.value})}
                      className="input w-full"
                      placeholder="e.g., CONF2024"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Base Price (MATIC)</label>
                    <input
                      type="number"
                      step="0.001"
                      required
                      value={eventForm.basePrice}
                      onChange={(e) => setEventForm({...eventForm, basePrice: e.target.value})}
                      className="input w-full"
                      placeholder="0.05"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Total Supply</label>
                    <input
                      type="number"
                      required
                      value={eventForm.totalSupply}
                      onChange={(e) => setEventForm({...eventForm, totalSupply: e.target.value})}
                      className="input w-full"
                      placeholder="1000"
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowCreateEvent(false)}
                      className="btn-secondary flex-1"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={creating}
                      className="btn-primary flex-1"
                    >
                      {creating ? 'Creating...' : 'Create Event'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
