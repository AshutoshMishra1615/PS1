'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { MessageSquare, Check, X, Trash2, Clock, CheckCircle, XCircle, Calendar } from 'lucide-react'
import Navbar from '@/components/Layout/Navbar'
import Footer from '@/components/Layout/Footer'
import toast from 'react-hot-toast'

interface SwapRequest {
  _id: string
  fromUserId: string
  toUserId: string
  fromUser: { name: string; profilePhoto?: string }
  toUser: { name: string; profilePhoto?: string }
  offeredSkill: string
  requestedSkill: string
  message: string
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled'
  createdAt: string
  updatedAt: string
}

export default function SwapsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [swaps, setSwaps] = useState<SwapRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (status === 'authenticated') {
      fetchSwaps()
    }
  }, [status, router])

  const fetchSwaps = async () => {
    try {
      const response = await fetch('/api/swaps')
      if (response.ok) {
        const data = await response.json()
        setSwaps(data)
      }
    } catch (error) {
      console.error('Error fetching swaps:', error)
      toast.error('Failed to load swap requests')
    } finally {
      setLoading(false)
    }
  }

  const handleSwapAction = async (swapId: string, action: 'accept' | 'reject' | 'complete' | 'cancel') => {
    try {
      const response = await fetch(`/api/swaps/${swapId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      })

      if (response.ok) {
        toast.success(`Swap request ${action}ed successfully`)
        fetchSwaps()
      } else {
        throw new Error(`Failed to ${action} swap request`)
      }
    } catch (error) {
      console.error(`Error ${action}ing swap:`, error)
      toast.error(`Failed to ${action} swap request`)
    }
  }

  const handleDeleteSwap = async (swapId: string) => {
    try {
      const response = await fetch(`/api/swaps/${swapId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Swap request deleted successfully')
        fetchSwaps()
      } else {
        throw new Error('Failed to delete swap request')
      }
    } catch (error) {
      console.error('Error deleting swap:', error)
      toast.error('Failed to delete swap request')
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'accepted':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-blue-500" />
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-gray-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'accepted':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      case 'cancelled':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const filterSwaps = (type: string) => {
    switch (type) {
      case 'sent':
        return swaps.filter(swap => swap.fromUserId === session?.user?.id)
      case 'received':
        return swaps.filter(swap => swap.toUserId === session?.user?.id)
      case 'pending':
        return swaps.filter(swap => swap.status === 'pending')
      case 'completed':
        return swaps.filter(swap => swap.status === 'completed')
      default:
        return swaps
    }
  }

  const SwapCard = ({ swap }: { swap: SwapRequest }) => {
    const isReceived = swap.toUserId === session?.user?.id
    const otherUser = isReceived ? swap.fromUser : swap.toUser
    const canAcceptReject = isReceived && swap.status === 'pending'
    const canComplete = swap.status === 'accepted'
    const canCancel = swap.fromUserId === session?.user?.id && swap.status === 'pending'
    const canDelete = swap.fromUserId === session?.user?.id && swap.status === 'pending'

    return (
      <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={otherUser?.profilePhoto} />
                <AvatarFallback className="bg-purple-100 text-purple-600">
                  {otherUser?.name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-gray-900">{otherUser?.name}</h3>
                <p className="text-sm text-gray-500">
                  {isReceived ? 'Wants to swap with you' : 'You requested a swap'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {getStatusIcon(swap.status)}
              <Badge className={getStatusColor(swap.status)}>
                {swap.status}
              </Badge>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-500 mb-1">
                  {isReceived ? 'They offer' : 'You offer'}
                </p>
                <Badge variant="secondary" className="text-sm">
                  {swap.offeredSkill}
                </Badge>
              </div>
              <div className="text-center">
                <MessageSquare className="h-6 w-6 text-purple-600 mx-auto" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-500 mb-1">
                  {isReceived ? 'They want' : 'You want'}
                </p>
                <Badge variant="outline" className="text-sm">
                  {swap.requestedSkill}
                </Badge>
              </div>
            </div>
          </div>

          {swap.message && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 italic">"{swap.message}"</p>
            </div>
          )}

          <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
            <span className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              {new Date(swap.createdAt).toLocaleDateString()}
            </span>
          </div>

          <div className="flex space-x-2">
            {canAcceptReject && (
              <>
                <Button
                  onClick={() => handleSwapAction(swap._id, 'accept')}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  size="sm"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Accept
                </Button>
                <Button
                  onClick={() => handleSwapAction(swap._id, 'reject')}
                  variant="outline"
                  className="flex-1 text-red-600 border-red-600 hover:bg-red-50"
                  size="sm"
                >
                  <X className="h-4 w-4 mr-2" />
                  Reject
                </Button>
              </>
            )}

            {canComplete && (
              <Button
                onClick={() => handleSwapAction(swap._id, 'complete')}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                size="sm"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark Complete
              </Button>
            )}

            {canCancel && (
              <Button
                onClick={() => handleSwapAction(swap._id, 'cancel')}
                variant="outline"
                className="flex-1"
                size="sm"
              >
                Cancel
              </Button>
            )}

            {canDelete && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="text-red-600 border-red-600 hover:bg-red-50">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Swap Request</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this swap request? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDeleteSwap(swap._id)}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </CardContent>
      </Card>
    )
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

  const filteredSwaps = filterSwaps(activeTab)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Swaps</h1>
          <p className="text-gray-600">
            Manage your skill swap requests and track your progress
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All Swaps</TabsTrigger>
            <TabsTrigger value="sent">Sent</TabsTrigger>
            <TabsTrigger value="received">Received</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-6">
            {filteredSwaps.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredSwaps.map((swap) => (
                  <SwapCard key={swap._id} swap={swap} />
                ))}
              </div>
            ) : (
              <Card className="border-0 shadow-lg">
                <CardContent className="text-center py-12">
                  <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No swap requests found
                  </h3>
                  <p className="text-gray-500 mb-6">
                    {activeTab === 'all' 
                      ? "You haven't made or received any swap requests yet."
                      : `No ${activeTab} swap requests found.`
                    }
                  </p>
                  <Button 
                    onClick={() => router.push('/browse')}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Browse Skills
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  )
}