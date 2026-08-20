module.exports = {
  apps: [
    {
      name: 'topcenter-app',
      script: './backend/server.js',
      cwd: __dirname,
      env: {
        NODE_ENV: 'production',
        PORT: 4000,
      },
      watch: false,
      max_memory_restart: '500M',
      max_restarts: 10,
      restart_delay: 5000,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: './backend/logs/backend-error.log',
      out_file: './backend/logs/backend-out.log',
      merge_logs: true,
    },
  ],
};
