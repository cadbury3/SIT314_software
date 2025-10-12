# Deployment steps (AWS EC2 + ALB + MongoDB Atlas)

1) MongoDB
- Create Atlas free/shared cluster
- Create database user and get SRV connection string (`MONGO_URI`)
- Add EC2 public IPs or VPC peering as needed

2) Two EC2 instances
- Ubuntu 22.04 or Amazon Linux 2023
- Security Group A: inbound 80 from SG-B (ALB), 22 from your IP
- Install Node 18+, PM2, NGINX
- Copy project to `/opt/module5`, create `.env` with `PORT=3000` and `MONGO_URI`
- `npm ci` then `pm2 start ecosystem.config.cjs && pm2 save`
- Configure NGINX using `nginx.sample` and restart
- Verify `curl http://localhost/health` returns 200

3) Application Load Balancer
- Create ALB (public) with Security Group B (allow 80 from Internet)
- Create Target Group HTTP:80, health check path `/health`, success code 200
- Register both EC2 instances (port 80)
- After healthy, open ALB DNS in browser; observe responses alternating (hostname shows instance)

4) Evidence to capture
- Screenshots: target group healthy targets, ALB DNS response, MongoDB collection with created readings, PM2 list

5) Client sensors
- Use the simulator: on your laptop set `API_BASE_URL=http://<ALB-DNS>` then `npm run sensor`
- Or deploy simulator on separate clients to demonstrate multiple senders

6) Notes
- The API is stateless; only Atlas stores state. Adding/removing instances behind ALB does not lose data.
- Health endpoint validates DB connectivity; ALB deregisters unhealthy instances automatically.
