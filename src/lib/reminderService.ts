import { BookmarkItem } from '@/src/types';
import { toast } from '@/src/components/ui/Toaster';

/**
 * Yêu cầu quyền gửi thông báo từ trình duyệt
 */
export function requestNotificationPermission() {
  if (typeof window !== 'undefined' && 'Notification' in window) {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }
}

/**
 * Kiểm tra các nhắc nhở, hiển thị Notification trình duyệt hoặc Toast chất lượng cao
 * @param bookmarks Danh sách các di sản được đánh dấu
 * @param onTriggered Callback được gọi khi một nhắc nhở vừa kích hoạt (để cập nhật giao diện/lưu trạng thái nếu cần)
 */
export function checkReminders(
  bookmarks: BookmarkItem[],
  onTriggered?: (id: string, reminder: BookmarkItem['reminder']) => void
) {
  if (typeof window === 'undefined') return;

  const now = new Date();
  
  // Lưu danh sách các ID đã được thông báo trong session này để tránh bị spam liên tục mỗi phút
  const notifiedKey = 'culturalvault_notified_reminders';
  let notifiedIds: string[] = [];
  try {
    const stored = sessionStorage.getItem(notifiedKey);
    if (stored) notifiedIds = JSON.parse(stored);
  } catch {}

  bookmarks.forEach((bookmark) => {
    if (!bookmark.reminder || bookmark.reminder.completed) return;
    
    const reminderDate = new Date(bookmark.reminder.date);
    
    // Nếu thời điểm hiện tại đã vượt qua thời gian cài đặt nhắc nhở
    if (reminderDate <= now) {
      if (notifiedIds.includes(bookmark.id)) return; // Đã báo rồi, dừng lại

      const messageTitle = `⏰ Nhắc nhở: Phục dựng & Nghiên cứu ${bookmark.title}`;
      const messageBody = bookmark.reminder.note || `Đã đến thời gian đề xuất kiểm tra chi tiết di sản: ${bookmark.title}.`;

      // 1. Gửi System Notification nếu được cấp quyền
      if ('Notification' in window && Notification.permission === 'granted') {
        try {
          const notification = new Notification(messageTitle, {
            body: messageBody,
            icon: bookmark.imageUrl || '/icon.png',
          });
          
          notification.onclick = () => {
            window.focus();
            // Điều hướng sang trang chi tiết bằng cách dispatch sự kiện định tuyến của chúng ta
            const customPushEvent = new CustomEvent('spa-push-navigation', {
              detail: { href: `/bookmark/${bookmark.id}` }
            });
            window.dispatchEvent(customPushEvent);
          };
        } catch (err) {
          console.error("Lỗi gửi thông báo hệ thống:", err);
        }
      }

      // 2. Dự phòng: Luôn luôn bắn một Toast thông báo trực tiếp trên UI applet của chúng ta
      toast.info(`${messageTitle} - ${messageBody}`);

      // Thêm vào danh sách đã thông báo để không bị lặp lại trong phiên làm việc
      notifiedIds.push(bookmark.id);
      sessionStorage.setItem(notifiedKey, JSON.stringify(notifiedIds));

      // Gọi callback để cập nhật trạng thái nếu cần
      if (onTriggered) {
        onTriggered(bookmark.id, bookmark.reminder);
      }
    }
  });
}
