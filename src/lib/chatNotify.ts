/**
 * Browser notifications for chat replies. They work while the site is open in any tab
 * (including in the background); notifications with the site fully closed would need web push.
 */

export const notifySupported = () => typeof window !== 'undefined' && 'Notification' in window;

export const notifyPermission = (): NotificationPermission | 'unsupported' =>
  notifySupported() ? Notification.permission : 'unsupported';

export async function askNotifyPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (!notifySupported()) return 'unsupported';
  try {
    return await Notification.requestPermission();
  } catch {
    return Notification.permission;
  }
}

export async function showReplyNotification(body: string): Promise<void> {
  if (!notifySupported() || Notification.permission !== 'granted') return;
  const title = 'BC Cargo replied';
  const options: NotificationOptions = {
    body: body.length > 140 ? `${body.slice(0, 137)}...` : body,
    icon: '/icon-192.png',
    badge: '/favicon-32.png',
    tag: 'bc-chat-reply',
  };
  try {
    const reg = 'serviceWorker' in navigator ? await navigator.serviceWorker.getRegistration() : undefined;
    if (reg) {
      await reg.showNotification(title, options);
      return;
    }
  } catch {
    /* fall back to a page notification */
  }
  const n = new Notification(title, options);
  n.onclick = () => {
    window.focus();
    window.dispatchEvent(new CustomEvent('bc-open-chat'));
    n.close();
  };
}
