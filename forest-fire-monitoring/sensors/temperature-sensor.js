import mqtt from 'mqtt';

const client = mqtt.connect(process.env.MQTT_URL || 'mqtt://localhost:1883');
const topic = 'sensors/temperature';

client.on('connect', () => {
  console.log('temp sensor connected');
  setInterval(() => {
    const value = Number((Math.random() * 25 + 25).toFixed(2)); // 25-50 C
    const msg = { sensorId: 'temp_001', value, ts: Date.now(), unit: 'C' };
    client.publish(topic, JSON.stringify(msg));
  }, 2000);
});
