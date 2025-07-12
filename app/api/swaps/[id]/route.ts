import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { action } = await request.json()
    const swapId = params.id

    if (!action || !['accept', 'reject', 'complete', 'cancel'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    const client = await clientPromise
    const swaps = client.db().collection('swapRequests')

    const swap = await swaps.findOne({ _id: new ObjectId(swapId) })
    if (!swap) {
      return NextResponse.json({ error: 'Swap request not found' }, { status: 404 })
    }

    if (action === 'accept' || action === 'reject') {
      if (swap.toUserId !== session.user.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
      }
    } else if (action === 'cancel') {
      if (swap.fromUserId !== session.user.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
      }
    }

    const statusMap = {
      accept: 'accepted',
      reject: 'rejected',
      complete: 'completed',
      cancel: 'cancelled'
    }

    await swaps.updateOne(
      { _id: new ObjectId(swapId) },
      { 
        $set: { 
          status: statusMap[action as keyof typeof statusMap],
          updatedAt: new Date()
        }
      }
    )

    return NextResponse.json({ message: `Swap request ${action}ed successfully` })
  } catch (error) {
    console.error('Swap action error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const swapId = params.id

    const client = await clientPromise
    const swaps = client.db().collection('swapRequests')

    const swap = await swaps.findOne({ _id: new ObjectId(swapId) })
    if (!swap) {
      return NextResponse.json({ error: 'Swap request not found' }, { status: 404 })
    }

    if (swap.fromUserId !== session.user.id && swap.status !== 'pending') {
      return NextResponse.json({ error: 'Cannot delete this swap request' }, { status: 403 })
    }

    await swaps.deleteOne({ _id: new ObjectId(swapId) })

    return NextResponse.json({ message: 'Swap request deleted successfully' })
  } catch (error) {
    console.error('Delete swap error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}