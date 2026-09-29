import https from 'https';
import http from 'http';

export interface SmsSendResult {
  success: boolean;
  message: string;
  provider: 'FAST2SMS' | 'TWILIO' | 'CUSTOM_GATEWAY' | 'SIMULATED';
  demoOtp?: string;
}

export class SmsService {
  /**
   * Sends a 6-digit OTP to a 10-digit Indian mobile number.
   * Supports Fast2SMS (Indian SMS Gateway), Twilio, or graceful fallback.
   */
  async sendOtp(mobile: string, otp: string): Promise<SmsSendResult> {
    const cleanMobile = mobile.replace(/[^0-9]/g, '').slice(-10);

    // 1. Fast2SMS Integration (Instant Indian SMS Gateway)
    const fast2smsKey = process.env.FAST2SMS_API_KEY;
    if (fast2smsKey) {
      try {
        const result = await this.sendViaFast2SMS(fast2smsKey, cleanMobile, otp);
        if (result) {
          console.log(`[SMS-SERVICE] Real SMS successfully sent to +91-${cleanMobile} via Fast2SMS.`);
          return {
            success: true,
            message: `OTP has been dispatched via real SMS to +91-${cleanMobile}.`,
            provider: 'FAST2SMS',
          };
        }
      } catch (err: any) {
        console.error('[SMS-SERVICE] Fast2SMS error:', err.message);
      }
    }

    // 2. Twilio Integration (Global SMS)
    const twilioSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioAuth = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhone = process.env.TWILIO_PHONE_NUMBER;
    if (twilioSid && twilioAuth && twilioPhone) {
      try {
        const result = await this.sendViaTwilio(twilioSid, twilioAuth, twilioPhone, cleanMobile, otp);
        if (result) {
          console.log(`[SMS-SERVICE] Real SMS successfully sent to +91-${cleanMobile} via Twilio.`);
          return {
            success: true,
            message: `OTP sent via Twilio SMS to +91-${cleanMobile}.`,
            provider: 'TWILIO',
          };
        }
      } catch (err: any) {
        console.error('[SMS-SERVICE] Twilio error:', err.message);
      }
    }

    // 3. Simulated Fallback (Development & Evaluation Mode)
    console.log(`\n======================================================`);
    console.log(`📱 [SMS DISPATCH SIMULATOR]`);
    console.log(`To: +91-${cleanMobile}`);
    console.log(`Message: Your MoTA Scholarship OTP is: ${otp}. Valid for 10 minutes.`);
    console.log(`Note: To send real SMS to this phone, add FAST2SMS_API_KEY to your .env file.`);
    console.log(`======================================================\n`);

    return {
      success: true,
      message: `OTP generated for +91-${cleanMobile}. (To receive real SMS on your mobile phone, provide FAST2SMS_API_KEY in .env).`,
      provider: 'SIMULATED',
      demoOtp: otp,
    };
  }

  private sendViaFast2SMS(apiKey: string, mobile: string, otp: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const url = `https://www.fast2sms.com/dev/bulkV2?authorization=${encodeURIComponent(
        apiKey
      )}&route=otp&variables_values=${encodeURIComponent(otp)}&numbers=${encodeURIComponent(mobile)}`;

      https
        .get(url, (res) => {
          let data = '';
          res.on('data', (chunk) => (data += chunk));
          res.on('end', () => {
            try {
              const parsed = JSON.parse(data);
              if (parsed.return === true || res.statusCode === 200) {
                resolve(true);
              } else {
                reject(new Error(parsed.message || 'Fast2SMS dispatch failed'));
              }
            } catch {
              resolve(res.statusCode === 200);
            }
          });
        })
        .on('error', (err) => reject(err));
    });
  }

  private sendViaTwilio(
    sid: string,
    authToken: string,
    fromPhone: string,
    mobile: string,
    otp: string
  ): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const postData = new URLSearchParams({
        To: `+91${mobile}`,
        From: fromPhone,
        Body: `Your Ministry of Tribal Affairs (MoTA) Scholarship OTP is: ${otp}. Valid for 10 minutes. Do not share this OTP.`,
      }).toString();

      const options = {
        hostname: 'api.twilio.com',
        port: 443,
        path: `/2010-04-01/Accounts/${sid}/Messages.json`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(postData),
          Authorization: 'Basic ' + Buffer.from(`${sid}:${authToken}`).toString('base64'),
        },
      };

      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', (d) => (body += d));
        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            resolve(true);
          } else {
            reject(new Error(`Twilio error status ${res.statusCode}: ${body}`));
          }
        });
      });

      req.on('error', (e) => reject(e));
      req.write(postData);
      req.end();
    });
  }
}

export const smsService = new SmsService();
