// Interval ref
let intervalId: any = null;

export function postSession(
  serverUrl: string,
  sessionID: string,
  localPartyID: string
) {
  return fetch(`${serverUrl}/${sessionID}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify([localPartyID]),
  });
}
export function joinSession(
  serverURL: string,
  sessionID: string,
  localPartyID: string
) {
  return fetch(`${serverURL}/${sessionID}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify([localPartyID]),
  });
}
export function getSession(serverUrl: string, sessionID: string) {
  return fetch(`${serverUrl}/${sessionID}`);
}

export function startSession(
  serverURL: string,
  sessionID: string,
  devices: string[]
) {
  console.log('serverURL:', serverURL);
  console.log('sessionID:', sessionID);
  console.log('devices:', devices);

  return fetch(`${serverURL}/start/${sessionID}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(devices),
  })
    .then(response => {
      console.log(response);
    })
    .catch(err => {
      console.error(err);
    });
}

export function checkForDevices(
  serverUrl: string,
  sessionID: string,
  setDevices: (devices: string[]) => void
) {
  clearCheckingInterval();
  intervalId = setInterval(async () => {
    try {
      const response = await getSession(serverUrl, sessionID);
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
