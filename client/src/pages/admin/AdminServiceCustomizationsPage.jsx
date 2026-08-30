import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Tabs, Row, Col, Space, Button, Table, Modal, Form, Input, InputNumber, Select, Switch, Tag, Popconfirm, message } from 'antd';
import { ArrowLeft, Plus, Edit2, Trash2, Settings, HelpCircle, Layers } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import AppBreadcrumb from '../../components/common/AppBreadcrumb';
import { adminService } from '../../services/admin.service';
import { ROUTES } from '../../constants/routes';

const { TabPane } = Tabs;
const { Option } = Select;

const AdminServiceCustomizationsPage = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();

  const [service, setService] = useState(null);
  const [packages, setPackages] = useState([]);
  const [customizations, setCustomizations] = useState([]);
  const [loading, setLoading] = useState(false);

  // Group Modal
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [groupForm] = Form.useForm();

  // Option Modal
  const [isOptionModalOpen, setIsOptionModalOpen] = useState(false);
  const [editingOption, setEditingOption] = useState(null);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [optionForm] = Form.useForm();

  // Package Configs Tab
  const [selectedPackageId, setSelectedPackageId] = useState(null);
  const [packageOverrides, setPackageOverrides] = useState([]);
  const [overridesLoading, setOverridesLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Service Details
      const svcRes = await adminService.getServiceById(serviceId);
      if (svcRes.success) setService(svcRes.data);

      // 2. Fetch Packages for this service
      const pkgRes = await adminService.getPackagesByServiceId(serviceId);
      if (pkgRes.success) {
        setPackages(pkgRes.data);
        if (pkgRes.data.length > 0) setSelectedPackageId(pkgRes.data[0].id);
      }

      // 3. Fetch Customizations
      await fetchCustomizations();
    } catch (err) {
      message.error(err.message || 'Failed to fetch customization data');
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomizations = async () => {
    const custRes = await adminService.getServiceCustomizations(serviceId);
    if (custRes.success) {
      setCustomizations(custRes.data);
    }
  };

  const fetchOverrides = async () => {
    if (!selectedPackageId) return;
    setOverridesLoading(true);
    try {
      const res = await adminService.getPackageOverrides(selectedPackageId);
      if (res.success) {
        setPackageOverrides(res.data);
      }
    } catch (err) {
      message.error(err.message || 'Failed to fetch package overrides');
    } finally {
      setOverridesLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [serviceId]);

  useEffect(() => {
    if (selectedPackageId) {
      fetchOverrides();
    }
  }, [selectedPackageId]);

  // Group Operations
  const handleOpenAddGroup = () => {
    setEditingGroup(null);
    groupForm.resetFields();
    setIsGroupModalOpen(true);
  };

  const handleOpenEditGroup = (group) => {
    setEditingGroup(group);
    groupForm.setFieldsValue({
      group_name: group.group_name,
      group_description: group.group_description,
      selection_type: group.selection_type,
      display_order: group.display_order,
      is_active: Boolean(group.is_active)
    });
    setIsGroupModalOpen(true);
  };

  const handleGroupSubmit = async (values) => {
    try {
      if (editingGroup) {
        await adminService.updateCustomizationGroup(editingGroup.id, values);
        message.success('Group updated successfully');
      } else {
        await adminService.createCustomizationGroup(serviceId, values);
        message.success('Group created successfully');
      }
      setIsGroupModalOpen(false);
      fetchCustomizations();
    } catch (err) {
      message.error(err.message || 'Failed to save customization group');
    }
  };

  const handleDeleteGroup = async (groupId) => {
    try {
      await adminService.deleteCustomizationGroup(groupId);
      message.success('Group deleted successfully');
      fetchCustomizations();
    } catch (err) {
      message.error(err.message || 'Failed to delete customization group');
    }
  };

  // Option Operations
  const handleOpenAddOption = (groupId) => {
    setEditingOption(null);
    setSelectedGroupId(groupId);
    optionForm.resetFields();
    setIsOptionModalOpen(true);
  };

  const handleOpenEditOption = (option, groupId) => {
    setEditingOption(option);
    setSelectedGroupId(groupId);
    optionForm.setFieldsValue({
      option_name: option.option_name,
      description: option.description,
      price: option.price,
      min_quantity: option.min_quantity || 0,
      max_quantity: option.max_quantity || null,
      display_order: option.display_order,
      is_active: Boolean(option.is_active)
    });
    setIsOptionModalOpen(true);
  };

  const handleOptionSubmit = async (values) => {
    try {
      if (editingOption) {
        await adminService.updateCustomizationOption(editingOption.id, values);
        message.success('Option updated successfully');
      } else {
        await adminService.createCustomizationOption({
          group_id: selectedGroupId,
          ...values
        });
        message.success('Option created successfully');
      }
      setIsOptionModalOpen(false);
      fetchCustomizations();
    } catch (err) {
      message.error(err.message || 'Failed to save option');
    }
  };

  const handleDeleteOption = async (optionId) => {
    try {
      await adminService.deleteCustomizationOption(optionId);
      message.success('Option deleted successfully');
      fetchCustomizations();
    } catch (err) {
      message.error(err.message || 'Failed to delete option');
    }
  };

  // Package Configuration Operations
  const handleSaveOverride = async (optionId, isIncluded, addPrice, isActive) => {
    if (!selectedPackageId) return;
    try {
      await adminService.savePackageConfig({
        package_id: selectedPackageId,
        option_id: optionId,
        is_included: isIncluded,
        additional_price: isIncluded ? 0.00 : (addPrice || 0.00),
        is_active: isActive
      });
      message.success('Override configuration saved');
      fetchOverrides();
    } catch (err) {
      message.error(err.message || 'Failed to save configuration');
    }
  };

  const handleDeleteOverride = async (optionId) => {
    if (!selectedPackageId) return;
    try {
      await adminService.deletePackageConfig(selectedPackageId, optionId);
      message.success('Override reset to defaults');
      fetchOverrides();
    } catch (err) {
      message.error(err.message || 'Failed to reset configuration');
    }
  };

  const breadcrumbItems = [
    { title: 'Services Catalog', path: ROUTES.ADMIN_SERVICES },
    { title: service?.service_name || 'Service Details', path: null },
    { title: 'Customizations', path: null }
  ];

  return (
    <div>
      <AppBreadcrumb items={breadcrumbItems} />
      <PageHeader
        title={`Customizations: ${service?.service_name || 'Loading...'}`}
        subtitle="Manage category-specific customization groups, options, pricing, and package overrides."
        extra={
          <Button icon={<ArrowLeft size={16} />} onClick={() => navigate(ROUTES.ADMIN_SERVICES)}>
            Back to Catalog
          </Button>
        }
      />

      <Card bordered={false} style={{ borderRadius: 16 }}>
        <Tabs defaultActiveKey="1">
          {/* Tab 1: Groups & Options */}
          <TabPane tab="Customization Groups & Options" key="1">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <span style={{ fontSize: 16, fontWeight: 600 }}>Customization Structure</span>
              <Button type="primary" icon={<Plus size={16} />} onClick={handleOpenAddGroup}>
                Add Group
              </Button>
            </div>

            {customizations.length === 0 ? (
              <Card style={{ textAlign: 'center', padding: '40px 0', border: '1px dashed #cbd5e1' }}>
                <HelpCircle size={48} style={{ color: '#94a3b8', margin: '0 auto 12px' }} />
                <p>No customization groups defined for this service yet.</p>
                <Button type="primary" onClick={handleOpenAddGroup}>Create First Group</Button>
              </Card>
            ) : (
              customizations.map(group => {
                const optionColumns = [
                  { title: 'Option Name', dataIndex: 'option_name', key: 'option_name', render: (text, r) => <strong>{text}</strong> },
                  { title: 'Description', dataIndex: 'description', key: 'description' },
                  { title: 'Default Extra Price', dataIndex: 'price', key: 'price', render: p => `$${Number(p).toFixed(2)}` },
                  {
                    title: 'Limits (Min / Max)',
                    key: 'limits',
                    render: (_, r) => group.selection_type === 'quantity' ? `${r.min_quantity || 0} / ${r.max_quantity || 'No limit'}` : 'N/A'
                  },
                  { title: 'Status', dataIndex: 'is_active', key: 'is_active', render: active => active ? <Tag color="green">Active</Tag> : <Tag color="red">Inactive</Tag> },
                  {
                    title: 'Actions',
                    key: 'actions',
                    render: (_, opt) => (
                      <Space>
                        <Button type="text" size="small" icon={<Edit2 size={12} />} onClick={() => handleOpenEditOption(opt, group.id)}>
                          Edit
                        </Button>
                        <Popconfirm title="Delete option?" onConfirm={() => handleDeleteOption(opt.id)}>
                          <Button type="text" danger size="small" icon={<Trash2 size={12} />}>
                            Delete
                          </Button>
                        </Popconfirm>
                      </Space>
                    )
                  }
                ];

                return (
                  <Card
                    key={group.id}
                    title={
                      <Space>
                        <Layers size={18} style={{ color: '#2563eb' }} />
                        <span><strong>{group.group_name}</strong></span>
                        <Tag color="purple">{group.selection_type.toUpperCase()}</Tag>
                        {group.group_description && <span style={{ fontSize: 12, fontWeight: 400, color: '#64748b' }}>— {group.group_description}</span>}
                      </Space>
                    }
                    extra={
                      <Space>
                        <Button size="small" icon={<Plus size={12} />} onClick={() => handleOpenAddOption(group.id)}>Add Option</Button>
                        <Button size="small" icon={<Edit2 size={12} />} onClick={() => handleOpenEditGroup(group)}>Edit Group</Button>
                        <Popconfirm title="Delete this group and all its options?" onConfirm={() => handleDeleteGroup(group.id)}>
                          <Button size="small" danger icon={<Trash2 size={12} />}>Delete</Button>
                        </Popconfirm>
                      </Space>
                    }
                    style={{ marginBottom: 24, borderRadius: 12 }}
                  >
                    <Table
                      dataSource={group.options}
                      columns={optionColumns}
                      rowKey="id"
                      pagination={false}
                      size="small"
                    />
                  </Card>
                );
              })
            )}
          </TabPane>

          {/* Tab 2: Package Overrides */}
          <TabPane tab="Package Customization Overrides" key="2" disabled={packages.length === 0}>
            <div style={{ marginBottom: 24 }}>
              <label style={{ marginRight: 12, fontWeight: 600 }}>Select Package Tier:</label>
              <Select
                value={selectedPackageId}
                onChange={setSelectedPackageId}
                style={{ width: 250 }}
              >
                {packages.map(p => <Option key={p.id} value={p.id}>{p.package_name} (${Number(p.price).toFixed(2)})</Option>)}
              </Select>
            </div>

            {selectedPackageId && (
              <Table
                loading={overridesLoading}
                dataSource={customizations.flatMap(g => g.options.map(o => ({ ...o, group_name: g.group_name })))}
                rowKey="id"
                pagination={false}
                columns={[
                  { title: 'Group', dataIndex: 'group_name', key: 'group_name', render: text => <Tag color="blue">{text}</Tag> },
                  { title: 'Option Name', dataIndex: 'option_name', key: 'option_name', render: text => <strong>{text}</strong> },
                  { title: 'Global Price', dataIndex: 'price', key: 'price', render: p => `$${Number(p).toFixed(2)}` },
                  {
                    title: 'Included in Package?',
                    key: 'included',
                    render: (_, opt) => {
                      const ovr = packageOverrides.find(x => x.option_id === opt.id);
                      const isIncluded = ovr ? Boolean(ovr.is_included) : false;
                      return (
                        <Switch
                          checked={isIncluded}
                          onChange={(checked) => {
                            const addPrice = ovr ? Number(ovr.additional_price) : Number(opt.price);
                            const act = ovr ? Boolean(ovr.is_active) : true;
                            handleSaveOverride(opt.id, checked, addPrice, act);
                          }}
                        />
                      );
                    }
                  },
                  {
                    title: 'Override Add-On Price ($)',
                    key: 'price_override',
                    render: (_, opt) => {
                      const ovr = packageOverrides.find(x => x.option_id === opt.id);
                      const isIncluded = ovr ? Boolean(ovr.is_included) : false;
                      const displayVal = ovr ? Number(ovr.additional_price) : Number(opt.price);
                      return (
                        <InputNumber
                          min={0}
                          step={1}
                          disabled={isIncluded}
                          value={isIncluded ? 0 : displayVal}
                          onChange={(val) => {
                            const act = ovr ? Boolean(ovr.is_active) : true;
                            handleSaveOverride(opt.id, isIncluded, val, act);
                          }}
                          style={{ width: 120 }}
                        />
                      );
                    }
                  },
                  {
                    title: 'Active in Package?',
                    key: 'active_override',
                    render: (_, opt) => {
                      const ovr = packageOverrides.find(x => x.option_id === opt.id);
                      const act = ovr ? Boolean(ovr.is_active) : true;
                      return (
                        <Switch
                          checked={act}
                          onChange={(checked) => {
                            const isInc = ovr ? Boolean(ovr.is_included) : false;
                            const addPrice = ovr ? Number(ovr.additional_price) : Number(opt.price);
                            handleSaveOverride(opt.id, isInc, addPrice, checked);
                          }}
                        />
                      );
                    }
                  },
                  {
                    title: 'Reset',
                    key: 'reset',
                    render: (_, opt) => {
                      const ovr = packageOverrides.find(x => x.option_id === opt.id);
                      return (
                        <Button
                          type="text"
                          danger
                          disabled={!ovr}
                          onClick={() => handleDeleteOverride(opt.id)}
                        >
                          Reset Defaults
                        </Button>
                      );
                    }
                  }
                ]}
              />
            )}
          </TabPane>
        </Tabs>
      </Card>

      {/* Add/Edit Group Modal */}
      <Modal
        title={editingGroup ? 'Edit Customization Group' : 'Add Customization Group'}
        open={isGroupModalOpen}
        onCancel={() => setIsGroupModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={groupForm} layout="vertical" onFinish={handleGroupSubmit} style={{ marginTop: 16 }}>
          <Form.Item name="group_name" label="Group Name" rules={[{ required: true, message: 'Please enter group name' }]}>
            <Input placeholder="e.g. Paint Type or AC Add-ons" />
          </Form.Item>
          <Form.Item name="group_description" label="Description">
            <Input placeholder="e.g. Select paint type and details" />
          </Form.Item>
          <Form.Item name="selection_type" label="Selection Type" initialValue="single" rules={[{ required: true }]}>
            <Select>
              <Option value="single">Single Select (Radio/Dropdown)</Option>
              <Option value="multi">Multi-Select (Checkboxes)</Option>
              <Option value="toggle">Toggle (Switches)</Option>
              <Option value="quantity">Quantity (Number Selector)</Option>
            </Select>
          </Form.Item>
          <Form.Item name="display_order" label="Display Order" initialValue={0}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="is_active" label="Status" valuePropName="checked" initialValue={true}>
            <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
          </Form.Item>
          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={() => setIsGroupModalOpen(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit">Submit</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Add/Edit Option Modal */}
      <Modal
        title={editingOption ? 'Edit Customization Option' : 'Add Customization Option'}
        open={isOptionModalOpen}
        onCancel={() => setIsOptionModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={optionForm} layout="vertical" onFinish={handleOptionSubmit} style={{ marginTop: 16 }}>
          <Form.Item name="option_name" label="Option Name" rules={[{ required: true, message: 'Please enter option name' }]}>
            <Input placeholder="e.g. Premium Paint or Sofa Cleaning" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input placeholder="Brief details about what is included" />
          </Form.Item>
          <Form.Item name="price" label="Default Additional Price ($)" initialValue={0.00} rules={[{ required: true }]}>
            <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="min_quantity" label="Min Quantity" initialValue={0}>
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="max_quantity" label="Max Quantity">
                <InputNumber min={0} placeholder="No Limit" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="display_order" label="Display Order" initialValue={0}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="is_active" label="Status" valuePropName="checked" initialValue={true}>
            <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
          </Form.Item>
          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={() => setIsOptionModalOpen(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit">Submit</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminServiceCustomizationsPage;
