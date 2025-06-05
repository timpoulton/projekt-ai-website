import OBSWebSocket from 'obs-websocket-js';
import 'dotenv/config';

async function testObsConnection() {
    console.log('\n=== OBS WebSocket Connection Test ===');
    console.log('Attempting to connect to OBS WebSocket server...');
    
    const obs = new OBSWebSocket();
    const testAddresses = [
        '127.0.0.1',
        'localhost',
        process.env.OBS_IP || '192.168.68.14'
    ];
    
    const port = process.env.OBS_PORT || '4444';
    let connected = false;
    
    for (const ip of testAddresses) {
        try {
            console.log(`\nTrying connection to ws://${ip}:${port}`);
            const result = await obs.connect(`ws://${ip}:${port}`);
            console.log(`✅ Connected successfully to OBS at ${ip}:${port}`);
            console.log('OBS Version:', result.obsVersion);
            console.log('WebSocket Version:', result.obsWebSocketVersion);
            
            // Try to get recording status
            try {
                const status = await obs.call('GetRecordStatus');
                console.log(`Recording Status: ${status.outputActive ? 'Active' : 'Inactive'}`);
            } catch (err) {
                console.log(`Could not get recording status: ${err.message}`);
            }
            
            // Disconnect
            await obs.disconnect();
            console.log('Disconnected from OBS successfully');
            connected = true;
            break;
        } catch (err) {
            console.log(`❌ Failed to connect to OBS at ${ip}:${port}:`);
            console.log(`   Error: ${err.message}`);
        }
    }
    
    if (!connected) {
        console.log('\n❌ Failed to connect to OBS with any of the tested addresses');
        console.log('\nTroubleshooting tips:');
        console.log('1. Make sure OBS is running');
        console.log('2. Enable WebSocket server in OBS (Tools > WebSocket Server Settings)');
        console.log('3. Ensure the port is correct (default is 4444)');
        console.log('4. Check if there are any firewall issues');
        console.log('5. Verify the IP address is correct in your .env file');
    }
}

// Run the test
testObsConnection().catch(err => {
    console.error('Unhandled error:', err);
}); 