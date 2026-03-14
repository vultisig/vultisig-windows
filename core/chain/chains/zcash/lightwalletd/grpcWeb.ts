type GrpcWebInput = {
  baseUrl: string
  service: string
  method: string
  requestBytes: Uint8Array
}

const encodeFrame = (data: Uint8Array): Uint8Array => {
  const frame = new Uint8Array(5 + data.length)
  frame[0] = 0x00
  const view = new DataView(frame.buffer)
  view.setUint32(1, data.length, false)
  frame.set(data, 5)
  return frame
}

const decodeFrames = (
  buffer: Uint8Array
): { data: Uint8Array | null; trailers: string } => {
  let data: Uint8Array | null = null
  let trailers = ''
  let offset = 0

  while (offset < buffer.length) {
    const flag = buffer[offset]
    const view = new DataView(buffer.buffer, buffer.byteOffset + offset + 1, 4)
    const length = view.getUint32(0, false)
    const payload = buffer.slice(offset + 5, offset + 5 + length)
    offset += 5 + length

    if (flag === 0x00) {
      data = payload
    } else if (flag === 0x80) {
      trailers = new TextDecoder().decode(payload)
    }
  }

  return { data, trailers }
}

const decodeAllFrames = (
  buffer: Uint8Array
): { dataFrames: Uint8Array[]; trailers: string } => {
  const dataFrames: Uint8Array[] = []
  let trailers = ''
  let offset = 0

  while (offset < buffer.length) {
    const flag = buffer[offset]
    const view = new DataView(buffer.buffer, buffer.byteOffset + offset + 1, 4)
    const length = view.getUint32(0, false)
    const payload = buffer.slice(offset + 5, offset + 5 + length)
    offset += 5 + length

    if (flag === 0x00) {
      dataFrames.push(payload)
    } else if (flag === 0x80) {
      trailers = new TextDecoder().decode(payload)
    }
  }

  return { dataFrames, trailers }
}

const checkTrailers = (trailers: string) => {
  if (!trailers) return
  const statusMatch = trailers.match(/grpc-status:\s*(\d+)/)
  if (statusMatch && statusMatch[1] !== '0') {
    const msgMatch = trailers.match(/grpc-message:\s*(.+)/)
    const msg = msgMatch?.[1] ?? 'Unknown gRPC error'
    throw new Error(`gRPC error ${statusMatch[1]}: ${msg}`)
  }
}

type GoHttpPostRequest = {
  url: string
  headers: Record<string, string>
  body: string
}

type GoHttpPostResponse = {
  statusCode: number
  headers: Record<string, string>
  body: string
}

const uint8ToBase64 = (bytes: Uint8Array): string => {
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

const base64ToUint8 = (b64: string): Uint8Array => {
  const binary = atob(b64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

type GoPostFn = (req: GoHttpPostRequest) => Promise<GoHttpPostResponse>

const getGoHttpPost = (): GoPostFn | null => {
  try {
    const fn = (window as any)?.['go']?.['utils']?.['GoHttp']?.['Post']
    if (typeof fn === 'function') return fn as GoPostFn
  } catch {
    // Not in Wails environment
  }
  return null
}

export const isNativeGrpcAvailable = (): boolean => getGoHttpPost() !== null

const grpcWebFetchViaGo = async (
  goPost: GoPostFn,
  url: string,
  body: Uint8Array
): Promise<Uint8Array> => {
  const response = await goPost({
    url,
    headers: {
      'Content-Type': 'application/grpc',
      TE: 'trailers',
    },
    body: uint8ToBase64(body),
  })

  if (response.statusCode < 200 || response.statusCode >= 300) {
    throw new Error(`gRPC-web HTTP error: ${response.statusCode}`)
  }

  const grpcStatus = response.headers['grpc-status']
  if (grpcStatus && grpcStatus !== '0') {
    const grpcMessage = response.headers['grpc-message'] ?? 'Unknown gRPC error'
    throw new Error(`gRPC error ${grpcStatus}: ${grpcMessage}`)
  }

  return base64ToUint8(response.body)
}

const grpcWebFetchViaFetch = async (
  url: string,
  body: Uint8Array
): Promise<Uint8Array> => {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/grpc-web',
      'X-Grpc-Web': '1',
    },
    body: body.buffer as ArrayBuffer,
  })

  if (!response.ok) {
    throw new Error(`gRPC-web HTTP error: ${response.status}`)
  }

  const grpcStatus = response.headers.get('grpc-status')
  if (grpcStatus && grpcStatus !== '0') {
    const grpcMessage =
      response.headers.get('grpc-message') ?? 'Unknown gRPC error'
    throw new Error(`gRPC error ${grpcStatus}: ${grpcMessage}`)
  }

  return new Uint8Array(await response.arrayBuffer())
}

const grpcWebFetch = async ({
  baseUrl,
  service,
  method,
  requestBytes,
}: GrpcWebInput): Promise<Uint8Array> => {
  const url = `${baseUrl}/${service}/${method}`
  const body = encodeFrame(requestBytes)

  const goPost = getGoHttpPost()
  if (goPost) {
    return grpcWebFetchViaGo(goPost, url, body)
  }

  return grpcWebFetchViaFetch(url, body)
}

export const grpcWebUnary = async (
  input: GrpcWebInput
): Promise<Uint8Array> => {
  const responseBuffer = await grpcWebFetch(input)
  const { data, trailers } = decodeFrames(responseBuffer)

  checkTrailers(trailers)

  if (!data) {
    throw new Error('No data frame in gRPC-web response')
  }

  return data
}

export const grpcWebUnaryWithFallback = async (
  inputs: GrpcWebInput[]
): Promise<Uint8Array> => {
  let lastError: Error | null = null

  for (const input of inputs) {
    try {
      return await grpcWebUnary(input)
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err))
      console.warn(
        `lightwalletd ${input.baseUrl}/${input.method} failed:`,
        lastError.message
      )
    }
  }

  throw lastError ?? new Error('All lightwalletd endpoints failed')
}

const grpcWebServerStream = async (
  input: GrpcWebInput
): Promise<Uint8Array[]> => {
  const responseBuffer = await grpcWebFetch(input)
  const { dataFrames, trailers } = decodeAllFrames(responseBuffer)

  checkTrailers(trailers)

  return dataFrames
}

export const grpcWebServerStreamWithFallback = async (
  inputs: GrpcWebInput[]
): Promise<Uint8Array[]> => {
  let lastError: Error | null = null

  for (const input of inputs) {
    try {
      return await grpcWebServerStream(input)
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err))
      console.warn(
        `lightwalletd ${input.baseUrl}/${input.method} failed:`,
        lastError.message
      )
    }
  }

  throw lastError ?? new Error('All lightwalletd endpoints failed')
}
