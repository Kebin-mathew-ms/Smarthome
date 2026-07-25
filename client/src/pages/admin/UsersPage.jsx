import React, { useState, useEffect } from 'react';
import { Input, Space, message, Select, Tag, Dropdown, Menu } from 'antd';
import { Search, User, Shield, Lock, CheckCircle, MoreVertical } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import AppTable from '../../components/common/AppTable';
import AppButton from '../../components/common/AppButton';
import StatusBadge from '../../components/common/StatusBadge';
import { adminService } from '../../services/admin.service';
import { formatDate, formatDateTime } from '../../utils/formatters';

const { Option } = Select;

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState(undefined);
  const [statusFilter, setStatusFilter] = useState(undefined);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await adminService.getUsers({
        page,
        limit: pageSize,
        search,
        role: roleFilter,
        status: statusFilter
      });
      if (res.success) {
        setUsers(res.data.items);
        setTotal(res.data.total);
      }
    } catch (err) {
      message.error(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, pageSize, search, roleFilter, statusFilter]);

  const handleStatusChange = async (userId, newStatus) => {
    try {
      const res = await adminService.updateUserStatus(userId, newStatus);
      if (res.success) {
        message.success(`User status updated to ${newStatus}`);
        fetchUsers();
      }
    } catch (err) {
      message.error(err.message || 'Failed to update user status');
    }
  };

  const columns = [
    {
      title: 'Full Name',
      key: 'name',
      render: (_, record) => (
        <Space>
          <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>
            {record.first_name ? record.first_name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <span style={{ fontWeight: 600, display: 'block' }}>{record.first_name} {record.last_name}</span>
            <span style={{ fontSize: 12, color: '#64748b' }}>{record.email}</span>
          </div>
        </Space>
      )
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone'
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role) => {
        const color = role === 'Admin' ? 'red' : role === 'Company' ? 'blue' : 'green';
        return <Tag color={color} icon={<Shield size={12} style={{ marginRight: 4 }} />}>{role}</Tag>;
      }
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <StatusBadge status={status} />
    },
    {
      title: 'Registration Date',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => formatDate(date)
    },
    {
      title: 'Last Login',
      dataIndex: 'last_login',
      key: 'last_login',
      render: (date) => date ? formatDateTime(date) : 'Never'
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => {
        const actionMenu = (
          <Menu
            items={[
              {
                key: 'activate',
                label: 'Activate User',
                icon: <CheckCircle size={16} style={{ color: '#16a34a' }} />,
                onClick: () => handleStatusChange(record.id, 'active')
              },
              {
                key: 'deactivate',
                label: 'Deactivate User',
                onClick: () => handleStatusChange(record.id, 'inactive')
              },
              {
                key: 'block',
                label: 'Block User',
                icon: <Lock size={16} style={{ color: '#dc2626' }} />,
                danger: true,
                onClick: () => handleStatusChange(record.id, 'suspended')
              }
            ]}
          />
        );

        return (
          <Dropdown overlay={actionMenu} trigger={['click']} placement="bottomRight">
            <AppButton icon={<MoreVertical size={16} />} size="small" />
          </Dropdown>
        );
      }
    }
  ];

  return (
    <div>
      <PageHeader
        title="User & Account Control"
        subtitle="Manage customer accounts, roles, access statuses and activity."
      />

      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <Input
          prefix={<Search size={16} style={{ color: '#94a3b8', marginRight: 8 }} />}
          placeholder="Search by name, email or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: 280 }}
          allowClear
        />

        <Select
          placeholder="Filter Role"
          value={roleFilter}
          onChange={setRoleFilter}
          style={{ width: 140 }}
          allowClear
        >
          <Option value="User">Customer</Option>
          <Option value="Company">Company</Option>
          <Option value="Admin">Admin</Option>
        </Select>

        <Select
          placeholder="Filter Status"
          value={statusFilter}
          onChange={setStatusFilter}
          style={{ width: 140 }}
          allowClear
        >
          <Option value="active">Active</Option>
          <Option value="inactive">Inactive</Option>
          <Option value="suspended">Suspended / Blocked</Option>
        </Select>
      </div>

      <AppTable
        columns={columns}
        dataSource={users}
        loading={loading}
        pagination={{
          current: page,
          pageSize,
          total,
          onChange: (p, ps) => {
            setPage(p);
            setPageSize(ps);
          }
        }}
      />
    </div>
  );
};

export default UsersPage;
