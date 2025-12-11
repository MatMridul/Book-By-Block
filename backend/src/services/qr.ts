import QRCode from 'qrcode';
import crypto from 'crypto';

interface QRPayload {
  ticketContract: string;
  tokenId: string;
  expiresAt: number;
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
    // Create payload with 10-second expiry
    const expiresAt = Date.now() + 10000;
    const nonce = crypto.randomBytes(16).toString('hex');
    
    const payload: QRPayload = {
      ticketContract,
      tokenId,
      expiresAt,
      nonce
    };

    // Create signature
    const signature = this.signPayload(payload);
    
    // Create QR data
    const qrData = {
      ...payload,
      signature
    };

    // Generate QR code
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
      expiresAt
    };
  }

  verifyQR(qrData: string): {
    valid: boolean;
    payload?: QRPayload;
    reason?: string;
  } {
    try {
      const data = JSON.parse(qrData);
      const { signature, ...payload } = data;

      // Check expiry
      if (Date.now() > payload.expiresAt) {
        return { valid: false, reason: 'QR code expired' };
      }

      // Verify signature
      const expectedSignature = this.signPayload(payload);
      if (signature !== expectedSignature) {
        return { valid: false, reason: 'Invalid signature' };
      }

      return { valid: true, payload };
    } catch (error) {
      return { valid: false, reason: 'Invalid QR format' };
    }
  }

  private signPayload(payload: QRPayload): string {
    const data = `${payload.ticketContract}:${payload.tokenId}:${payload.expiresAt}:${payload.nonce}`;
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
      static: true
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
