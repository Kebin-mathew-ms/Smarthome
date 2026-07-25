import dayjs from 'dayjs';

export const formatDate = (dateString, format = 'MMM DD, YYYY') => {
  if (!dateString) return 'N/A';
  return dayjs(dateString).format(format);
};

export const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  return dayjs(dateString).format('MMM DD, YYYY h:mm A');
};

export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};
