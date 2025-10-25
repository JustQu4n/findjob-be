import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  constructor(
    private mailerService: MailerService,
    private configService: ConfigService,
  ) {}

  async sendVerificationEmail(email: string, name: string, token: string): Promise<void> {
    const verificationUrl = `${this.configService.get('FRONTEND_URL')}/verify-email?token=${token}`;

    await this.mailerService.sendMail({
      to: email,
      subject: 'Xác thực email - CareerVibe',
      html: this.getVerificationEmailTemplate(name, verificationUrl),
    });
  }

  async sendPasswordResetEmail(email: string, name: string, token: string): Promise<void> {
    const resetUrl = `${this.configService.get('FRONTEND_URL')}/reset-password?token=${token}`;

    await this.mailerService.sendMail({
      to: email,
      subject: 'Đặt lại mật khẩu - CareerVibe',
      html: this.getPasswordResetEmailTemplate(name, resetUrl),
    });
  }

  async sendWelcomeEmail(email: string, name: string, role: string): Promise<void> {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Chào mừng đến với CareerVibe! 🎉',
      html: this.getWelcomeEmailTemplate(name, role),
    });
  }

  private getVerificationEmailTemplate(name: string, verificationUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
          .button { display: inline-block; padding: 12px 30px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Chào mừng đến với CareerVibe!</h1>
          </div>
          <div class="content">
            <h2>Xin chào ${name},</h2>
            <p>Cảm ơn bạn đã đăng ký tài khoản tại <strong>CareerVibe</strong>!</p>
            <p>Để hoàn tất quá trình đăng ký, vui lòng xác thực địa chỉ email của bạn bằng cách nhấp vào nút bên dưới:</p>
            <div style="text-align: center;">
              <a href="${verificationUrl}" class="button">Xác thực Email</a>
            </div>
            <p>Hoặc copy link sau vào trình duyệt:</p>
            <p style="word-break: break-all; background-color: #e9ecef; padding: 10px; border-radius: 5px;">
              ${verificationUrl}
            </p>
            <p><strong>Lưu ý:</strong> Link xác thực sẽ hết hạn sau 24 giờ.</p>
            <p>Nếu bạn không thực hiện đăng ký này, vui lòng bỏ qua email này.</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 CareerVibe. All rights reserved.</p>
            <p>Email này được gửi tự động, vui lòng không trả lời.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getPasswordResetEmailTemplate(name: string, resetUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #DC2626; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
          .button { display: inline-block; padding: 12px 30px; background-color: #DC2626; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .warning { background-color: #FEF3C7; border-left: 4px solid #F59E0B; padding: 10px; margin: 15px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Đặt lại mật khẩu</h1>
          </div>
          <div class="content">
            <h2>Xin chào ${name},</h2>
            <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
            <p>Nhấp vào nút bên dưới để tạo mật khẩu mới:</p>
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Đặt lại mật khẩu</a>
            </div>
            <p>Hoặc copy link sau vào trình duyệt:</p>
            <p style="word-break: break-all; background-color: #e9ecef; padding: 10px; border-radius: 5px;">
              ${resetUrl}
            </p>
            <div class="warning">
              <strong>⚠️ Lưu ý:</strong>
              <ul>
                <li>Link đặt lại mật khẩu sẽ hết hạn sau 1 giờ</li>
                <li>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này</li>
                <li>Không chia sẻ link này với bất kỳ ai</li>
              </ul>
            </div>
          </div>
          <div class="footer">
            <p>&copy; 2024 CareerVibe. All rights reserved.</p>
            <p>Email này được gửi tự động, vui lòng không trả lời.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getWelcomeEmailTemplate(name: string, role: string): string {
    const frontendUrl = this.configService.get('FRONTEND_URL');
    const roleFeatures = this.getRoleFeatures(role);

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #10B981; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
          .button { display: inline-block; padding: 12px 30px; background-color: #10B981; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .features { background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✨ Email đã được xác thực thành công!</h1>
          </div>
          <div class="content">
            <h2>Xin chào ${name},</h2>
            <p>Chúc mừng! Tài khoản <strong>${role}</strong> của bạn đã được kích hoạt thành công.</p>
            
            <div class="features">
              <h3>🚀 Bạn có thể bắt đầu:</h3>
              ${roleFeatures}
            </div>
            
            <div style="text-align: center;">
              <a href="${frontendUrl}/login" class="button">Đăng nhập ngay</a>
            </div>
            
            <p>Cảm ơn bạn đã tin tưởng và sử dụng CareerVibe!</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 CareerVibe. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getRoleFeatures(role: string): string {
    const features = {
      job_seeker: `
        <ul>
          <li>Tìm kiếm hàng nghìn việc làm hấp dẫn</li>
          <li>Tạo và quản lý hồ sơ cá nhân</li>
          <li>Ứng tuyển vào các vị trí yêu thích</li>
          <li>Theo dõi trạng thái ứng tuyển</li>
        </ul>
      `,
      employer: `
        <ul>
          <li>Đăng tin tuyển dụng</li>
          <li>Quản lý thông tin công ty</li>
          <li>Xem và quản lý hồ sơ ứng tuyển</li>
          <li>Tìm kiếm ứng viên tiềm năng</li>
        </ul>
      `,
      admin: `
        <ul>
          <li>Quản lý hệ thống</li>
          <li>Giám sát hoạt động nền tảng</li>
          <li>Quản lý người dùng</li>
        </ul>
      `,
    };

    return features[role] || features.job_seeker;
  }
}
