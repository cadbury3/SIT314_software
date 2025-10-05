import aedes from 'aedes';
import net from 'net';

const port = Number(process.env.MQTT_PORT || 1883);
const broker = aedes();
const server = net.createServer(broker.handle);

server.listen(port, () => {
  // Minimal log
  console.log(`MQTT broker listening on ${port}`);
});

broker.on('client', (client) => {
  console.log(`client connected: ${client?.id || 'unknown'}`);
});

broker.on('clientDisconnect', (client) => {
  console.log(`client disconnected: ${client?.id || 'unknown'}`);
});

broker.on('publish', (packet, client) => {
  if (packet?.topic?.startsWith('sensors/')) {
    console.log(`msg ${packet.topic}`);
  }
});
