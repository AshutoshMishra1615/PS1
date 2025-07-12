import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const skill = searchParams.get('skill')
    const location = searchParams.get('location')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const client = await clientPromise
    const users = client.db().collection('users')

    const query: any = { isPublic: true, isActive: true }

    if (skill) {
      query.$or = [
        { skillsOffered: { $regex: skill, $options: 'i' } },
        { skillsWanted: { $regex: skill, $options: 'i' } }
      ]
    }

    if (location) {
      query.location = { $regex: location, $options: 'i' }
    }

    const skip = (page - 1) * limit

    const [results, total] = await Promise.all([
      users.find(query, { projection: { password: 0 } })
           .skip(skip)
           .limit(limit)
           .toArray(),
      users.countDocuments(query)
    ])

    return NextResponse.json({
      users: results,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}