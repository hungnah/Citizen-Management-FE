/**
 * API Configuration và Helper Functions
 * 
 * File này quản lý tất cả các kết nối API với backend.
 * API base URL được cấu hình thông qua biến môi trường NEXT_PUBLIC_API_URL.
 */

// Lấy API base URL từ environment variable
// Mặc định là http://localhost:3001 nếu không được cấu hình
const getApiBaseUrl = (): string => {
  if (typeof window === 'undefined') {
    // Server-side: sử dụng environment variable
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
  }
  // Client-side: sử dụng environment variable hoặc mặc định
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
}

/**
 * API Fetch Helper
 * 
 * Wrapper function cho fetch API với các tính năng:
 * - Tự động thêm base URL
 * - Xử lý credentials (cookies) cho authentication
 * - Set headers mặc định
 * - Hỗ trợ tất cả HTTP methods
 * 
 * @param endpoint - API endpoint (ví dụ: '/api/households')
 * @param options - Fetch options (method, body, headers, etc.)
 * @returns Promise<Response>
 * 
 * @example
 * // GET request
 * const response = await apiFetch('/api/households')
 * const data = await response.json()
 * 
 * @example
 * // POST request
 * const response = await apiFetch('/api/households', {
 *   method: 'POST',
 *   body: JSON.stringify({ householdId: 'HK001', address: '123 Main St' })
 * })
 */
export async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const baseUrl = getApiBaseUrl()
  
  // Đảm bảo endpoint bắt đầu bằng '/'
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  
  // Xây dựng full URL
  const url = `${baseUrl}${normalizedEndpoint}`
  
  // Merge headers mặc định với headers được truyền vào
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  }
  
  const headers = {
    ...defaultHeaders,
    ...options.headers,
  }
  
  // Merge options với defaults
  const fetchOptions: RequestInit = {
    ...options,
    headers,
    credentials: options.credentials || 'include', // Luôn include cookies cho authentication
  }
  
  try {
    const response = await fetch(url, fetchOptions)
    return response
  } catch (error) {
    console.error('API Fetch Error:', error)
    throw error
  }
}

/**
 * Helper function để parse JSON response
 * Tự động xử lý lỗi và trả về data hoặc throw error
 * 
 * @param response - Response object từ apiFetch
 * @returns Promise với parsed JSON data
 * 
 * @example
 * const data = await apiFetch('/api/households').then(parseJsonResponse)
 */
export async function parseJsonResponse<T = any>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ 
      message: `HTTP Error: ${response.status} ${response.statusText}` 
    }))
    throw new Error(errorData.message || `HTTP Error: ${response.status}`)
  }
  
  return response.json()
}

/**
 * Helper function để thực hiện GET request và parse JSON
 * 
 * @param endpoint - API endpoint
 * @returns Promise với parsed JSON data
 * 
 * @example
 * const households = await apiGet('/api/households')
 */
export async function apiGet<T = any>(endpoint: string): Promise<T> {
  const response = await apiFetch(endpoint, { method: 'GET' })
  return parseJsonResponse<T>(response)
}

/**
 * Helper function để thực hiện POST request và parse JSON
 * 
 * @param endpoint - API endpoint
 * @param body - Request body (sẽ được stringify nếu là object)
 * @returns Promise với parsed JSON data
 * 
 * @example
 * const newHousehold = await apiPost('/api/households', { householdId: 'HK001', address: '123 Main St' })
 */
export async function apiPost<T = any>(endpoint: string, body?: any): Promise<T> {
  const response = await apiFetch(endpoint, {
    method: 'POST',
    body: typeof body === 'string' ? body : JSON.stringify(body),
  })
  return parseJsonResponse<T>(response)
}

/**
 * Helper function để thực hiện PUT request và parse JSON
 * 
 * @param endpoint - API endpoint
 * @param body - Request body (sẽ được stringify nếu là object)
 * @returns Promise với parsed JSON data
 * 
 * @example
 * const updated = await apiPut('/api/households/1', { address: '456 New St' })
 */
export async function apiPut<T = any>(endpoint: string, body?: any): Promise<T> {
  const response = await apiFetch(endpoint, {
    method: 'PUT',
    body: typeof body === 'string' ? body : JSON.stringify(body),
  })
  return parseJsonResponse<T>(response)
}

/**
 * Helper function để thực hiện PATCH request và parse JSON
 * 
 * @param endpoint - API endpoint
 * @param body - Request body (sẽ được stringify nếu là object)
 * @returns Promise với parsed JSON data
 * 
 * @example
 * const updated = await apiPatch('/api/bookings/1/status', { status: 'APPROVED' })
 */
export async function apiPatch<T = any>(endpoint: string, body?: any): Promise<T> {
  const response = await apiFetch(endpoint, {
    method: 'PATCH',
    body: typeof body === 'string' ? body : JSON.stringify(body),
  })
  return parseJsonResponse<T>(response)
}

/**
 * Helper function để thực hiện DELETE request và parse JSON
 * 
 * @param endpoint - API endpoint
 * @returns Promise với parsed JSON data
 * 
 * @example
 * await apiDelete('/api/households/1')
 */
export async function apiDelete<T = any>(endpoint: string): Promise<T> {
  const response = await apiFetch(endpoint, { method: 'DELETE' })
  return parseJsonResponse<T>(response)
}

// Export API base URL để có thể sử dụng ở nơi khác nếu cần
export const API_BASE_URL = getApiBaseUrl()


