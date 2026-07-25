import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import dlnacasts from 'dlnacasts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// --- DLNA SSDP Discovery & State Bridge ---
interface DLNADeviceInfo {
  id: string;
  name: string;
  host: string;
  type: string;
  isVirtual?: boolean;
  status: 'idle' | 'playing' | 'paused' | 'stopped';
  volume: number; // 0-100
  currentTime: number;
  duration: number;
  currentTrack?: {
    title: string;
    artist: string;
    album: string;
    url: string;
  };
}

const discoveredDevices = new Map<string, any>();
const virtualDevices: DLNADeviceInfo[] = [
  {
    id: 'dlna-virt-1',
    name: 'Living Room Smart TV (DLNA)',
    host: '192.168.1.105',
    type: 'tv',
    isVirtual: true,
    status: 'idle',
    volume: 80,
    currentTime: 0,
    duration: 180,
  },
  {
    id: 'dlna-virt-2',
    name: 'Hi-Fi Audio Receiver (DLNA/UPnP)',
    host: '192.168.1.120',
    type: 'speaker',
    isVirtual: true,
    status: 'idle',
    volume: 65,
    currentTime: 0,
    duration: 210,
  },
];

let activeDLNADeviceId: string = 'local';
let activePlaybackTimer: NodeJS.Timeout | null = null;

// Initialize dlnacasts SSDP listener
try {
  const casts = dlnacasts();

  casts.on('update', (player: any) => {
    const devId = `dlna-net-${player.host.replace(/\./g, '-')}`;
    discoveredDevices.set(devId, {
      id: devId,
      name: player.name || `DLNA Device (${player.host})`,
      host: player.host,
      type: player.type || 'renderer',
      isVirtual: false,
      playerInstance: player,
      status: 'idle',
      volume: 75,
      currentTime: 0,
      duration: 0,
    });
    console.log(`[DLNA SSDP] Discovered DLNA renderer: ${player.name} at ${player.host}`);
  });
} catch (err) {
  console.warn('[DLNA Bridge] SSDP discovery initialization notice:', err);
}

// REST API Endpoints

// 1. Get Discovered DLNA Devices
app.get('/api/dlna/devices', (_req, res) => {
  const realList = Array.from(discoveredDevices.values()).map(({ playerInstance, ...rest }) => rest);
  const allDevices = [
    {
      id: 'local',
      name: 'Local Browser Audio Player',
      host: 'localhost',
      type: 'browser',
      isVirtual: false,
      status: 'playing',
      volume: 100,
      currentTime: 0,
      duration: 0,
    },
    ...realList,
    ...virtualDevices,
  ];

  res.json({
    activeDeviceId: activeDLNADeviceId,
    devices: allDevices,
  });
});

// 2. Play Track on DLNA Device
app.post('/api/dlna/play', (req, res) => {
  const { deviceId, track, position = 0, volume = 80 } = req.body;
  activeDLNADeviceId = deviceId || 'local';

  // Handle physical SSDP discovered device
  if (discoveredDevices.has(deviceId)) {
    const dev = discoveredDevices.get(deviceId);
    if (dev && dev.playerInstance) {
      try {
        dev.playerInstance.play(track.audioUrl, {
          title: track.title,
          artist: track.artist,
          album: track.album,
          seek: position,
        });
        dev.status = 'playing';
        dev.currentTrack = track;
        dev.volume = volume;
        return res.json({ success: true, message: `Streaming to ${dev.name}`, device: dev });
      } catch (err) {
        console.warn('DLNA play command failed on hardware, falling back to simulated bridge state:', err);
      }
    }
  }

  // Handle virtual DLNA device state simulation
  const virtDev = virtualDevices.find((v) => v.id === deviceId);
  if (virtDev) {
    virtDev.status = 'playing';
    virtDev.currentTrack = track;
    virtDev.currentTime = position;
    virtDev.duration = track?.duration || 180;
    virtDev.volume = volume;

    if (activePlaybackTimer) clearInterval(activePlaybackTimer);
    activePlaybackTimer = setInterval(() => {
      if (virtDev.status === 'playing') {
        virtDev.currentTime += 1;
        if (virtDev.currentTime >= virtDev.duration) {
          virtDev.currentTime = 0;
          virtDev.status = 'stopped';
          if (activePlaybackTimer) clearInterval(activePlaybackTimer);
        }
      }
    }, 1000);

    return res.json({
      success: true,
      message: `DLNA Remote Play started on ${virtDev.name}`,
      device: virtDev,
    });
  }

  res.json({ success: true, message: 'Local audio output active', deviceId: 'local' });
});

// 3. Pause DLNA Device
app.post('/api/dlna/pause', (req, res) => {
  const { deviceId } = req.body;

  if (discoveredDevices.has(deviceId)) {
    const dev = discoveredDevices.get(deviceId);
    if (dev?.playerInstance) {
      dev.playerInstance.pause();
      dev.status = 'paused';
    }
  }

  const virtDev = virtualDevices.find((v) => v.id === deviceId);
  if (virtDev) {
    virtDev.status = 'paused';
  }

  res.json({ success: true, message: 'DLNA playback paused' });
});

// 4. Resume DLNA Device
app.post('/api/dlna/resume', (req, res) => {
  const { deviceId } = req.body;

  if (discoveredDevices.has(deviceId)) {
    const dev = discoveredDevices.get(deviceId);
    if (dev?.playerInstance) {
      dev.playerInstance.resume();
      dev.status = 'playing';
    }
  }

  const virtDev = virtualDevices.find((v) => v.id === deviceId);
  if (virtDev) {
    virtDev.status = 'playing';
  }

  res.json({ success: true, message: 'DLNA playback resumed' });
});

// 5. Seek DLNA Device
app.post('/api/dlna/seek', (req, res) => {
  const { deviceId, time } = req.body;

  if (discoveredDevices.has(deviceId)) {
    const dev = discoveredDevices.get(deviceId);
    if (dev?.playerInstance) {
      dev.playerInstance.seek(time);
      dev.currentTime = time;
    }
  }

  const virtDev = virtualDevices.find((v) => v.id === deviceId);
  if (virtDev) {
    virtDev.currentTime = time;
  }

  res.json({ success: true, message: `Seeked to ${time}s` });
});

// 6. Volume Control
app.post('/api/dlna/volume', (req, res) => {
  const { deviceId, volume } = req.body; // 0 - 100

  if (discoveredDevices.has(deviceId)) {
    const dev = discoveredDevices.get(deviceId);
    if (dev?.playerInstance) {
      dev.playerInstance.volume(volume / 100);
      dev.volume = volume;
    }
  }

  const virtDev = virtualDevices.find((v) => v.id === deviceId);
  if (virtDev) {
    virtDev.volume = volume;
  }

  res.json({ success: true, volume });
});

// 7. Get Device Status
app.get('/api/dlna/status/:deviceId', (req, res) => {
  const { deviceId } = req.params;

  if (discoveredDevices.has(deviceId)) {
    const dev = discoveredDevices.get(deviceId);
    return res.json({ success: true, device: dev });
  }

  const virtDev = virtualDevices.find((v) => v.id === deviceId);
  if (virtDev) {
    return res.json({ success: true, device: virtDev });
  }

  res.json({ success: true, deviceId: 'local', status: 'playing' });
});

// --- Vite Integration & Express Server Initialization ---
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🎵 Harmony Music Player & DLNA Bridge running on http://localhost:${PORT}`);
  });
}

startServer();
