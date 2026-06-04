import { SITE_CONFIG } from '../config';

const BACKEND_URL = SITE_CONFIG.backendUrl;
const PENDING_QUEUE_KEY = 'manyam_pending_whatsapp';

export async function isBackendAvailable(): Promise<boolean> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/status`, { signal: AbortSignal.timeout(2000) });
    const data = await res.json();
    return data.connected === true;
  } catch {
    return false;
  }
}

function getPendingQueue(): { to: string; message: string; reason: string }[] {
  try {
    return JSON.parse(localStorage.getItem(PENDING_QUEUE_KEY) || '[]');
  } catch {
    return [];
  }
}

function savePendingQueue(queue: { to: string; message: string; reason: string }[]): void {
  localStorage.setItem(PENDING_QUEUE_KEY, JSON.stringify(queue));
}

export function getPendingCount(): number {
  return getPendingQueue().length;
}

export function queuePendingMessage(to: string, message: string, reason: string): void {
  const queue = getPendingQueue();
  queue.push({ to, message, reason });
  savePendingQueue(queue);
  console.log(`[WA] Queued message for ${to} (${reason}). Total pending: ${queue.length}`);
}

export async function flushPendingMessages(): Promise<number> {
  const queue = getPendingQueue();
  if (queue.length === 0) return 0;

  const available = await isBackendAvailable();
  if (!available) return 0;

  let sent = 0;
  for (const item of queue) {
    try {
      const res = await fetch(`${BACKEND_URL}/api/send-whatsapp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: item.to, message: item.message }),
      });
      if (res.ok) {
        sent++;
        console.log(`[WA] Flushed pending message to ${item.to} (${item.reason})`);
      }
    } catch (err) {
      console.error(`[WA] Flush failed for ${item.to}:`, err);
    }
  }

  const remaining = queue.slice(sent);
  savePendingQueue(remaining);
  console.log(`[WA] Flushed ${sent}/${sent + remaining.length} pending messages`);
  return sent;
}

async function trySend(to: string, message: string): Promise<boolean> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/send-whatsapp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, message }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function sendWhatsAppMessage(to: string, message: string): Promise<{ sent: boolean; method: 'backend' | 'queued' }> {
  for (let i = 0; i < 5; i++) {
    const up = await isBackendAvailable();
    if (up) {
      const ok = await trySend(to, message);
      if (ok) {
        console.log(`[WA] Message sent via backend to +${to.replace(/\D/g, '')}`);
        await flushPendingMessages();
        return { sent: true, method: 'backend' };
      }
    }
    if (i < 4) await new Promise(r => setTimeout(r, 1000));
  }

  queuePendingMessage(to, message, 'auto-send');
  console.log(`[WA] Queued message for +${to.replace(/\D/g, '')}`);
  return { sent: false, method: 'queued' };
}

export function startFlushInterval(intervalMs = 15000): ReturnType<typeof setInterval> {
  return setInterval(async () => {
    const sent = await flushPendingMessages();
    if (sent > 0) console.log(`[WA] Auto-flush sent ${sent} message(s)`);
  }, intervalMs);
}

export async function notifyBusinessOrder(order: {
  id: string;
  items: string;
  total: string;
  payment: string;
  customerName: string;
  customerPhone: string;
  address: string;
  city: string;
  pincode: string;
  location: string;
}): Promise<{ sent: boolean; method: 'backend' | 'queued' }> {
  const message =
    `🛒 *NEW ORDER - ${SITE_CONFIG.siteName}* 🛒\n\n` +
    `Order: ${order.id}\n` +
    `Date: ${new Date().toLocaleString('en-IN')}\n\n` +
    `*Items:*\n${order.items}\n\n` +
    `*Total: ${order.total}*\n` +
    `*Payment: ${order.payment}*\n\n` +
    `*Deliver to:*\n${order.customerName}\n${order.customerPhone}\n${order.address}\n${order.city} — ${order.pincode}\n\n` +
    `*User Location:* ${order.location}\n\n` +
    `Website: ${SITE_CONFIG.siteUrl}`;

  return sendWhatsAppMessage(SITE_CONFIG.businessOwnerWhatsApp, message);
}

export async function sendOrderConfirmationToCustomer(customerPhone: string, order: {
  id: string;
  items: string;
  total: string;
  payment: string;
  customerName: string;
}): Promise<{ sent: boolean; method: 'backend' | 'queued' }> {
  const message =
    `🎉 *Order Confirmed - ${SITE_CONFIG.siteName}* 🎉\n\n` +
    `Hi ${order.customerName},\n\n` +
    `Your order has been placed successfully! ✅\n\n` +
    `📋 *Order ID:* ${order.id}\n` +
    `📦 *Items:*\n${order.items}\n\n` +
    `💰 *Total: ${order.total}*\n` +
    `💳 *Payment: ${order.payment}*\n\n` +
    `We'll notify you when your order is on the way! 🚚\n\n` +
    `Track your order: ${SITE_CONFIG.siteUrl}/orders?order=${order.id}\n\n` +
    `Thank you for shopping with us! 🙏`;

  return sendWhatsAppMessage(customerPhone, message);
}

export async function sendTrackingToBusiness(orderId: string, trackingInfo: string): Promise<{ sent: boolean; method: 'backend' | 'queued' }> {
  const message =
    `📦 *Track Order - ${SITE_CONFIG.siteName}*\n\n` +
    `Order: ${orderId}\n\n` +
    `*Timeline:*\n${trackingInfo}\n\n` +
    `Need help? Reply to this message.`;

  return sendWhatsAppMessage(SITE_CONFIG.businessOwnerWhatsApp, message);
}

export async function sendCustomerQueryToBusiness(customerPhone: string, query: string): Promise<{ sent: boolean; method: 'backend' | 'queued' }> {
  const message =
    `📩 *Customer Query - ${SITE_CONFIG.siteName}*\n\n` +
    `From: +${customerPhone.replace(/\D/g, '')}\n` +
    `Message: "${query}"\n\n` +
    `Reply to this message to respond to the customer.`;

  return sendWhatsAppMessage(SITE_CONFIG.businessOwnerWhatsApp, message);
}
