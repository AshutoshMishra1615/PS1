'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, X, Save, User, MapPin, Clock, Eye, EyeOff } from 'lucide-react'
import Navbar from '@/components/Layout/Navbar'
import Footer from '@/components/Layout/Footer'
import toast from 'react-hot-toast'
import { User as UserType } from '@/types'

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<UserType | null>(null)
  const [newSkillOffered, setNewSkillOffered] = useState('')
  const [newSkillWanted, setNewSkillWanted] = useState('')
  const [newAvailability, setNewAvailability] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (status === 'authenticated') {
      fetchProfile()
    }
  }, [status, router])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/users/profile')
      if (response.ok) {
        const data = await response.json()
        setProfile(data)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!profile) return

    setSaving(true)
    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      })

      if (response.ok) {
        toast.success('Profile updated successfully!')
      } else {
        throw new Error('Failed to update profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const addSkillOffered = () => {
    if (newSkillOffered.trim() && profile) {
      setProfile({
        ...profile,
        skillsOffered: [...profile.skillsOffered, newSkillOffered.trim()]
      })
      setNewSkillOffered('')
    }
  }

  const removeSkillOffered = (index: number) => {
    if (profile) {
      setProfile({
        ...profile,
        skillsOffered: profile.skillsOffered.filter((_, i) => i !== index)
      })
    }
  }

  const addSkillWanted = () => {
    if (newSkillWanted.trim() && profile) {
      setProfile({
        ...profile,
        skillsWanted: [...profile.skillsWanted, newSkillWanted.trim()]
      })
      setNewSkillWanted('')
    }
  }

  const removeSkillWanted = (index: number) => {
    if (profile) {
      setProfile({
        ...profile,
        skillsWanted: profile.skillsWanted.filter((_, i) => i !== index)
      })
    }
  }

  const addAvailability = () => {
    if (newAvailability.trim() && profile) {
      setProfile({
        ...profile,
        availability: [...profile.availability, newAvailability.trim()]
      })
      setNewAvailability('')
    }
  }

  const removeAvailability = (index: number) => {
    if (profile) {
      setProfile({
        ...profile,
        availability: profile.availability.filter((_, i) => i !== index)
      })
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!session || !profile) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Profile</h1>
          <p className="text-gray-600">
            Update your information and skills to connect with others
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Photo and Basic Info */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Profile Photo
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <Avatar className="h-32 w-32 mx-auto mb-4">
                  <AvatarImage src={profile.profilePhoto} />
                  <AvatarFallback className="bg-purple-100 text-purple-600 text-2xl">
                    {profile.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <Button variant="outline" className="mb-4">
                  Change Photo
                </Button>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={profile.email}
                      disabled
                      className="mt-1 bg-gray-50"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Profile Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="location">Location (Optional)</Label>
                  <Input
                    id="location"
                    placeholder="e.g., New York, NY"
                    value={profile.location || ''}
                    onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                    className="mt-1"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Profile Visibility</Label>
                    <p className="text-sm text-gray-500">
                      Make your profile visible to other users
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {profile.isPublic ? (
                      <Eye className="h-4 w-4 text-green-600" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    )}
                    <Switch
                      checked={profile.isPublic}
                      onCheckedChange={(checked) => setProfile({ ...profile, isPublic: checked })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Skills Offered */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Skills I Can Offer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Add a skill you can teach"
                      value={newSkillOffered}
                      onChange={(e) => setNewSkillOffered(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addSkillOffered()}
                    />
                    <Button onClick={addSkillOffered} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {profile.skillsOffered.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {skill}
                        <X
                          className="h-3 w-3 cursor-pointer hover:text-red-500"
                          onClick={() => removeSkillOffered(index)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Skills Wanted */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Skills I Want to Learn</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Add a skill you want to learn"
                      value={newSkillWanted}
                      onChange={(e) => setNewSkillWanted(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addSkillWanted()}
                    />
                    <Button onClick={addSkillWanted} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {profile.skillsWanted.map((skill, index) => (
                      <Badge key={index} variant="outline" className="flex items-center gap-1">
                        {skill}
                        <X
                          className="h-3 w-3 cursor-pointer hover:text-red-500"
                          onClick={() => removeSkillWanted(index)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Availability */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Availability
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex space-x-2">
                    <Select value={newAvailability} onValueChange={setNewAvailability}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select availability" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Weekdays">Weekdays</SelectItem>
                        <SelectItem value="Weekends">Weekends</SelectItem>
                        <SelectItem value="Evenings">Evenings</SelectItem>
                        <SelectItem value="Mornings">Mornings</SelectItem>
                        <SelectItem value="Afternoons">Afternoons</SelectItem>
                        <SelectItem value="Flexible">Flexible</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={addAvailability} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {profile.availability.map((time, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {time}
                        <X
                          className="h-3 w-3 cursor-pointer hover:text-red-500"
                          onClick={() => removeAvailability(index)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-purple-600 hover:bg-purple-700"
                size="lg"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}