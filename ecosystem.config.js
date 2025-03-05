module.exports = {
  apps: [{
    name: "angular-app",
    script: "node_modules/.bin/ng",
    args: "serve --host 0.0.0.0 --port 4200",
    cwd: "/root/human_resources"
  }]
}