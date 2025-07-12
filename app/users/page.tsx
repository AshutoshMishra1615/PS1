'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Search, MapPin, Star, MessageSquare, Users } from 'lucide-react'
import Navbar from '@/components/Layout/Navbar'
import Footer from '@/components/Layout/Footer'
import SwapRequestModal from '@/components/Modals/SwapRequestModal'
import { User } from '@/types'

export default function UsersPage() {
  const { data: session } = useSession()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showSwapModal, setShowSwapModal] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchUsers()
  }, [searchTerm, currentPage])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '16'
      })

      if (searchTerm) params.append('skill', searchTerm)

      const response = await fetch(`/api/users/search?${params}`)
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
        setTotalPages(data.pagination.total)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSwapRequest = (user: User) => {
    setSelectedUser(user)
    setShowSwapModal(true)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Community</h1>
          <p className="text-gray-600">
            Connect with talented people from around the world
          </p>
        </div>

        {/* Search */}
        <Card className="border-0 shadow-lg mb-8">
          <CardContent className="p-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by name or skill..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11"
              />
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(12)].map((_, i) => (
              <Card key={i} className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="animate-pulse">
                    <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded mb-4"></div>
                    <div className="space-y-2">
                      <div className="h-6 bg-gray-200 rounded"></div>
                      <div className="h-6 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">
                <Users className="inline h-4 w-4 mr-1" />
                {users.length} members found
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {users.map((user) => (
                <Card key={user._id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-6">
                    <div className="text-center mb-4">
                      <Avatar className="h-16 w-16 mx-auto mb-3">
                        <AvatarImage src={user.profilePhoto} />
                        <AvatarFallback className="bg-purple-100 text-purple-600 text-lg">
                          {user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <h3 className="font-semibold text-gray-900">{user.name}</h3>
                      {user.location && (
                        <p className="text-sm text-gray-500 flex items-center justify-center mt-1">
                          <MapPin className="h-3 w-3 mr-1" />
                          {user.location}
                        </p>
                      )}
                      <div className="flex items-center justify-center mt-2">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600 ml-1">
                          {user.rating.toFixed(1)} ({user.reviewCount})
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {user.skillsOffered.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                            Skills Offered
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {user.skillsOffered.slice(0, 2).map((skill, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                            {user.skillsOffered.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{user.skillsOffered.length - 2}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {user.skillsWanted.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                            Skills Wanted
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {user.skillsWanted.slice(0, 2).map((skill, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                            {user.skillsWanted.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{user.skillsWanted.length - 2}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {session && session.user?.id !== user._id && (
                      <Button
                        onClick={() => handleSwapRequest(user)}
                        className="w-full mt-4 bg-purple-600 hover:bg-purple-700"
                        size="sm"
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Connect
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    const page = i + 1
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        onClick={() => setCurrentPage(page)}
                        className={currentPage === page ? "bg-purple-600 hover:bg-purple-700" : ""}
                      >
                        {page}
                      </Button>
                    )
                  })}
                  
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />

      {/* Swap Request Modal */}
      {selectedUser && (
        <SwapRequestModal
          isOpen={showSwapModal}
          onClose={() => {
            setShowSwapModal(false)
            setSelectedUser(null)
          }}
          targetUser={selectedUser}
          onSuccess={() => {
            setShowSwapModal(false)
            setSelectedUser(null)
          }}
        />
      )}
    </div>
  )
}