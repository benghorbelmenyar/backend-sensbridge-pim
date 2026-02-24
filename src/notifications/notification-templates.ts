export interface NotificationTemplate {
  title: string;
  body: string;
  data: Record<string, string>;
}

export const NOTIFICATION_TEMPLATES: Record<string, NotificationTemplate> = {
  EMAIL_VERIFICATION: {
    title: 'Verify Your Email',
    body: 'Please verify {{email}} to unlock all features',
    data: { type: 'email_verification', action: 'verify_email' },
  },
  APP_UPDATE: {
    title: 'Update Available',
    body: 'Version {{version}} is now available with new features!',
    data: { type: 'app_update', action: 'open_store' },
  },
  PASSWORD_RESET: {
    title: 'Password Reset Confirmation',
    body: 'Your password was successfully reset',
    data: { type: 'password_reset', action: 'none' },
  },
  NEW_FEATURE: {
    title: 'New Feature: {{feature}}',
    body: '{{description}}',
    data: { type: 'feature_announcement', action: 'open_feature' },
  },
  ACCOUNT_ALERT: {
    title: 'Security Alert',
    body: '{{message}}',
    data: { type: 'account_alert', action: 'open_security', priority: 'high' },
  },
  DEVICE_SYNC: {
    title: 'Devices Synced',
    body: 'Your settings were synced from {{device}}',
    data: { type: 'device_sync', action: 'none' },
  },
  SUPPORT_MESSAGE: {
    title: 'New Message from Support',
    body: '{{preview}}',
    data: { type: 'support_message', action: 'open_chat' },
  },
};

export function applyTemplate(
  text: string,
  vars: Record<string, string>,
): string {
  return text.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? `{{${key}}}`);
}
