import axios from 'axios'
import request from '../utils/request';
// 设置基础URL - 使用环境变量或默认值
axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8082';
// 允许携带cookies
axios.defaults.withCredentials = true;

// 请求拦截：自动附加 Authorization: Bearer <token>
axios.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers = config.headers || {}
      config.headers['Authorization'] = `Bearer ${token}`
    }
  } catch {}
  return config
})

// 响应拦截：捕获未授权并跳转登录
axios.interceptors.response.use(
  (resp) => {
    const data = resp?.data
    if (data && typeof data === 'object' && data.code === 401) {
      try { localStorage.removeItem('auth_token') } catch {}
      // 简单跳转到登录页
      if (location.pathname !== '/login') location.href = '/login'
    }
    return resp
  },
  (error) => {
    const status = error?.response?.status
    if (status === 401) {
      try { localStorage.removeItem('auth_token') } catch {}
      if (location.pathname !== '/login') location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default axios

// 银行用户相关接口
export const bankUserApi = {
  getRandom10BankUsers: () => {
    return request.get('/api/bank/user/random10');
  },
  searchFarmers: (params: Record<string, any>) => request({
    url: '/api/bank/searchFarmers',  // 与后端 @GetMapping 路径一致
    method: 'get',
    params: params  // params 会自动拼接为 URL 参数（?keyword=xxx）
  }),
};

// 融资相关接口
export const financeApi = {
  // 根据用户名获取银行ID（三表联查）
  getBankIdByUserName: (userName: string) => {
    return request.get('/api/bank/get-id-by-user', {
      params: { userName }
    });
  },
  // 提交融资申请（写入tb_finance）
  submitFinance: (financeData: Record<string, any>) => {
    return request.post('/api/finance/submit', financeData);
  }
};
