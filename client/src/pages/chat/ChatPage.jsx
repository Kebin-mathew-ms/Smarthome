import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Row, Col, Card, Input, Button, Tabs, Tag, Space, Avatar, Typography, Tooltip, App } from 'antd';
import { Send, Mic, Paperclip, Image as ImageIcon, Video, FileText, CheckCheck, Clock, User, Building2, Briefcase, Plus, CornerUpLeft, Edit2, Trash2 } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import SkeletonCard from '../../components/common/SkeletonCard';
import StatusBadge from '../../components/common/StatusBadge';
import VoiceRecorderModal from '../../components/chat/VoiceRecorderModal';
import MediaViewerModal from '../../components/chat/MediaViewerModal';
import WorkUpdateModal from '../../components/chat/WorkUpdateModal';
import { chatService } from '../../services/chat.service';
import { bookingService } from '../../services/booking.service';
import { useAuth } from '../../hooks/useAuth';
import { formatDate } from '../../utils/formatters';
import { ROUTES } from '../../constants/routes';

const { Title, Text, Paragraph } = Typography;

const ChatPage = () => {
  const { message } = App.useApp();
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [booking, setBooking] = useState(null);
  const [room, setRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [workUpdates, setWorkUpdates] = useState([]);
  const [sharedMedia, setSharedMedia] = useState({ images: [], videos: [], voices: [], documents: [] });

  const [loading, setLoading] = useState(true);
  const [textInput, setTextInput] = useState('');
  const [typingUser, setTypingUser] = useState(null);

  // Modals
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isWorkUpdateOpen, setIsWorkUpdateOpen] = useState(false);
  const [mediaViewer, setMediaViewer] = useState({ open: false, url: null, type: 'image' });

  const messagesEndRef = useRef(null);

  const fetchChatData = async () => {
    setLoading(true);
    try {
      const bkRes = await bookingService.getBookingById(bookingId);
      if (bkRes.success) setBooking(bkRes.data);

      const roomRes = await chatService.getRoomByBookingId(bookingId);
      if (roomRes.success) {
        setRoom(roomRes.data);
        const msgRes = await chatService.getMessages(bookingId);
        if (msgRes.success) setMessages(msgRes.data);
      }

      const wuRes = await chatService.getWorkUpdates(bookingId);
      if (wuRes.success) setWorkUpdates(wuRes.data);

      const mediaRes = await chatService.getSharedMedia(bookingId);
      if (mediaRes.success) setSharedMedia(mediaRes.data);
    } catch (err) {
      message.error(err.message || 'Failed to load collaboration room');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChatData();

    // Socket.IO real-time connection
    const token = localStorage.getItem('token');
    const socket = chatService.connectSocket(token);

    socket.emit('join-room', { bookingId });

    socket.on('receive-message', (msg) => {
      setMessages(prev => [...prev, msg]);
      scrollToBottom();
    });

    socket.on('typing-start', ({ userName }) => {
      setTypingUser(userName);
    });

    socket.on('typing-stop', () => {
      setTypingUser(null);
    });

    socket.on('work-update-created', (update) => {
      setWorkUpdates(prev => [update, ...prev]);
    });

    return () => {
      socket.emit('leave-room', { bookingId });
      socket.off('receive-message');
      socket.off('typing-start');
      socket.off('typing-stop');
      socket.off('work-update-created');
    };
  }, [bookingId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!textInput.trim()) return;
    try {
      const msgText = textInput.trim();
      setTextInput('');
      await chatService.sendMessage({
        bookingId,
        message: msgText,
        message_type: 'Text'
      });
    } catch (err) {
      message.error(err.message || 'Failed to send message');
    }
  };

  const handleFileUpload = async (file, type) => {
    try {
      const formData = new FormData();
      formData.append('bookingId', bookingId);

      if (type === 'image') {
        formData.append('chat_image', file);
        await chatService.uploadImage(formData);
      } else if (type === 'video') {
        formData.append('chat_video', file);
        await chatService.uploadVideo(formData);
      } else if (type === 'voice') {
        formData.append('chat_voice', file);
        await chatService.uploadVoice(formData);
      } else {
        formData.append('chat_document', file);
        await chatService.uploadDocument(formData);
      }
      message.success('Attachment uploaded');
      fetchChatData();
    } catch (err) {
      message.error(err.message || 'Upload failed');
    }
  };

  const handleWorkUpdateSubmit = async (formData) => {
    formData.append('bookingId', bookingId);
    await chatService.createWorkUpdate(formData);
    message.success('Work progress update posted');
    fetchChatData();
  };

  if (loading) {
    return (
      <div>
        <PageHeader title="Work Collaboration Room" subtitle="Loading..." />
        <SkeletonCard rows={8} />
      </div>
    );
  }

  if (!booking) {
    return (
      <div>
        <PageHeader title="Booking Room Not Found" />
        <Button onClick={() => navigate(ROUTES.BOOKINGS)}>Back to Bookings</Button>
      </div>
    );
  }

  const isAdmin = user?.role === 'Admin';

  const MediaGalleryTab = (
    <div>
      <Tabs
        size="small"
        items={[
          {
            key: 'images',
            label: `Images (${sharedMedia.images.length})`,
            children: (
              <Row gutter={[8, 8]}>
                {sharedMedia.images.map(img => (
                  <Col span={8} key={img.id}>
                    <div
                      style={{ height: 60, background: '#e2e8f0', borderRadius: 6, overflow: 'hidden', cursor: 'pointer' }}
                      onClick={() => setMediaViewer({ open: true, url: img.file_path, type: 'image' })}
                    >
                      <img src={img.file_path} alt="media" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  </Col>
                ))}
              </Row>
            )
          },
          {
            key: 'videos',
            label: `Videos (${sharedMedia.videos.length})`,
            children: (
              <div>
                {sharedMedia.videos.map(vid => (
                  <div key={vid.id} style={{ marginBottom: 8 }}>
                    <video src={vid.file_path} controls style={{ width: '100%', borderRadius: 8 }} />
                  </div>
                ))}
              </div>
            )
          },
          {
            key: 'docs',
            label: `Documents (${sharedMedia.documents.length})`,
            children: (
              <div>
                {sharedMedia.documents.map(doc => (
                  <div key={doc.id} style={{ padding: 8, background: '#f8fafc', borderRadius: 6, marginBottom: 6, fontSize: 12 }}>
                    <FileText size={14} style={{ marginRight: 6 }} />
                    <a href={doc.file_path} target="_blank" rel="noreferrer">{doc.original_name}</a>
                  </div>
                ))}
              </div>
            )
          }]
        }
      />
    </div>
  );

  return (
    <div>
      <PageHeader
        title={`Work Room — Booking #${booking.booking_number}`}
        subtitle={`${booking.service_name} | Provider: ${booking.company_name}`}
      />

      <Row gutter={[16, 16]}>
        {/* LEFT COLUMN: Booking & Participant Overview */}
        <Col xs={24} lg={6}>
          <Card title="Booking & Team Info" bordered={false} style={{ borderRadius: 16, marginBottom: 16 }}>
            <div style={{ marginBottom: 16 }}>
              <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>Service Requested</Text>
              <strong style={{ fontSize: 15, color: '#0f172a' }}>{booking.service_name}</strong>
              <div style={{ marginTop: 4 }}><StatusBadge status={booking.booking_status} /></div>
            </div>

            <div style={{ padding: 12, background: '#f8fafc', borderRadius: 8, marginBottom: 16, fontSize: 13 }}>
              <div><Building2 size={14} style={{ marginRight: 6, color: '#2563eb' }} /><strong>{booking.company_name}</strong></div>
              <div><User size={14} style={{ marginRight: 6, color: '#16a34a' }} />Customer: {booking.customer_name}</div>
            </div>

            <div>
              <Text strong style={{ fontSize: 13, display: 'block', marginBottom: 8 }}>Assigned Technicians</Text>
              {booking.employees && booking.employees.length > 0 ? (
                booking.employees.map(emp => (
                  <div key={emp.id} style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8, fontSize: 13 }}>
                    <Avatar style={{ background: '#eff6ff', color: '#2563eb' }}>{emp.employee_name.charAt(0)}</Avatar>
                    <div>
                      <strong style={{ display: 'block' }}>{emp.employee_name}</strong>
                      <span style={{ fontSize: 11, color: '#64748b' }}>{emp.designation}</span>
                    </div>
                  </div>
                ))
              ) : (
                <Text type="secondary" style={{ fontSize: 12 }}>No technician assigned yet</Text>
              )}
            </div>
          </Card>
        </Col>

        {/* CENTER COLUMN: WhatsApp-Inspired Real-Time Chat Thread */}
        <Col xs={24} lg={12}>
          <Card
            bordered={false}
            style={{ borderRadius: 16, height: 600, display: 'flex', flexDirection: 'column' }}
            bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 0 }}
          >
            {/* Thread Header */}
            <div style={{ padding: '12px 20px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontWeight: 700, fontSize: 14 }}>Real-Time Room Stream</span>
                {typingUser && (
                  <span style={{ fontSize: 12, color: '#2563eb', marginLeft: 10 }}>{typingUser} is typing...</span>
                )}
              </div>
              {isAdmin && <Tag color="orange">Read-Only Mode (Admin Oversight)</Tag>}
            </div>

            {/* Messages Container */}
            <div style={{ flex: 1, overflowY: 'auto', padding: 20, background: '#f1f5f9' }}>
              {messages.map(msg => {
                const isMe = msg.sender_id === user.id;

                return (
                  <div
                    key={msg.id}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: isMe ? 'flex-end' : 'flex-start',
                      marginBottom: 14
                    }}
                  >
                    <div style={{ fontSize: 11, color: '#64748b', marginBottom: 2 }}>
                      {msg.sender_name} ({msg.sender_role})
                    </div>

                    <div
                      style={{
                        maxWidth: '75%',
                        padding: '10px 14px',
                        borderRadius: isMe ? '12px 12px 0 12px' : '12px 12px 12px 0',
                        background: isMe ? '#2563eb' : '#ffffff',
                        color: isMe ? '#ffffff' : '#0f172a',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                      }}
                    >
                      <Paragraph style={{ margin: 0, color: 'inherit', fontSize: 14 }}>
                        {msg.message}
                      </Paragraph>

                      {/* Attachments Rendering */}
                      {msg.attachments && msg.attachments.map(att => (
                        <div key={att.id} style={{ marginTop: 8 }}>
                          {att.mime_type.startsWith('image/') ? (
                            <img
                              src={att.file_path}
                              alt="att"
                              style={{ maxWidth: '100%', borderRadius: 8, cursor: 'pointer' }}
                              onClick={() => setMediaViewer({ open: true, url: att.file_path, type: 'image' })}
                            />
                          ) : att.mime_type.startsWith('audio/') ? (
                            <audio src={att.file_path} controls style={{ width: '100%' }} />
                          ) : (
                            <a href={att.file_path} target="_blank" rel="noreferrer" style={{ color: isMe ? '#bfdbfe' : '#2563eb', fontSize: 12 }}>
                              <FileText size={14} style={{ marginRight: 4 }} />{att.original_name}
                            </a>
                          )}
                        </div>
                      ))}

                      <div style={{ fontSize: 10, textAlign: 'right', opacity: 0.7, marginTop: 4 }}>
                        {formatDate(msg.created_at)}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Composer Bar */}
            {!isAdmin && (
              <div style={{ padding: 12, borderTop: '1px solid #e2e8f0', background: '#ffffff', display: 'flex', gap: 8, alignItems: 'center' }}>
                <Input
                  placeholder="Type real-time message..."
                  value={textInput}
                  onChange={e => setTextInput(e.target.value)}
                  onPressEnter={handleSendMessage}
                  style={{ flex: 1, borderRadius: 20 }}
                />

                <Tooltip title="Voice Note">
                  <Button icon={<Mic size={18} />} shape="circle" onClick={() => setIsVoiceOpen(true)} />
                </Tooltip>

                <Tooltip title="Attach File">
                  <Button icon={<Paperclip size={18} />} shape="circle" />
                </Tooltip>

                <Button type="primary" shape="circle" icon={<Send size={18} />} onClick={handleSendMessage} />
              </div>
            )}
          </Card>
        </Col>

        {/* RIGHT COLUMN: Work Progress Updates Timeline & Shared Gallery */}
        <Col xs={24} lg={6}>
          <Card
            title="Work Updates & Media"
            extra={
              !isAdmin && (
                <Button size="small" type="primary" icon={<Plus size={14} />} onClick={() => setIsWorkUpdateOpen(true)}>
                  Update
                </Button>
              )
            }
            bordered={false}
            style={{ borderRadius: 16 }}
          >
            <Tabs
              items={[
                {
                  key: 'timeline',
                  label: `Work Updates (${workUpdates.length})`,
                  children: (
                    <div style={{ maxHeight: 460, overflowY: 'auto' }}>
                      {workUpdates.map(wu => (
                        <div key={wu.id} style={{ padding: 12, background: '#f8fafc', borderRadius: 10, marginBottom: 12, border: '1px solid #e2e8f0' }}>
                          <strong style={{ fontSize: 14, color: '#0f172a', display: 'block' }}>{wu.title}</strong>
                          <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 6 }}>
                            By {wu.creator_name} on {formatDate(wu.created_at)}
                          </Text>
                          {wu.description && <Text style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>{wu.description}</Text>}

                          {wu.media && wu.media.length > 0 && (
                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                              {wu.media.map(m => (
                                <div key={m.id} style={{ width: 50, height: 50, borderRadius: 6, overflow: 'hidden', background: '#cbd5e1' }}>
                                  <img src={m.file_path} alt="media" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}

                      {workUpdates.length === 0 && (
                        <Text type="secondary" style={{ fontSize: 12 }}>No work progress updates posted yet.</Text>
                      )}
                    </div>
                  )
                },
                {
                  key: 'gallery',
                  label: 'Shared Media',
                  children: MediaGalleryTab
                }
              ]}
            />
          </Card>
        </Col>
      </Row>

      {/* Modals */}
      <VoiceRecorderModal
        open={isVoiceOpen}
        onCancel={() => setIsVoiceOpen(false)}
        onSendVoice={file => handleFileUpload(file, 'voice')}
      />

      <MediaViewerModal
        open={mediaViewer.open}
        onCancel={() => setMediaViewer({ open: false, url: null, type: 'image' })}
        mediaUrl={mediaViewer.url}
        mediaType={mediaViewer.type}
      />

      <WorkUpdateModal
        open={isWorkUpdateOpen}
        onCancel={() => setIsWorkUpdateOpen(false)}
        onSubmitUpdate={handleWorkUpdateSubmit}
      />
    </div>
  );
};

export default ChatPage;
