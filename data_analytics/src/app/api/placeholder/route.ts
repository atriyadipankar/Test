import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get title from query parameter
    const { searchParams } = new URL(request.url);
    const title = searchParams.get('title') || 'Default Title';
    
    // Create a redirect to a placeholder image service
    const seed = encodeURIComponent(title);
    const width = 800;
    const height = 400;
    
    // Redirect to a placeholder image service
    return NextResponse.redirect(`https://picsum.photos/seed/${seed}/${width}/${height}`);
  } catch (error) {
    console.error('Error in placeholder API:', error);
    return NextResponse.json({ error: 'Failed to generate placeholder' }, { status: 500 });
  }
}
