import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import FormData from 'form-data';

// This function handles the POST request to the /api/webhook endpoint.
// It acts as a secure proxy to the n8n webhook.
export async function POST(request: NextRequest) {
  const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
  const apiKey = process.env.API_KEY;

  if (!n8nWebhookUrl || !apiKey) {
    console.error('Server configuration error: N8N_WEBHOOK_URL or API_KEY is not set.');
    return NextResponse.json(
      { message: 'Server is not configured correctly.' },
      { status: 500 }
    );
  }

  try {
    const requestData = await request.formData();
    const file = requestData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ message: 'No file found in the request.' }, { status: 400 });
    }

    // A unique session ID is generated for the client to connect to the WebSocket.
    // This ID is passed to the n8n workflow.
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    // Create a new FormData instance to forward the file and metadata to n8n.
    const formData = new FormData();
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    formData.append('file', fileBuffer, {
        filename: file.name,
        contentType: file.type,
    });
    
    // Forward the timestamp and sessionId to the n8n workflow.
    const timestamp = requestData.get('timestamp');
    if (timestamp) {
        formData.append('timestamp', timestamp as string);
    }
    formData.append('sessionId', sessionId);

    // Asynchronously post the data to the n8n webhook.
    // We don't wait for the n8n workflow to complete here.
    axios.post(n8nWebhookUrl, formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${apiKey}`,
      },
    }).catch(error => {
        // Log errors from the async n8n call, but don't block the client response.
        console.error('Error forwarding request to n8n:', error.response?.data || error.message);
    });

    // Immediately respond to the client with the session ID.
    // The client will use this ID to listen for real-time updates.
    return NextResponse.json({
      message: 'File upload initiated. Awaiting processing.',
      sessionId: sessionId,
    });

  } catch (error: any) {
    console.error('Webhook proxy error:', error);
    return NextResponse.json(
      { message: 'An internal error occurred.' },
      { status: 502 } // Bad Gateway, indicating an issue with the upstream server communication.
    );
  }
}
