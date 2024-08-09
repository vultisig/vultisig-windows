import { ENDPOINTS } from '../../utils/config';
// Interval ref
let intervalId: any = null;

export function postSession(
  isRelay: boolean,
  sessionID: string,
  serviceName: string
) {
  return fetch(
    `${
      isRelay ? ENDPOINTS.VULTISIG_RELAY : ENDPOINTS.LOCAL_MEDIATOR_URL
    }/${sessionID}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([serviceName]),
    }
  );
}

export function getSession(isRelay: boolean, sessionID: string) {
  return fetch(
    `${
      isRelay ? ENDPOINTS.VULTISIG_RELAY : ENDPOINTS.LOCAL_MEDIATOR_URL
    }/${sessionID}`
  );
}

export function startkeygen(
  isRelay: boolean,
  sessionID: string,
  devices: string[]
) {
  return fetch(
    `${
      isRelay ? ENDPOINTS.VULTISIG_RELAY : ENDPOINTS.LOCAL_MEDIATOR_URL
    }/start/${sessionID}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(devices),
    }
  );
}

export function checkForDevices(
  isRelay: boolean,
  sessionID: string,
  setDevices: (devices: string[]) => void
) {
  clearCheckingInterval();
  intervalId = setInterval(async () => {
    try {
      const response = await getSession(isRelay, sessionID);
      try {
        const data = (await response.json()) as string[];
        const uniqueDevices: any = Array.from(new Set(data));
        if (uniqueDevices.length > 0) {
          uniqueDevices.shift();
          setDevices(uniqueDevices);
        }
      } catch (err) {
        console.error(err);
      }
    } catch (err) {
      console.error(err);
    }
  }, 5000);
}

// clear interval
export function clearCheckingInterval() {
  if (intervalId) clearInterval(intervalId);
}
