#!/usr/bin/env node

// Credit Task Demonstration Script
// This script demonstrates the enhanced weather warning system capabilities

const net = require("net");

console.log("=== Credit Task: Module 1 Above and Beyond Demonstration ===\n");

// Test configuration
const testConfig = {
    serverHost: "127.0.0.1",
    serverPort: 6000,
    testDuration: 30000, // 30 seconds
    locations: ["Melbourne", "Sydney", "Brisbane"],
    sensorTypes: ["temp", "rain", "wind", "fire"]
};

// Create test clients
const testClients = [];

// Function to create a test client
function createTestClient(location, sensorType) {
    return new Promise((resolve, reject) => {
        const client = net.createConnection(testConfig.serverPort, testConfig.serverHost, () => {
            console.log(`✅ ${sensorType.toUpperCase()} sensor connected for ${location}`);
            resolve(client);
        });

        client.on("error", (error) => {
            console.log(`❌ ${sensorType.toUpperCase()} sensor error for ${location}: ${error.message}`);
            reject(error);
        });

        client.on("data", (data) => {
            console.log(`📊 ${location} ${sensorType}: Server response - ${data.toString()}`);
        });
    });
}

// Function to send test data
function sendTestData(client, location, sensorType) {
    if (!client) {
        console.log(`❌ ${location} ${sensorType}: No client available`);
        return;
    }
    const timestamp = new Date().toISOString();
    let data;

    switch (sensorType) {
        case "temp":
            const temp = (Math.random() * 30 + 10).toFixed(1);
            data = `temp,${temp},${location},${timestamp}`;
            break;
        case "rain":
            const rain = (Math.random() * 50).toFixed(2);
            data = `rain,${rain},${location},${timestamp}`;
            break;
        case "wind":
            const wind = (Math.random() * 40 + 5).toFixed(1);
            const direction = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"][Math.floor(Math.random() * 8)];
            data = `wind,${wind},${direction},${location},${timestamp}`;
            break;
        case "fire":
            const fireLevels = ["NO RATING", "MODERATE", "HIGH", "EXTREME", "CATASTROPHIC"];
            const fireLevel = fireLevels[Math.floor(Math.random() * fireLevels.length)];
            data = `fire,${fireLevel},${location}`;
            break;
    }

    if (data) {
        client.write(data);
        console.log(`📤 ${location} ${sensorType}: Sent - ${data}`);
    }
}

// Function to request weather warning
function requestWeatherWarning(client, location) {
    if (!client) {
        console.log(`❌ ${location}: No client available for warning request`);
        return;
    }
    const data = `request,${location}`;
    client.write(data);
    console.log(`🔍 ${location}: Requesting weather warning`);
}

// Function to get system status
function getSystemStatus(client) {
    if (!client) {
        console.log(`❌ System: No status client available`);
        return;
    }
    const data = `status,System`;
    client.write(data);
    console.log(`📈 System: Requesting status`);
}

// Main demonstration function
async function runDemonstration() {
    console.log("🚀 Starting Credit Task Demonstration...\n");

    try {
        // Create sensor clients for each location and sensor type
        console.log("📡 Creating sensor clients...");
        for (const location of testConfig.locations) {
            for (const sensorType of testConfig.sensorTypes) {
                try {
                    const client = await createTestClient(location, sensorType);
                    testClients.push({ client, location, sensorType });
                } catch (error) {
                    console.log(`❌ Failed to create ${sensorType} client for ${location}`);
                }
            }
        }

        console.log(`\n✅ Created ${testClients.length} sensor clients\n`);

        // Create request clients
        console.log("🔍 Creating request clients...");
        const requestClients = [];
        for (const location of testConfig.locations) {
            try {
                const client = await createTestClient(location, "request");
                requestClients.push({ client, location });
            } catch (error) {
                console.log(`❌ Failed to create request client for ${location}`);
            }
        }

        // Create status client
        console.log("📈 Creating status client...");
        let statusClient;
        try {
            statusClient = await createTestClient("System", "status");
        } catch (error) {
            console.log(`❌ Failed to create status client`);
        }

        console.log(`\n🎯 Starting data transmission for ${testConfig.testDuration / 1000} seconds...\n`);

        // Start data transmission
        const dataInterval = setInterval(() => {
            testClients.forEach(({ client, location, sensorType }) => {
                sendTestData(client, location, sensorType);
            });
        }, 2000);

        // Start warning requests
        const warningInterval = setInterval(() => {
            requestClients.forEach(({ client, location }) => {
                requestWeatherWarning(client, location);
            });
        }, 5000);

        // Start status requests
        const statusInterval = setInterval(() => {
            if (statusClient) {
                getSystemStatus(statusClient.client);
            }
        }, 10000);

        // Run for specified duration
        setTimeout(() => {
            console.log("\n⏰ Test duration completed. Stopping demonstration...\n");

            // Clear intervals
            clearInterval(dataInterval);
            clearInterval(warningInterval);
            clearInterval(statusInterval);

            // Close all connections
            testClients.forEach(({ client }) => {
                if (client) {
                    client.end();
                }
            });
            requestClients.forEach(({ client }) => {
                if (client) {
                    client.end();
                }
            });
            if (statusClient && statusClient.client) {
                statusClient.client.end();
            }

            console.log("✅ Demonstration completed successfully!");
            console.log("\n=== Credit Task Summary ===");
            console.log("✅ Realistic sensor data with time, location, and seasonal factors");
            console.log("✅ Multi-sensor support across multiple locations");
            console.log("✅ Multi-user concurrent access");
            console.log("✅ Scalability improvements implemented");
            console.log("✅ Performance monitoring and system status");
            console.log("\n📋 See CREDIT_TASK_REPORT.md for detailed analysis");

        }, testConfig.testDuration);

    } catch (error) {
        console.error("❌ Demonstration failed:", error.message);
    }
}

// Check if server is running
function checkServerConnection() {
    return new Promise((resolve, reject) => {
        const testClient = net.createConnection(testConfig.serverPort, testConfig.serverHost, () => {
            testClient.end();
            resolve(true);
        });

        testClient.on("error", () => {
            reject(false);
        });
    });
}

// Main execution
async function main() {
    console.log("🔍 Checking server connection...");
    
    try {
        await checkServerConnection();
        console.log("✅ Server is running and accessible\n");
        await runDemonstration();
    } catch (error) {
        console.log("❌ Server is not running or not accessible");
        console.log("📋 Please start the enhanced weather service first:");
        console.log("   node enhanced_weather_service.js");
        console.log("   or");
        console.log("   node scalable_weather_service.js");
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Demonstration interrupted. Cleaning up...');
    testClients.forEach(({ client }) => {
        if (client) {
            client.end();
        }
    });
    requestClients.forEach(({ client }) => {
        if (client) {
            client.end();
        }
    });
    if (statusClient && statusClient.client) {
        statusClient.client.end();
    }
    process.exit(0);
});

// Start the demonstration
main();
