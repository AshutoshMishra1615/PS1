import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { toUserId, offeredSkill, requestedSkill, message } = await request.json()

    if (!toUserId || !offeredSkill || !requestedSkill) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const client = await clientPromise
    const swaps = client.db().collection('swapRequests')

    const result = await swaps.insertOne({
      fromUserId: session.user.id,
      toUserId,
      offeredSkill,
      requestedSkill,
      message: message || '',
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    })

    return NextResponse.json({ 
      message: 'Swap request sent successfully',
      swapId: result.insertedId 
    })
  } catch (error) {
    console.error('Swap request error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'all'

    const client = await clientPromise
    const swaps = client.db().collection('swapRequests')
    const users = client.db().collection('users')

    let query: any = {}

    if (type === 'sent') {
      query.fromUserId = session.user.id
    } else if (type === 'received') {
      query.toUserId = session.user.id
    } else {
      query.$or = [
        { fromUserId: session.user.id },
        { toUserId: session.user.id }
      ]
    }

    const swapRequests = await swaps.find(query).sort({ createdAt: -1 }).toArray()

    const enrichedSwaps = await Promise.all(
      swapRequests.map(async (swap) => {
        const [fromUser, toUser] = await Promise.all([
          users.findOne({ _id: new ObjectId(swap.fromUserId) }, { projection: { name: 1, profilePhoto: 1 } }),
          users.findOne({ _id: new ObjectId(swap.toUserId) }, { projection: { name: 1, profilePhoto: 1 } })
        ])

        return {
          ...swap,
          fromUser,
          toUser
        }
      })
    )

    return NextResponse.json(enrichedSwaps)
  } catch (error) {
    console.error('Fetch swaps error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}