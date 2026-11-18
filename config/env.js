/**
 * 环境配置文件
 * 域名 mysportsbook.cn 备案与认证完成后，只需将 currentEnv 改为 'prod' 即可一键切换
 */

const TENCENT_MAP_KEY = 'TY7BZ-AORHV-CWZP2-55DAI-SUSRF-BJF4I';

const envConfig = {
  // 当前环境: 'dev' | 'prod'
  currentEnv: 'dev',

  // 开发环境（备案过渡期使用服务器 IP + 端口）
  dev: {
    baseUrl: 'http://你的服务器IP:8000/api',
    // 示例: baseUrl: 'http://192.168.1.100:8000/api'
    tencentMapKey: TENCENT_MAP_KEY,
    timeout: 10000
  },

  // 生产环境（备案与 SSL 证书就绪后使用二级域名）
  prod: {
    baseUrl: 'https://billiards.mysportsbook.cn/api',
    tencentMapKey: TENCENT_MAP_KEY,
    timeout: 10000
  }
};

const currentConfig = envConfig[envConfig.currentEnv];

module.exports = {
  baseUrl: currentConfig.baseUrl,
  tencentMapKey: currentConfig.tencentMapKey,
  timeout: currentConfig.timeout,
  env: envConfig.currentEnv
};