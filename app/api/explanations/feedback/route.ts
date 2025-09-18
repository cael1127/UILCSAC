import { NextRequest, NextResponse } from 'next/server'
import { createApiServerClient, isApiSupabaseConfigured } from '@/lib/supabase/api-server'

export async function POST(request: NextRequest) {
  try {
    const { questionId, userId, isHelpful, notes } = await request.json()

    if (!questionId || typeof isHelpful !== 'boolean') {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!isApiSupabaseConfigured()) {
      // Soft success to avoid blocking UX if server keys not present
      return NextResponse.json({ success: true, skipped: true })
    }

    const supabase = createApiServerClient()

    // Attempt to insert into explanation_feedback if it exists
    const { error } = await supabase
      .from('explanation_feedback')
      .insert({
        question_id: questionId,
        user_id: userId || null,
        is_helpful: isHelpful,
        notes: typeof notes === 'string' && notes.length > 0 ? notes.slice(0, 1000) : null,
      })

    if (error) {
      console.warn('Explanation feedback insert error (non-blocking):', error)
      // Non-blocking: still return success to keep UX smooth
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Explanation feedback error:', error)
    return NextResponse.json({ success: false })
  }
}


