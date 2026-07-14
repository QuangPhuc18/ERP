import axios from 'axios';

export interface StoreSettingDTO {
  id?: number;
  storeName: string;
  slogan: string;
  address: string;
  phone: string;
  email: string;
  facebookUrl: string;
  logoUrl: string;
}

const API_URL = 'http://localhost:5121/api/StoreSettings';

class SettingsService {
  async getStoreSetting(): Promise<StoreSettingDTO> {
    const response = await axios.get(API_URL);
    return response.data;
  }

  async updateStoreSetting(setting: StoreSettingDTO): Promise<StoreSettingDTO> {
    const response = await axios.put(API_URL, setting);
    return response.data;
  }

  async uploadLogo(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axios.post('http://localhost:5121/api/Upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data.url;
  }
}

export default new SettingsService();
