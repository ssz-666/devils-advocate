module.exports = {
  apps: [
    {
      name: "devils-advocate",
      cwd: __dirname,
      script: "npm",
      args: "start",
      env: {
        NODE_ENV: "production",
        HOSTNAME: "0.0.0.0",
        PORT: 3000,
      },
    },
  ],
};

