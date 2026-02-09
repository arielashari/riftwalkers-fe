// app/api/proxy/route.ts

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return handleProxy(request, 'GET');
}

export async function POST(request: NextRequest) {
  return handleProxy(request, 'POST');
}

export async function PATCH(request: NextRequest) {
  return handleProxy(request, 'PATCH');
}

export async function DELETE(request: NextRequest) {
  return handleProxy(request, 'DELETE');
}

async function handleProxy(request: NextRequest, method: string) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get('path') || '';
  
  // Get authorization header
  const authHeader = request.headers.get('authorization');
  
  // Use environment variable for VPS URL
  const vpsBaseUrl = process.env.VPS_BASE_URL;
  
  if (!vpsBaseUrl) {
    return NextResponse.json(
      { error: 'VPS_BASE_URL not configured' },
      { status: 500 }
    );
  }
  
  const vpsUrl = `${vpsBaseUrl}${path}`;

  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const options: RequestInit = {
      method,
      headers,
    };

    // Add body for POST/PATCH
    if (method !== 'GET' && method !== 'DELETE') {
      const body = await request.json();
      options.body = JSON.stringify(body);
    }

    const response = await fetch(vpsUrl, options);
    const data = await response.json();
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { error: 'Proxy request failed' },
      { status: 500 }
    );
  }
}