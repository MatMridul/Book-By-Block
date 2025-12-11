'use client'

import { useState, useEffect } from 'react'
import { Plus, TrendingUp, Users, DollarSign, Shield, BarChart3 } from 'lucide-react'

interface Analytics {
  totalEvents: number
  totalTicketsSold: number
  totalRevenue: string
  activeEvents: number
  ticketsScanned: number
  averageResalePrice: string
  topEvents: Array<{
    name: string
    sold: number
    revenue: string
  }>
}

export default function AdminPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCreateEvent, setShowCreateEvent] = useState(false)
  const [eventForm, setEventForm] = useState({
    name: '',
    symbol: '',
    basePrice: '',
    totalSupply: ''
  })
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/analytics`)
        if (response.ok) {
          const result = await response.json()
          setAnalytics(result.data)
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/create-event`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: eventForm.name,
          symbol: eventForm.symbol,
          basePrice: eventForm.basePrice,
          totalSupply: parseInt(eventForm.totalSupply)
        })
      })

      if (response.ok) {
        const result = await response.json()
        alert(`Event created! Event ID: ${result.data.eventId}`)
        setEventForm({ name: '', symbol: '', basePrice: '', totalSupply: '' })
        setShowCreateEvent(false)
      } else {
        throw new Error('Failed to create event')
      }
    } catch (error) {
      alert('Failed to create event. Please check your blockchain connection.')
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
            <button
              onClick={() => setShowCreateEvent(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create Event</span>
            </button>
          </div>

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
                <div className="text-2xl font-bold mb-1">{analytics.totalRevenue} ETH</div>
                <div className="text-dark-muted">Total Revenue</div>
              </div>

              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-accent-warning/20 rounded-lg flex items-center justify-center">
                    <Shield className="w-6 h-6 text-accent-warning" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-accent-success" />
                </div>
                <div className="text-2xl font-bold mb-1">{analytics.ticketsScanned}</div>
                <div className="text-dark-muted">Tickets Scanned</div>
              </div>
            </div>
          ) : null}

          {/* Top Events */}
          {analytics && (
            <div className="grid lg:grid-cols-2 gap-8 mb-8">
              <div className="card">
                <h3 className="text-xl font-semibold mb-6">Top Performing Events</h3>
                <div className="space-y-4">
                  {analytics.topEvents.map((event, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-dark-bg rounded-lg">
                      <div>
                        <div className="font-medium">{event.name}</div>
                        <div className="text-sm text-dark-muted">{event.sold} tickets sold</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-primary-purple">{event.revenue} ETH</div>
                        <div className="text-sm text-dark-muted">Revenue</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card">
                <h3 className="text-xl font-semibold mb-6">Platform Metrics</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-dark-bg rounded-lg">
                    <span>Active Events</span>
                    <span className="font-semibold text-accent-success">{analytics.activeEvents}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-dark-bg rounded-lg">
                    <span>Average Resale Price</span>
                    <span className="font-semibold text-primary-purple">{analytics.averageResalePrice} ETH</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-dark-bg rounded-lg">
                    <span>Fraud Prevention Rate</span>
                    <span className="font-semibold text-accent-success">99.8%</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-dark-bg rounded-lg">
                    <span>Platform Fee Collected</span>
                    <span className="font-semibold text-accent-mint">0.53 ETH</span>
                  </div>
                </div>
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
                    <label className="block text-sm font-medium mb-2">Base Price (ETH)</label>
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
