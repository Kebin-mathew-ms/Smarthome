const volunteerRepository = require('../repositories/volunteer.repository');
const auditLogService = require('./auditLog.service');
const Volunteer = require('../models/volunteer.model');

class VolunteerService {
  async getVolunteers(query) {
    const result = await volunteerRepository.findAll(query);
    return {
      ...result,
      items: result.items.map(Volunteer.toResponse)
    };
  }

  async getVolunteerById(volunteerId) {
    const vol = await volunteerRepository.findById(volunteerId);
    if (!vol) {
      const error = new Error('Volunteer not found.');
      error.statusCode = 404;
      throw error;
    }
    return Volunteer.toResponse(vol);
  }

  async createVolunteer(userId, ipAddress, data, photoFile = null) {
    const existing = await volunteerRepository.findByEmail(data.email);
    if (existing) {
      const error = new Error('A volunteer with this email already exists.');
      error.statusCode = 409;
      throw error;
    }

    const photoPath = photoFile ? photoFile.path : null;

    const volunteerId = await volunteerRepository.create({
      volunteer_name: data.volunteer_name,
      email: data.email,
      phone: data.phone,
      designation: data.designation,
      profile_photo: photoPath,
      address: data.address || null,
      status: data.status || 'active'
    });

    if (data.skills) {
      const skillsArray = typeof data.skills === 'string' ? JSON.parse(data.skills) : data.skills;
      if (Array.isArray(skillsArray) && skillsArray.length) {
        await volunteerRepository.setSkills(volunteerId, skillsArray);
      }
    }

    await auditLogService.log({
      user_id: userId,
      action: 'Volunteer Added',
      table_name: 'volunteers',
      record_id: volunteerId,
      ip_address: ipAddress
    });

    return await volunteerRepository.findById(volunteerId);
  }

  async updateVolunteer(volunteerId, userId, ipAddress, data, photoFile = null) {
    const vol = await volunteerRepository.findById(volunteerId);
    if (!vol) {
      const error = new Error('Volunteer not found.');
      error.statusCode = 404;
      throw error;
    }

    const photoPath = photoFile ? photoFile.path : undefined;

    const updated = await volunteerRepository.update(volunteerId, {
      volunteer_name: data.volunteer_name,
      email: data.email,
      phone: data.phone,
      designation: data.designation,
      profile_photo: photoPath,
      address: data.address,
      status: data.status
    });

    if (data.skills !== undefined) {
      const skillsArray = typeof data.skills === 'string' ? JSON.parse(data.skills) : data.skills;
      await volunteerRepository.setSkills(volunteerId, Array.isArray(skillsArray) ? skillsArray : []);
    }

    await auditLogService.log({
      user_id: userId,
      action: 'Volunteer Updated',
      table_name: 'volunteers',
      record_id: volunteerId,
      ip_address: ipAddress
    });

    return await volunteerRepository.findById(volunteerId);
  }

  async updateVolunteerStatus(volunteerId, status) {
    const vol = await volunteerRepository.findById(volunteerId);
    if (!vol) {
      const error = new Error('Volunteer not found.');
      error.statusCode = 404;
      throw error;
    }
    return await volunteerRepository.updateStatus(volunteerId, status);
  }

  async deleteVolunteer(volunteerId, userId, ipAddress) {
    const vol = await volunteerRepository.findById(volunteerId);
    if (!vol) {
      const error = new Error('Volunteer not found.');
      error.statusCode = 404;
      throw error;
    }

    const deleted = await volunteerRepository.softDelete(volunteerId);

    await auditLogService.log({
      user_id: userId,
      action: 'Volunteer Deleted',
      table_name: 'volunteers',
      record_id: volunteerId,
      ip_address: ipAddress
    });

    return deleted;
  }
}

module.exports = new VolunteerService();
