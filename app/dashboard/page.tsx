'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Plus, Search, MessageSquare, Star, Users, TrendingUp, Clock } from 'lucide-react'
import Navbar from '@/components/Layout/Navbar'
import Footer from '@/components/Layout/Footer'

interface DashboardStats {
  totalSwaps: number
  pendingRequests: number
  completedSwaps: number
  rating: number
}

interface RecentSwap {
  _id: string
  fromUser: { name: string; profilePhoto?: string }
  toUser: { name: string; profilePhoto?: string }
  offeredSkill: string
  requestedSkill: string
  status: string
  createdAt: string
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    totalSwaps: 0,
    pendingRequests: 0,
    completedSwaps: 0,
    rating: 0
  })
  const [recentSwaps, setRecentSwaps] = useState<RecentSwap[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchDashboardData()
    }
  }, [session])

  const fetchDashboardData = async () => {
    try {
      const [swapsRes] = await Promise.all([
        fetch('/api/swaps')
      ])

      if (swapsRes.ok) {
        const swaps = await swapsRes.json()
        
        const pendingRequests = swaps.filter((swap: any) => 
          swap.toUserId === session?.user?.id && swap.status === 'pending'
        ).length

        const completedSwaps = swaps.filter((swap: any) => 
          swap.status === 'completed'
        ).length

        setStats({
          totalSwaps: swaps.length,
          pendingRequests,
          completedSwaps,
          rating: 4.8 // Mock rating
        })

        setRecentSwaps(swaps.slice(0, 5))
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const quickActions = [
    {
      title: 'Browse Skills',
      description: 'Find people with skills you need',
      icon: Search,
      href: '/browse',
      color: 'bg-blue-500'
    },
    {
      title: 'My Swaps',
      description: 'View your swap requests',
      icon: MessageSquare,
      href: '/swaps',
      color: 'bg-green-500'
    },
    {
      title: 'Edit Profile',
      description: 'Update your skills and info',
      icon: Plus,
      href: '/profile',
      color: 'bg-purple-500'
    },
    {
      title: 'Community',
      description: 'Explore all users',
      icon: Users,
      href: '/users',
      color: 'bg-orange-500'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {session.user?.name}!
          </h1>
          <p className="text-gray-600">
            Here's what's happening with your skill swaps today.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Swaps</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalSwaps}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Requests</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.pendingRequests}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.completedSwaps}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <MessageSquare className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Rating</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.rating}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <Star className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {quickActions.map((action, index) => (
                    <Link key={index} href={action.href}>
                      <div className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200 hover:-translate-y-1 cursor-pointer">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center`}>
                            <action.icon className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{action.title}</h3>
                            <p className="text-sm text-gray-600">{action.description}</p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div>
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentSwaps.length > 0 ? (
                    recentSwaps.map((swap) => (
                      <div key={swap._id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={swap.fromUser?.profilePhoto} />
                          <AvatarFallback className="bg-purple-100 text-purple-600">
                            {swap.fromUser?.name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {swap.offeredSkill} ↔ {swap.requestedSkill}
                          </p>
                          <p className="text-xs text-gray-500">
                            with {swap.fromUserId === session.user?.id ? swap.toUser?.name : swap.fromUser?.name}
                          </p>
                        </div>
                        <Badge 
                          variant={swap.status === 'completed' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {swap.status}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No recent activity</p>
                      <Link href="/browse">
                        <Button className="mt-4 bg-purple-600 hover:bg-purple-700">
                          Start Browsing Skills
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}