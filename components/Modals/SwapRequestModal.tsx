'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, Send } from 'lucide-react'
import toast from 'react-hot-toast'
import { User } from '@/types'

interface SwapRequestModalProps {
  isOpen: boolean
  onClose: () => void
  targetUser: User
  onSuccess: () => void
}

export default function SwapRequestModal({ isOpen, onClose, targetUser, onSuccess }: SwapRequestModalProps) {
  const { data: session } = useSession()
  const [userProfile, setUserProfile] = useState<User | null>(null)
  const [offeredSkill, setOfferedSkill] = useState('')
  const [requestedSkill, setRequestedSkill] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && session) {
      fetchUserProfile()
    }
  }, [isOpen, session])

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/users/profile')
      if (response.ok) {
        const data = await response.json()
        setUserProfile(data)
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!offeredSkill || !requestedSkill) {
      toast.error('Please select both skills')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/swaps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toUserId: targetUser._id,
          offeredSkill,
          requestedSkill,
          message
        })
      })

      if (response.ok) {
        toast.success('Swap request sent successfully!')
        onSuccess()
      } else {
        const data = await response.json()
        throw new Error(data.error || 'Failed to send swap request')
      }
    } catch (error: any) {
      console.error('Error sending swap request:', error)
      toast.error(error.message || 'Failed to send swap request')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setOfferedSkill('')
    setRequestedSkill('')
    setMessage('')
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <MessageSquare className="h-5 w-5 mr-2" />
            Request Skill Swap
          </DialogTitle>
          <DialogDescription>
            Send a swap request to connect and exchange skills
          </DialogDescription>
        </DialogHeader>

        {/* Target User Info */}
        <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
          <Avatar className="h-12 w-12">
            <AvatarImage src={targetUser.profilePhoto} />
            <AvatarFallback className="bg-purple-100 text-purple-600">
              {targetUser.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-gray-900">{targetUser.name}</h3>
            <p className="text-sm text-gray-500">
              {targetUser.skillsOffered.length} skills offered • {targetUser.skillsWanted.length} skills wanted
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Skill I Can Offer */}
          <div>
            <Label htmlFor="offeredSkill">Skill I Can Offer</Label>
            <Select value={offeredSkill} onValueChange={setOfferedSkill}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select a skill you can teach" />
              </SelectTrigger>
              <SelectContent>
                {userProfile?.skillsOffered.map((skill, index) => (
                  <SelectItem key={index} value={skill}>
                    {skill}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {userProfile?.skillsOffered.length === 0 && (
              <p className="text-sm text-gray-500 mt-1">
                Add skills to your profile to make swap requests
              </p>
            )}
          </div>

          {/* Skill I Want */}
          <div>
            <Label htmlFor="requestedSkill">Skill I Want to Learn</Label>
            <Select value={requestedSkill} onValueChange={setRequestedSkill}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select a skill you want to learn" />
              </SelectTrigger>
              <SelectContent>
                {targetUser.skillsOffered.map((skill, index) => (
                  <SelectItem key={index} value={skill}>
                    {skill}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Preview */}
          {offeredSkill && requestedSkill && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p className="text-sm font-medium text-purple-900 mb-2">Swap Preview:</p>
              <div className="flex items-center justify-center space-x-4">
                <Badge variant="secondary">{offeredSkill}</Badge>
                <span className="text-purple-600">↔</span>
                <Badge variant="outline">{requestedSkill}</Badge>
              </div>
            </div>
          )}

          {/* Message */}
          <div>
            <Label htmlFor="message">Message (Optional)</Label>
            <Textarea
              id="message"
              placeholder="Add a personal message to introduce yourself..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="mt-1"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !offeredSkill || !requestedSkill}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {loading ? (
                'Sending...'
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Request
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}