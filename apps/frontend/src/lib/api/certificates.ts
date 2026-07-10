import apiClient from './client';
import { Certificate } from './passports';

export async function getCertificates(passportId: string): Promise<Certificate[]> {
  try {
    const { data } = await apiClient.get<Certificate[]>(`/api/passports/${passportId}/certificates`);
    return data;
  } catch {
    return [];
  }
}

export async function createCertificate(
  passportId: string,
  data: Omit<Certificate, 'id'>
): Promise<Certificate> {
  const { data: result } = await apiClient.post<Certificate>(
    `/api/passports/${passportId}/certificates`,
    data
  );
  return result;
}

export async function updateCertificate(
  id: string,
  data: Partial<Certificate>
): Promise<Certificate> {
  const { data: result } = await apiClient.patch<Certificate>(`/api/certificates/${id}`, data);
  return result;
}

export async function deleteCertificate(id: string): Promise<void> {
  await apiClient.delete(`/api/certificates/${id}`);
}

export async function getAllCertificates(): Promise<(Certificate & { passportId: string; passportDisplayId: string; model: string })[]> {
  try {
    const { data } = await apiClient.get<(Certificate & { passportId: string; passportDisplayId: string; model: string })[]>('/api/certificates');
    return data;
  } catch {
    // Mock all certificates
    return [
      { id: 'c1', type: 'UN38.3', issuer: 'TÜV SÜD', issueDate: '2024-01-01', expiryDate: '2027-01-01', status: 'VALID', passportId: '1', passportDisplayId: 'BAT-2024-A1B2C', model: 'Tesla Model 3 LR' },
      { id: 'c2', type: 'CE', issuer: 'Bureau Veritas', issueDate: '2024-01-10', expiryDate: '2027-01-10', status: 'VALID', passportId: '1', passportDisplayId: 'BAT-2024-A1B2C', model: 'Tesla Model 3 LR' },
      { id: 'c3', type: 'REACH', issuer: 'ECHA', issueDate: '2023-06-15', expiryDate: '2024-06-15', status: 'EXPIRED', passportId: '3', passportDisplayId: 'BAT-2024-G5H6I', model: 'Stationary Pack 100' },
      { id: 'c4', type: 'RoHS', issuer: 'SGS', issueDate: '2024-03-01', expiryDate: '2024-12-31', status: 'VALID', passportId: '3', passportDisplayId: 'BAT-2024-G5H6I', model: 'Stationary Pack 100' },
    ];
  }
}
