import React, { useState, useEffect } from 'react';
import { Input, Space, message, Select, DatePicker, Dropdown, Menu, Tag } from 'antd';
import { Plus, Search, Building2, MoreVertical, Eye, Edit2, Key, Trash2, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import AppTable from '../../components/common/AppTable';
import AppButton from '../../components/common/AppButton';
import ExportCSVButton from '../../components/common/ExportCSVButton';
import StatusBadge from '../../components/common/StatusBadge';
import AppModal from '../../components/common/AppModal';
import { showConfirmModal } from '../../components/common/ConfirmModal';
import { adminService } from '../../services/admin.service';
import { formatDate } from '../../utils/formatters';
import { ROUTES } from '../../constants/routes';

const { Option } = Select;
const { RangePicker } = DatePicker;

const CompaniesPage = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(undefined);
  const [cityFilter, setCityFilter] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');
  const [dateRange, setDateRange] = useState(null);

  // Credential Modal State
  const [credModalOpen, setCredModalOpen] = useState(false);
  const [generatedCreds, setGeneratedCreds] = useState(null);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: pageSize,
        search,
        status: statusFilter,
        city: cityFilter || undefined,
        district: districtFilter || undefined,
        startDate: dateRange && dateRange[0] ? dateRange[0].format('YYYY-MM-DD') : undefined,
        endDate: dateRange && dateRange[1] ? dateRange[1].format('YYYY-MM-DD') : undefined
      };
      const res = await adminService.getCompanies(params);
      if (res.success) {
        setCompanies(res.data.items);
        setTotal(res.data.total);
      }
    } catch (err) {
      message.error(err.message || 'Failed to fetch companies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [page, pageSize, search, statusFilter, cityFilter, districtFilter, dateRange]);

  const handleStatusChange = async (companyId, newStatus) => {
    try {
      const res = await adminService.updateCompanyStatus(companyId, newStatus);
      if (res.success) {
        message.success(`Company status changed to ${newStatus}`);
        fetchCompanies();
      }
    } catch (err) {
      message.error(err.message || 'Failed to update company status');
    }
  };

  const handleResetPassword = async (companyId) => {
    try {
      const res = await adminService.resetCompanyPassword(companyId);
      if (res.success) {
        setGeneratedCreds(res.data);
        setCredModalOpen(true);
        message.success('Company password reset successfully');
      }
    } catch (err) {
      message.error(err.message || 'Failed to reset password');
    }
  };

  const handleDelete = (id) => {
    showConfirmModal({
      title: 'Delete Company',
      content: 'Are you sure you want to delete this company? Soft delete will be performed.',
      onOk: async () => {
        try {
          await adminService.deleteCompany(id);
          message.success('Company soft deleted');
          fetchCompanies();
        } catch (err) {
          message.error(err.message || 'Failed to delete company');
        }
      }
    });
  };

  const columns = [
    {
      title: 'Company Name',
      dataIndex: 'company_name',
      key: 'company_name',
      render: (text, record) => (
        <Space>
          <Building2 size={18} style={{ color: '#2563eb' }} />
          <div>
            <span style={{ fontWeight: 600, display: 'block' }}>{text}</span>
            <span style={{ fontSize: 12, color: '#64748b' }}>{record.company_email}</span>
          </div>
        </Space>
      )
    },
    {
      title: 'Phone',
      dataIndex: 'company_phone',
      key: 'company_phone'
    },
    {
      title: 'City / State',
      key: 'location',
      render: (_, record) => `${record.city}, ${record.state}`
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <StatusBadge status={status} />
    },
    {
      title: 'Created At',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => formatDate(date)
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => {
        const actionMenu = (
          <Menu
            items={[
              {
                key: 'view',
                label: 'View Details',
                icon: <Eye size={16} />,
                onClick: () => navigate(`/admin/companies/${record.id}`)
              },
              {
                key: 'edit',
                label: 'Edit Company',
                icon: <Edit2 size={16} />,
                onClick: () => navigate(`/admin/companies/${record.id}/edit`)
              },
              {
                type: 'divider'
              },
              {
                key: 'status_active',
                label: 'Mark as Active',
                icon: <Tag color="green" />,
                onClick: () => handleStatusChange(record.id, 'active')
              },
              {
                key: 'status_inactive',
                label: 'Mark as Inactive',
                onClick: () => handleStatusChange(record.id, 'inactive')
              },
              {
                key: 'status_blocked',
                label: 'Mark as Blocked',
                onClick: () => handleStatusChange(record.id, 'blocked')
              },
              {
                type: 'divider'
              },
              {
                key: 'reset_pass',
                label: 'Reset Password',
                icon: <Key size={16} />,
                onClick: () => handleResetPassword(record.id)
              },
              {
                key: 'delete',
                label: 'Delete (Soft)',
                icon: <Trash2 size={16} />,
                danger: true,
                onClick: () => handleDelete(record.id)
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
        title="Companies Management"
        subtitle="Full administrative management of service companies, credentials and status."
        extra={
          <Space wrap>
            <ExportCSVButton data={companies} filename="companies-export.csv" />
            <AppButton type="primary" icon={<Plus size={16} />} onClick={() => navigate(ROUTES.ADMIN_ADD_COMPANY)}>
              Add Company
            </AppButton>
          </Space>
        }
      />

      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <Input
          prefix={<Search size={16} style={{ color: '#94a3b8', marginRight: 8 }} />}
          placeholder="Search by name, email, phone, city..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: 260 }}
          allowClear
        />

        <Select
          placeholder="Filter Status"
          value={statusFilter}
          onChange={setStatusFilter}
          style={{ width: 150 }}
          allowClear
        >
          <Option value="pending">Pending</Option>
          <Option value="active">Active</Option>
          <Option value="inactive">Inactive</Option>
          <Option value="blocked">Blocked</Option>
          <Option value="rejected">Rejected</Option>
        </Select>

        <Input
          placeholder="Filter City"
          value={cityFilter}
          onChange={(e) => setCityFilter(e.target.value)}
          style={{ width: 140 }}
          allowClear
        />

        <Input
          placeholder="Filter District"
          value={districtFilter}
          onChange={(e) => setDistrictFilter(e.target.value)}
          style={{ width: 140 }}
          allowClear
        />

        <RangePicker
          value={dateRange}
          onChange={setDateRange}
          style={{ width: 240 }}
        />
      </div>

      <AppTable
        columns={columns}
        dataSource={companies}
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

      {/* Password Credentials Modal */}
      <AppModal
        title="Temporary Login Credentials Generated"
        open={credModalOpen}
        onOk={() => setCredModalOpen(false)}
        onCancel={() => setCredModalOpen(false)}
        okText="I Have Saved Credentials"
        cancelButtonProps={{ style: { display: 'none' } }}
      >
        <div style={{ padding: '12px 0' }}>
          <div style={{ background: '#fffbe5', padding: 16, borderRadius: 8, border: '1px solid #ffe58f', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#d48806', fontWeight: 600, marginBottom: 8 }}>
              <ShieldAlert size={18} />
              <span>Important Notice</span>
            </div>
            <p style={{ margin: 0, fontSize: 13, color: '#595959' }}>
              These credentials will be shown <strong>ONCE ONLY</strong>. Please copy and securely transmit them to the company administrator.
            </p>
          </div>

          <div style={{ background: '#f8fafc', padding: 16, borderRadius: 8, border: '1px solid #e2e8f0' }}>
            <div style={{ marginBottom: 12 }}>
              <span style={{ fontSize: 12, color: '#64748b', display: 'block' }}>Login Email:</span>
              <strong style={{ fontSize: 15 }}>{generatedCreds?.email}</strong>
            </div>
            <div>
              <span style={{ fontSize: 12, color: '#64748b', display: 'block' }}>Temporary Password:</span>
              <strong style={{ fontSize: 18, color: '#2563eb', fontFamily: 'monospace' }}>{generatedCreds?.temporaryPassword}</strong>
            </div>
          </div>
        </div>
      </AppModal>
    </div>
  );
};

export default CompaniesPage;
