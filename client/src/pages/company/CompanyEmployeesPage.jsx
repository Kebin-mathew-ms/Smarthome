import React, { useState, useEffect } from 'react';
import { Input, Space, message, Select, Tag, Upload, Drawer, InputNumber, Button } from 'antd';
import { Plus, Search, User, Edit2, Trash2, ShieldCheck, Phone, Mail, Upload as UploadIcon } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import PageHeader from '../../components/common/PageHeader';
import AppTable from '../../components/common/AppTable';
import AppButton from '../../components/common/AppButton';
import StatusBadge from '../../components/common/StatusBadge';
import FormField from '../../components/common/FormField';
import { showConfirmModal } from '../../components/common/ConfirmModal';
import { companyPortalService } from '../../services/companyPortal.service';
import { adminService } from '../../services/admin.service';
import { formatDate } from '../../utils/formatters';

const { Option } = Select;

const CompanyEmployeesPage = () => {
  const [employees, setEmployees] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(undefined);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);

  // Employee Skills State
  const [assignedSkills, setAssignedSkills] = useState([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState(undefined);
  const [expYears, setExpYears] = useState(2);

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      employee_name: '',
      email: '',
      phone: '',
      designation: '',
      address: '',
      status: 'active'
    }
  });

  const fetchSubcategories = async () => {
    try {
      const res = await adminService.getSubcategories({ page: 1, limit: 200 });
      if (res.success) setSubcategories(res.data.items);
    } catch {
      // ignore
    }
  };

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await companyPortalService.getEmployees({
        page,
        limit: pageSize,
        search,
        status: statusFilter
      });
      if (res.success) {
        setEmployees(res.data.items);
        setTotal(res.data.total);
      }
    } catch (err) {
      message.error(err.message || 'Failed to fetch employees list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubcategories();
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [page, pageSize, search, statusFilter]);

  const handleOpenDrawer = (emp = null) => {
    setEditingEmployee(emp);
    if (emp) {
      reset({
        employee_name: emp.employee_name,
        email: emp.email,
        phone: emp.phone,
        designation: emp.designation,
        address: emp.address || '',
        status: emp.status
      });
      if (emp.skills && emp.skills.length) {
        setAssignedSkills(emp.skills.map(s => ({ subcategory_id: s.subcategory_id, subcategory_name: s.subcategory_name, experience_years: s.experience_years })));
      } else {
        setAssignedSkills([]);
      }
    } else {
      reset({
        employee_name: '',
        email: '',
        phone: '',
        designation: '',
        address: '',
        status: 'active'
      });
      setAssignedSkills([]);
    }
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setEditingEmployee(null);
    reset();
    setPhotoFile(null);
    setAssignedSkills([]);
  };

  const handleAddSkill = () => {
    if (!selectedSubcategory) return;
    const subObj = subcategories.find(s => s.id === selectedSubcategory);
    if (!subObj) return;

    if (assignedSkills.some(s => s.subcategory_id === selectedSubcategory)) {
      message.warning('Skill already added to employee profile');
      return;
    }

    setAssignedSkills(prev => [...prev, { subcategory_id: selectedSubcategory, subcategory_name: subObj.subcategory_name, experience_years: expYears }]);
    setSelectedSubcategory(undefined);
  };

  const handleRemoveSkill = (subId) => {
    setAssignedSkills(prev => prev.filter(s => s.subcategory_id !== subId));
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const formData = new FormData();
      Object.keys(data).forEach(key => {
        if (data[key] !== undefined && data[key] !== null) {
          formData.append(key, data[key]);
        }
      });

      formData.append('skills', JSON.stringify(assignedSkills));
      if (photoFile) formData.append('profile_photo', photoFile);

      if (editingEmployee) {
        await companyPortalService.updateEmployee(editingEmployee.id, formData);
        message.success('Employee record updated successfully');
      } else {
        await companyPortalService.createEmployee(formData);
        message.success('Employee added successfully');
      }
      handleCloseDrawer();
      fetchEmployees();
    } catch (err) {
      message.error(err.message || 'Action failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    showConfirmModal({
      title: 'Delete Employee',
      content: 'Are you sure you want to delete this employee? Soft delete will be performed.',
      onOk: async () => {
        try {
          await companyPortalService.deleteEmployee(id);
          message.success('Employee soft deleted');
          fetchEmployees();
        } catch (err) {
          message.error(err.message || 'Failed to delete employee');
        }
      }
    });
  };

  const columns = [
    {
      title: 'Employee Name',
      dataIndex: 'employee_name',
      key: 'employee_name',
      render: (text, r) => (
        <Space>
          <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>
            {text ? text.charAt(0).toUpperCase() : 'E'}
          </div>
          <div>
            <span style={{ fontWeight: 600, display: 'block' }}>{text}</span>
            <span style={{ fontSize: 12, color: '#64748b' }}>{r.designation}</span>
          </div>
        </Space>
      )
    },
    {
      title: 'Contact',
      key: 'contact',
      render: (_, r) => (
        <div>
          <span style={{ display: 'block', fontSize: 13 }}><Mail size={12} style={{ marginRight: 4 }} />{r.email}</span>
          <span style={{ fontSize: 12, color: '#64748b' }}><Phone size={12} style={{ marginRight: 4 }} />{r.phone}</span>
        </div>
      )
    },
    {
      title: 'Skills',
      key: 'skills',
      render: (_, r) => (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {r.skills && r.skills.length > 0 ? (
            r.skills.map((s, idx) => (
              <Tag key={idx} color="teal" style={{ fontSize: 11 }}>
                {s.subcategory_name} ({s.experience_years}y)
              </Tag>
            ))
          ) : (
            <span style={{ fontSize: 12, color: '#94a3b8' }}>No skills assigned</span>
          )}
        </div>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <StatusBadge status={status} />
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <AppButton icon={<Edit2 size={16} />} size="small" onClick={() => handleOpenDrawer(record)}>
            Edit
          </AppButton>
          <AppButton icon={<Trash2 size={16} />} danger size="small" onClick={() => handleDelete(record.id)}>
            Delete
          </AppButton>
        </Space>
      )
    }
  ];

  return (
    <div>
      <PageHeader
        title="Employee & Technician Management"
        subtitle="Manage company staff members, technicians, contact info and skill qualifications."
        extra={
          <AppButton type="primary" icon={<Plus size={16} />} onClick={() => handleOpenDrawer()}>
            Add Employee
          </AppButton>
        }
      />

      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <Input
          prefix={<Search size={16} style={{ color: '#94a3b8', marginRight: 8 }} />}
          placeholder="Search by name, email, phone or designation..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: 300 }}
          allowClear
        />

        <Select
          placeholder="Filter Status"
          value={statusFilter}
          onChange={setStatusFilter}
          style={{ width: 140 }}
          allowClear
        >
          <Option value="active">Active</Option>
          <Option value="inactive">Inactive</Option>
        </Select>
      </div>

      <AppTable
        columns={columns}
        dataSource={employees}
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

      <Drawer
        title={editingEmployee ? 'Edit Employee Profile' : 'Add New Employee'}
        width={480}
        onClose={handleCloseDrawer}
        open={isDrawerOpen}
        bodyStyle={{ paddingBottom: 80 }}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <Controller
            name="employee_name"
            control={control}
            rules={{ required: 'Employee name is required' }}
            render={({ field }) => (
              <FormField label="Full Name" error={errors.employee_name} required>
                <Input {...field} placeholder="John Doe" size="large" />
              </FormField>
            )}
          />

          <Controller
            name="email"
            control={control}
            rules={{ required: 'Email is required', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' } }}
            render={({ field }) => (
              <FormField label="Email Address" error={errors.email} required>
                <Input {...field} placeholder="john.doe@company.com" size="large" />
              </FormField>
            )}
          />

          <Controller
            name="phone"
            control={control}
            rules={{ required: 'Phone is required' }}
            render={({ field }) => (
              <FormField label="Phone Number" error={errors.phone} required>
                <Input {...field} placeholder="+1234567890" size="large" />
              </FormField>
            )}
          />

          <Controller
            name="designation"
            control={control}
            rules={{ required: 'Designation is required' }}
            render={({ field }) => (
              <FormField label="Designation / Job Role" error={errors.designation} required>
                <Input {...field} placeholder="Senior Electrician / Master Plumber" size="large" />
              </FormField>
            )}
          />

          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <FormField label="Status">
                <Select {...field} style={{ width: '100%' }}>
                  <Option value="active">Active</Option>
                  <Option value="inactive">Inactive</Option>
                </Select>
              </FormField>
            )}
          />

          <FormField label="Profile Photo">
            <Upload beforeUpload={file => { setPhotoFile(file); return false; }} maxCount={1} accept="image/*">
              <AppButton icon={<UploadIcon size={16} />}>Upload Photo</AppButton>
            </Upload>
          </FormField>

          <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #e2e8f0' }}>
            <span style={{ fontWeight: 600, fontSize: 14, display: 'block', marginBottom: 12 }}>Assign Technical Skills</span>
            <Space style={{ marginBottom: 12 }}>
              <Select
                placeholder="Select Skill"
                value={selectedSubcategory}
                onChange={setSelectedSubcategory}
                style={{ width: 200 }}
              >
                {subcategories.map(s => (
                  <Option key={s.id} value={s.id}>{s.subcategory_name}</Option>
                ))}
              </Select>
              <InputNumber
                min={1}
                max={40}
                value={expYears}
                onChange={setExpYears}
                addonAfter="yrs"
                style={{ width: 100 }}
              />
              <Button type="primary" onClick={handleAddSkill}>Add</Button>
            </Space>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {assignedSkills.map(s => (
                <Tag key={s.subcategory_id} closable onClose={() => handleRemoveSkill(s.subcategory_id)} color="teal">
                  {s.subcategory_name} ({s.experience_years} yrs)
                </Tag>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 24 }}>
            <AppButton type="primary" htmlType="submit" block size="large" loading={submitting}>
              {editingEmployee ? 'Save Employee Changes' : 'Create Employee Profile'}
            </AppButton>
          </div>
        </form>
      </Drawer>
    </div>
  );
};

export default CompanyEmployeesPage;
