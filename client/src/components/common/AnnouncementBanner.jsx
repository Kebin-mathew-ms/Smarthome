import React, { useState, useEffect } from 'react';
import { Alert } from 'antd';
import { Megaphone } from 'lucide-react';
import { analyticsService } from '../../services/analytics.service';

const AnnouncementBanner = () => {
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await analyticsService.getActiveAnnouncements();
        if (res.success) setAnnouncements(res.data);
      } catch {
        // ignore
      }
    };
    fetchAnnouncements();
  }, []);

  if (announcements.length === 0) return null;

  return (
    <div style={{ marginBottom: 16 }}>
      {announcements.map(ann => (
        <Alert
          key={ann.id}
          message={<strong>{ann.title}</strong>}
          description={ann.description}
          type="info"
          showIcon
          closable
          style={{ marginBottom: 8, borderRadius: 12, border: '1px solid #93c5fd' }}
        />
      ))}
    </div>
  );
};

export default AnnouncementBanner;
