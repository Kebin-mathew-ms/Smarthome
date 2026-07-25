import React, { useState, useEffect } from 'react';
import { Badge, Popover, List, Typography, Button, Space, message } from 'antd';
import { Bell, CheckCheck, Trash2, Calendar, ShieldCheck, Ticket } from 'lucide-react';
import { experienceService } from '../../services/experience.service';
import { formatDate } from '../../utils/formatters';

const { Text } = Typography;

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await experienceService.getNotifications();
      if (res.success) {
        setNotifications(res.data.notifications);
        setUnreadCount(res.data.unreadCount);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await experienceService.markNotificationRead(id);
      fetchNotifications();
    } catch {
      // ignore
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await experienceService.markAllNotificationsRead();
      message.success('All notifications marked as read');
      fetchNotifications();
    } catch {
      // ignore
    }
  };

  const popoverContent = (
    <div style={{ width: 340, maxHeight: 420, display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 10, borderBottom: '1px solid #f1f5f9' }}>
        <strong>Notifications ({unreadCount} unread)</strong>
        {unreadCount > 0 && (
          <Button type="link" size="small" icon={<CheckCheck size={14} />} onClick={handleMarkAllRead}>
            Mark All Read
          </Button>
        )}
      </div>

      <div style={{ overflowY: 'auto', flex: 1, padding: '8px 0' }}>
        <List
          loading={loading}
          dataSource={notifications}
          renderItem={n => (
            <List.Item
              onClick={() => handleMarkRead(n.id)}
              style={{
                padding: '10px 12px',
                borderRadius: 8,
                background: n.read_status ? 'transparent' : '#eff6ff',
                cursor: 'pointer',
                marginBottom: 4
              }}
            >
              <div style={{ width: '100%' }}>
                <strong style={{ fontSize: 13, display: 'block', color: '#0f172a' }}>{n.title}</strong>
                <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>{n.message}</Text>
                <span style={{ fontSize: 10, color: '#94a3b8' }}>{formatDate(n.created_at)}</span>
              </div>
            </List.Item>
          )}
        />
        {notifications.length === 0 && (
          <div style={{ textAlign: 'center', padding: '20px 0', color: '#94a3b8' }}>No notifications</div>
        )}
      </div>
    </div>
  );

  return (
    <Popover
      content={popoverContent}
      trigger="click"
      open={open}
      onOpenChange={setOpen}
      placement="bottomRight"
    >
      <Badge count={unreadCount} overflowCount={99} size="small">
        <Button shape="circle" icon={<Bell size={18} />} />
      </Badge>
    </Popover>
  );
};

export default NotificationBell;
