
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { QueueItem } from '@/types/queue';

export const exportToCSV = (data: QueueItem[], filename: string = 'queue-data') => {
  const csvData = data.map(item => ({
    'Sequence': item.sequence,
    'Full Name': item.full_name,
    'Service Number': item.svc_no,
    'Gender': item.gender,
    'Arm of Service': item.arm_of_service,
    'Category': item.category,
    'Rank': item.rank,
    'Marital Status': item.marital_status,
    'Adult Dependents': item.no_of_adult_dependents,
    'Child Dependents': item.no_of_child_dependents,
    'Current Unit': item.current_unit || 'N/A',
    'Phone': item.phone || 'N/A',
    'Date TOS': item.date_tos ? new Date(item.date_tos).toLocaleDateString() : 'N/A',
    'Date SOS': item.date_sos ? new Date(item.date_sos).toLocaleDateString() : 'N/A',
    'Entry Date': new Date(item.entry_date_time).toLocaleDateString(),
    'Appointment': item.appointment || 'N/A'
  }));

  const csv = Papa.unparse(csvData);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const exportToExcel = (data: QueueItem[], filename: string = 'queue-data') => {
  const excelData = data.map(item => ({
    'Sequence': item.sequence,
    'Full Name': item.full_name,
    'Service Number': item.svc_no,
    'Gender': item.gender,
    'Arm of Service': item.arm_of_service,
    'Category': item.category,
    'Rank': item.rank,
    'Marital Status': item.marital_status,
    'Adult Dependents': item.no_of_adult_dependents,
    'Child Dependents': item.no_of_child_dependents,
    'Current Unit': item.current_unit || 'N/A',
    'Phone': item.phone || 'N/A',
    'Date TOS': item.date_tos ? new Date(item.date_tos).toLocaleDateString() : 'N/A',
    'Date SOS': item.date_sos ? new Date(item.date_sos).toLocaleDateString() : 'N/A',
    'Entry Date': new Date(item.entry_date_time).toLocaleDateString(),
    'Appointment': item.appointment || 'N/A'
  }));

  const worksheet = XLSX.utils.json_to_sheet(excelData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Queue Data');
  
  XLSX.writeFile(workbook, `${filename}.xlsx`);
};
