const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const token = localStorage.getItem('resqflow_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, { ...options, headers });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Request failed with status ${response.status}`);
      }
      return await response.json();
    } catch (err) {
      console.error(`API Error on ${endpoint}:`, err);
      throw err;
    }
  }

  // Auth
  async login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  // Dashboard
  async getDashboard() {
    return this.request('/dashboard');
  }

  // Scenarios
  async getScenarios() {
    return this.request('/scenarios');
  }

  async getActiveScenario() {
    return this.request('/scenarios/active');
  }

  async analyzeDisaster(scenarioId) {
    return this.request('/scenarios/analyze', {
      method: 'POST',
      body: JSON.stringify({ scenario_id: scenarioId }),
    });
  }

  // Impact Analysis
  async getImpactSummary() {
    return this.request('/impact/summary');
  }

  async getAffectedAreas() {
    return this.request('/impact/areas');
  }

  async getFacilities() {
    return this.request('/impact/facilities');
  }

  async getRoads() {
    return this.request('/impact/roads');
  }

  // Resources CRUD
  async getResources(category, status) {
    let q = '';
    const params = [];
    if (category) params.push(`category=${encodeURIComponent(category)}`);
    if (status) params.push(`status=${encodeURIComponent(status)}`);
    if (params.length > 0) q = `?${params.join('&')}`;
    return this.request(`/resources${q}`);
  }

  async createResource(data) {
    return this.request('/resources', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateResource(id, data) {
    return this.request(`/resources/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteResource(id) {
    return this.request(`/resources/${id}`, {
      method: 'DELETE',
    });
  }

  // Resource Requirements
  async getRequirements() {
    return this.request('/requirements');
  }

  // Priority Analysis
  async getPriorityAnalysis() {
    return this.request('/priority');
  }

  // Relief Allocations
  async getAllocations() {
    return this.request('/allocations');
  }

  async dispatchAllocation(data) {
    return this.request('/allocations/dispatch', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ML Trained Model Inference APIs
  async getMlScenarios() {
    return this.request('/ml/scenarios');
  }

  async getLatestMlAnalysis() {
    return this.request('/ml/latest');
  }

  async analyseDisasterMl(payload) {
    return this.request('/ml/analyse', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }
}

export const api = new ApiService();
