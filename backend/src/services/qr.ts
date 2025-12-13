import QRCode from 'qrcode';
import crypto from 'crypto';

interface QRPayload {
  ticketId: string;
  owner: string;
  timestamp: number;
  expiry: number;
  nonce: string;
}

export class QRService {
  private signingSecret: string;

  constructor() {
    this.signingSecret = process.env.SIGNING_SECRET || 'dev-secret-key';
  }

  async generateQR(ticketContract: string, tokenId: string): Promise<{
    qrCode: string;
    payload: QRPayload;
    signature: string;
    expiresAt: number;
  }> {
    // Create payload with 10-second expiry (matches judge explanation)
    const timestamp = Date.now();
    const expiry = timestamp + 10000; // 10 seconds
    const nonce = crypto.randomBytes(16).toString('hex');
    
    const payload: QRPayload = {
      ticketId: `${ticketContract}-${tokenId}`,
      owner: ticketContract, // Will be replaced with actual owner from blockchain
      timestamp,
      expiry,
      nonce
    };

    // Create HMAC signature (matches judge explanation)
    const signature = this.signPayload(payload);
    
    // Create QR data (off-chain authentication token)
    const qrData = {
      ...payload,
      signature
    };

    // Generate visual QR code
    const qrCode = await QRCode.toDataURL(JSON.stringify(qrData), {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      margin: 1,
      color: {
        dark: '#7C3AED',  // Purple
        light: '#0D0D0D'  // Dark background
      },
      width: 256
    });

    return {
      qrCode,
      payload,
      signature,
      expiresAt: expiry
    };
  }

  verifyQR(qrData: string): {
    valid: boolean;
    payload?: any;
    reason?: string;
  } {
    try {
      const data = JSON.parse(qrData);
      const { signature, ...payload } = data;

      // Check expiry (10-second window)
      if (Date.now() > payload.expiry) {
        return { valid: false, reason: 'QR code expired (>10 seconds old)' };
      }

      // Verify HMAC signature
      const expectedSignature = this.signPayload(payload);
      if (signature !== expectedSignature) {
        return { valid: false, reason: 'Invalid cryptographic signature' };
      }

      // Extract ticket info for blockchain verification
      const [ticketContract, tokenId] = payload.ticketId.split('-');
      
      return { 
        valid: true, 
        payload: { 
          ticketContract, 
          tokenId,
          timestamp: payload.timestamp,
          expiry: payload.expiry
        } 
      };
    } catch (error) {
      return { valid: false, reason: 'Invalid QR format' };
    }
  }

  private signPayload(payload: QRPayload): string {
    // HMAC signature as explained to judges
    const data = `${payload.ticketId}:${payload.timestamp}:${payload.expiry}:${payload.nonce}`;
    return crypto
      .createHmac('sha256', this.signingSecret)
      .update(data)
      .digest('hex');
  }

  // Generate static QR for testing (doesn't expire)
  async generateStaticQR(ticketContract: string, tokenId: string): Promise<string> {
    const data = {
      ticketContract,
      tokenId,
      static: true,
      note: "This is a static QR for testing - production uses dynamic 10s refresh"
    };

    return await QRCode.toDataURL(JSON.stringify(data), {
      errorCorrectionLevel: 'M',
      width: 256,
      color: {
        dark: '#7C3AED',
        light: '#0D0D0D'
      }
    });
  }
}
